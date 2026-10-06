const { app, request, startDb, stopDb, clearDb, seed, loginAs, installFakeLlm, PASSWORD } = require("./helpers");
const User = require("../src/models/user");
const Interview = require("../src/models/interview");
const CodingInterview = require("../src/models/codingInterview");
const { istDayRange } = require("../src/lib/time");

let s;
beforeAll(async () => {
  await startDb();
  installFakeLlm();
});
afterAll(stopDb);
beforeEach(async () => {
  await clearDb();
  s = await seed();
});

describe("brute-force limits hold under parallel requests", () => {
  test("parallel OTP guesses cannot exceed 5 attempts", async () => {
    const mailer = require("../src/services/mailer");
    let text = "";
    jest.spyOn(mailer, "sendMail").mockImplementation(async (o) => {
      text = o.text;
      return true;
    });
    await request(app).post("/backend/api/send-otp").send({ roll_no: s.studentA.roll_no }).expect(200);
    const otp = text.match(/(\d{6})/)[1];
    const wrong = otp === "123456" ? "654321" : "123456";
    await Promise.all(
      Array.from({ length: 15 }, () => request(app).post("/backend/api/check-otp").send({ roll_no: s.studentA.roll_no, otp: wrong }))
    );
    const u = await User.findById(s.studentA._id).select("+otp_attempts +otp_hash").lean();
    expect(u.otp_attempts).toBeLessThanOrEqual(5);
    // the right code no longer works after the limit
    expect((await request(app).post("/backend/api/check-otp").send({ roll_no: s.studentA.roll_no, otp })).status).not.toBe(200);
    jest.restoreAllMocks();
  });

  test("OTP resend is capped per hour without revealing the account", async () => {
    const mailer = require("../src/services/mailer");
    const spy = jest.spyOn(mailer, "sendMail").mockResolvedValue(true);
    for (let i = 0; i < 8; i++) {
      // eslint-disable-next-line no-await-in-loop
      await User.updateOne({ _id: s.studentA._id }, { $unset: { otp_last_sent_at: "" } });
      // eslint-disable-next-line no-await-in-loop
      expect((await request(app).post("/backend/api/send-otp").send({ roll_no: s.studentA.roll_no })).status).toBe(200);
    }
    expect(spy).toHaveBeenCalledTimes(5);
    jest.restoreAllMocks();
  });

  test("parallel wrong passwords still lock the account", async () => {
    await Promise.all(
      Array.from({ length: 12 }, () => request(app).post("/backend/api/login").send({ roll_no: s.studentA.roll_no, password: "wrong" }))
    );
    const res = await request(app).post("/backend/api/login").send({ roll_no: s.studentA.roll_no, password: PASSWORD });
    expect(res.status).toBe(429);
  });
});

