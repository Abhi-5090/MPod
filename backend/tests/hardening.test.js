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

  test("failed question preparation leaves a retry window instead of expiring", async () => {
    // No coding problems exist for this level yet, so preparation fails.
    const iv = await CodingInterview.create({
      platform: "web", roll_no: s.studentA.roll_no, tenant_id: s.tenantA._id, start_date_time: new Date(Date.now() - 4.9 * 60000),
      level: "hard", questions_count: "1", status: 1,
    });
    const agent = await loginAs(s.studentA);
    const body = { interview_id: String(iv._id), interview_type: "coding" };
    expect((await agent.post("/backend/api/interview-session/start").send(body)).status).toBe(409);
    const CodingQuestion = require("../src/models/codingQuestion");
    await CodingQuestion.create({ problem_name: "Hard one", complexity: "hard", time: 20, description: "x", status: 1 });
    // even past the normal 5-minute window the student can retry
    await CodingInterview.updateOne({ _id: iv._id }, { $set: { start_date_time: new Date(Date.now() - 8 * 60000) } });
    expect((await agent.post("/backend/api/interview-session/start").send(body)).status).toBe(200);
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

describe("AI outage: the interview flow keeps working", () => {
  const evaluation = require("../src/services/evaluation");
  const queue = require("../src/services/evaluationQueue");
  const outage = () => Object.assign(new Error("401 Missing scopes: model.request"), { status: 401 });
  afterEach(() => jest.restoreAllMocks());

  const techInterview = () =>
    Interview.create({
      platform: "web", roll_no: s.studentA.roll_no, tenant_id: s.tenantA._id, technology: s.tech._id, module: [s.mod._id],
      topic: [s.topic._id], start_date_time: new Date(Date.now() - 60000), level: "easy", questions_count: "3", status: 1,
    });

  test("questions fall back to the bank and syllabus templates", async () => {
    jest.spyOn(evaluation, "generateTechnologyQuestions").mockRejectedValue(outage());
    const LiteInterviewQuestion = require("../src/models/liteInterviewQuestion");
    await LiteInterviewQuestion.create({ technology: s.tech._id, question: "What is the JVM?", answer: "x", status: 1 });
    const iv = await techInterview();
    const agent = await loginAs(s.studentA);
    const st = await agent.post("/backend/api/interview-session/start").send({ interview_id: String(iv._id), interview_type: "ai generated" });
    expect(st.status).toBe(200);
    expect(st.body.questions).toHaveLength(3);
    const texts = st.body.questions.map((q) => q.question);
    expect(texts).toContain("What is the JVM?");
    expect(texts.some((t) => t.includes("Inheritance"))).toBe(true);
    expect(st.body.questions[0].source).toBeUndefined();
  });

  test("while the AI is down a provisional score is given, then replaced by the AI score", async () => {
    const iv = await techInterview();
    const agent = await loginAs(s.studentA);
    const st = await agent.post("/backend/api/interview-session/start").send({ interview_id: String(iv._id), interview_type: "ai generated" });
    const qid = st.body.questions[0].id;
    await request(app).post("/backend/api/interview-session/answer").set("X-Attempt-Token", st.body.attempt_token)
      .send({ interview_id: String(iv._id), interview_type: "ai generated", question_id: qid, answer: "Inheritance lets a subclass reuse the fields and methods of a parent class, for example a Dog class extends Animal.", final: true });
    const spy = jest.spyOn(evaluation, "evaluateVerbalInterview").mockRejectedValue(outage());
    await request(app).post("/backend/api/interview-session/submit").set("X-Attempt-Token", st.body.attempt_token)
      .send({ interview_id: String(iv._id), interview_type: "ai generated" });
    for (let i = 0; i < 60 && (await Interview.findById(iv._id)).status !== 0; i++) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 50));
    }
    let doc = await Interview.findById(iv._id).lean();
    expect(doc.status).toBe(0);
    expect(doc.evaluation_mode).toBe("provisional");
    expect(doc.ai_rescore_pending).toBe(true);
    expect(doc.question_details).toHaveLength(3);
    expect(doc.question_details[0].accuracy).toBeGreaterThan(0);
    expect(doc.question_details[0].analysis).toMatch(/Provisional/);
    expect(doc.question_details[1].accuracy).toBe(0); // unanswered

    // the student report is available and labelled provisional
    const report = await agent.get(`/backend/api/get-question-details/${iv._id}/ai%20generated/${s.studentA.roll_no}`);
    expect(report.status).toBe(200);
    expect(report.body.evaluation_mode).toBe("provisional");
    // admins see it as attempted + provisional
    const admin = await loginAs(s.adminA, { admin: true });
    const day = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
    const row = (await admin.get(`/backend/api/get-all-interviewee-details/${s.tenantA._id}?date=${day}`)).body.find((r) => String(r._id) === String(iv._id));
    expect(row.interview_status).toBe("Attempted");
    expect(row.provisional).toBe(true);

    // AI comes back: staff re-score replaces the provisional result
    spy.mockRestore();
    expect((await admin.post("/backend/api/interview-session/retry-evaluation").send({ interview_id: String(iv._id), interview_type: "ai generated" })).status).toBe(200);
    for (let i = 0; i < 60 && (await Interview.findById(iv._id)).evaluation_mode !== "ai"; i++) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 50));
    }
    doc = await Interview.findById(iv._id).lean();
    expect(doc.evaluation_mode).toBe("ai");
    expect(doc.ai_rescore_pending).toBe(false);
    expect(doc.question_details[0].provisional).toBeUndefined();
    queue.stop();
  });

  test("coding interviews wait for the AI (no guessed code scores)", async () => {
    const CodingInterview = require("../src/models/codingInterview");
    const iv = await CodingInterview.create({
      platform: "web", roll_no: s.studentA.roll_no, tenant_id: s.tenantA._id, start_date_time: new Date(Date.now() - 60000),
      level: "easy", questions_count: "1", status: 1,
    });
    const agent = await loginAs(s.studentA);
    const st = await agent.post("/backend/api/interview-session/start").send({ interview_id: String(iv._id), interview_type: "coding" });
    await request(app).post("/backend/api/interview-session/answer").set("X-Attempt-Token", st.body.attempt_token)
      .send({ interview_id: String(iv._id), interview_type: "coding", question_id: "q1", answer: "def f(): return 1", final: true });
    jest.spyOn(evaluation, "evaluateCodingInterview").mockRejectedValue(outage());
    await request(app).post("/backend/api/interview-session/submit").set("X-Attempt-Token", st.body.attempt_token)
      .send({ interview_id: String(iv._id), interview_type: "coding" });
    for (let i = 0; i < 40 && !(await CodingInterview.findById(iv._id)).evaluation_waiting_for_ai; i++) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 50));
    }
    const doc = await CodingInterview.findById(iv._id).lean();
    expect(doc.status).toBe(1);
    expect(doc.evaluation_waiting_for_ai).toBe(true);
    queue.stop();
  });

  test("idea check is skipped (not blocking) while the AI is down", async () => {
    jest.spyOn(evaluation, "scoreIdea").mockRejectedValue(outage());
    const iv = await CodingInterview.create({
      platform: "web", roll_no: s.studentA.roll_no, tenant_id: s.tenantA._id, start_date_time: new Date(Date.now() - 60000),
      level: "easy", questions_count: "1", status: 1,
    });
    const agent = await loginAs(s.studentA);
    const st = await agent.post("/backend/api/interview-session/start").send({ interview_id: String(iv._id), interview_type: "coding" });
    const res = await request(app).post("/backend/api/interview-session/analyze-idea").set("X-Attempt-Token", st.body.attempt_token)
      .send({ interview_id: String(iv._id), interview_type: "coding", question_id: "q1", idea: "hash map" });
    expect(res.status).toBe(200);
    expect(res.body.unavailable).toBe(true);
    const doc = await CodingInterview.findById(iv._id).lean();
    expect(doc.idea_checks[0].attempts).toBe(0); // not used up
  });

  test("admins can see the AI status", async () => {
    const aiStatus = require("../src/services/aiStatus");
    aiStatus.recordFailure(outage());
    const admin = await loginAs(s.adminA, { admin: true });
    const res = await admin.get("/backend/api/system-status");
    expect(res.status).toBe(200);
    expect(res.body.ai.available).toBe(false);
    expect(res.body.ai.message).toMatch(/model\.request/);
    aiStatus.recordSuccess();
  });
});