describe("interview session integrity", () => {
  const startCoding = async () => {
    const iv = await CodingInterview.create({
      platform: "web", roll_no: s.studentA.roll_no, tenant_id: s.tenantA._id, start_date_time: new Date(Date.now() - 60000),
      level: "easy", questions_count: "1", status: 1,
    });
    const agent = await loginAs(s.studentA);
    const st = await agent.post("/backend/api/interview-session/start").send({ interview_id: String(iv._id), interview_type: "coding" });
    return { iv, token: st.body.attempt_token, base: { interview_id: String(iv._id), interview_type: "coding", question_id: "q1" } };
  };

  test("parallel idea checks cannot exceed the limit", async () => {
    const { iv, token, base } = await startCoding();
    const results = await Promise.all(
      Array.from({ length: 12 }, () =>
        request(app).post("/backend/api/interview-session/analyze-idea").set("X-Attempt-Token", token).send({ ...base, idea: "hash map" })
      )
    );
    expect(results.filter((r) => r.status === 200).length).toBe(5);
    const doc = await CodingInterview.findById(iv._id).lean();
    expect(doc.idea_checks[0].attempts).toBe(5);
  });

  test("a late autosave cannot overwrite a final answer", async () => {
    const iv = await Interview.create({
      platform: "web", roll_no: s.studentA.roll_no, tenant_id: s.tenantA._id, technology: s.tech._id, module: [s.mod._id],
      start_date_time: new Date(Date.now() - 60000), level: "easy", questions_count: "2", status: 1,
    });
    const agent = await loginAs(s.studentA);
    const st = await agent.post("/backend/api/interview-session/start").send({ interview_id: String(iv._id), interview_type: "ai generated" });
    const post = (body) =>
      request(app).post("/backend/api/interview-session/answer").set("X-Attempt-Token", st.body.attempt_token)
        .send({ interview_id: String(iv._id), interview_type: "ai generated", question_id: "q1", ...body });
    expect((await post({ answer: "final full answer", final: true })).status).toBe(200);
    const late = await post({ answer: "partial" });
    expect(late.status).toBe(200);
    expect(late.body.ignored).toBe(true);
    const doc = await Interview.findById(iv._id).lean();
    expect(doc.answers[0].answer).toBe("final full answer");
    // resume reports which answers are final
    const again = await agent.post("/backend/api/interview-session/start").send({ interview_id: String(iv._id), interview_type: "ai generated" });
    expect(again.body.answers[0].final).toBe(true);
  });

  test("failed question generation leaves a retry window instead of expiring", async () => {
    const evaluation = require("../src/services/evaluation");
    const spy = jest.spyOn(evaluation, "generateTechnologyQuestions").mockRejectedValueOnce(new Error("LLM down"));
    const iv = await Interview.create({
      platform: "web", roll_no: s.studentA.roll_no, tenant_id: s.tenantA._id, technology: s.tech._id, module: [s.mod._id],
      start_date_time: new Date(Date.now() - 4.9 * 60000), level: "easy", questions_count: "2", status: 1,
    });
    const agent = await loginAs(s.studentA);
    const body = { interview_id: String(iv._id), interview_type: "ai generated" };
    expect((await agent.post("/backend/api/interview-session/start").send(body)).status).toBe(502);
    // even past the normal 5-minute window the student can retry
    await Interview.updateOne({ _id: iv._id }, { $set: { start_date_time: new Date(Date.now() - 8 * 60000) } });
    expect((await agent.post("/backend/api/interview-session/start").send(body)).status).toBe(200);
    spy.mockRestore();
  });
});

describe("input validation", () => {
  test("practice endpoints reject query operators in ids", async () => {
    const agent = await loginAs(s.studentA);
    const res = await agent.post("/backend/api/add-favorite").send({ technology: { $ne: null }, question: { $gt: "" } });
    expect(res.status).toBe(400);
  });

  test("practice scoring is capped per day", async () => {
    const LiteInterview = require("../src/models/liteInterview");
    await LiteInterview.insertMany(Array.from({ length: 20 }, () => ({ roll_no: s.studentA.roll_no, level: "x" })));
    const agent = await loginAs(s.studentA);
    const res = await agent.post("/backend/api/get-lite-interview-accuracy").send({ questions: [{ question: "q", answer: "a" }] });
    expect(res.status).toBe(429);
  });

  test("invalid list date is a 400, not a 500", async () => {
    const agent = await loginAs(s.adminA, { admin: true });
    const res = await agent.get(`/backend/api/get-all-interviewee-details/${s.tenantA._id}?date=notadate`);
    expect(res.status).toBe(400);
  });
});

describe("IST day windows", () => {
  test("a day is 00:00-23:59:59.999 in India", () => {
    const { start, end } = istDayRange("2026-10-05");
    expect(start.toISOString()).toBe("2026-10-04T18:30:00.000Z");
    expect(end.toISOString()).toBe("2026-10-05T18:29:59.999Z");
  });

  test("an interview at 02:00 IST is listed on its IST date", async () => {
    await Interview.create({
      platform: "web", roll_no: s.studentA.roll_no, tenant_id: s.tenantA._id, technology: s.tech._id, module: [s.mod._id],
      start_date_time: new Date("2026-10-04T20:30:00.000Z"), // 02:00 IST on Oct 5
      level: "easy", questions_count: "2", status: 1,
    });
    const agent = await loginAs(s.adminA, { admin: true });
    const day5 = await agent.get(`/backend/api/get-all-interviewee-details/${s.tenantA._id}?date=2026-10-05`);
    const day4 = await agent.get(`/backend/api/get-all-interviewee-details/${s.tenantA._id}?date=2026-10-04`);
    expect(day5.body.length).toBe(1);
    expect(day4.body.length).toBe(0);
  });
});