describe("provisional scoring engine", () => {
  const { scoreAnswer, scoreInterview } = require("../src/services/provisionalScoring");
  const q = "What is Inheritance in Java? Explain it with an example.";
  test("a relevant, complete answer scores well; empty and off-topic answers score low", () => {
    const good = scoreAnswer({ question: q, answer: "Inheritance in Java lets a subclass reuse and extend the fields and methods of a parent class using extends. For example, class Dog extends Animal and inherits eat() while adding bark()." });
    const off = scoreAnswer({ question: q, answer: "I like to play cricket on weekends with my friends near the stadium in the evening." });
    const empty = scoreAnswer({ question: q, answer: "" });
    expect(good.accuracy).toBeGreaterThanOrEqual(60);
    expect(off.accuracy).toBeLessThan(30);
    expect(empty.accuracy).toBe(0);
    expect(good.provisional).toBe(true);
  });
  test("model answer similarity is used when available", () => {
    const reference = "The JVM is the Java Virtual Machine that executes Java bytecode and manages memory with garbage collection.";
    const close = scoreAnswer({ question: "What is the JVM?", answer: "The Java Virtual Machine runs compiled Java bytecode and handles memory through garbage collection on every platform.", reference });
    const far = scoreAnswer({ question: "What is the JVM?", answer: "It is a type of database used to store tables and rows for web applications.", reference });
    expect(close.accuracy).toBeGreaterThan(far.accuracy + 30);
  });
  test("overall analysis has the report shape", () => {
    const { results, overall } = scoreInterview([{ question: q, answer: "Subclass extends parent class." }, { question: q, answer: "" }]);
    expect(results).toHaveLength(2);
    expect(Object.keys(overall.interview_parameters)).toHaveLength(7);
    expect(overall.areas_of_improvement.join(" ")).toMatch(/not answered/);
  });
});
