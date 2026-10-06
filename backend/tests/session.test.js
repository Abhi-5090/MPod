const { app, request, startDb, stopDb, clearDb, seed, loginAs, installFakeLlm, llmCalls, PASSWORD } = require("./helpers");
const Interview = require("../src/models/interview");
const CodingInterview = require("../src/models/codingInterview");
const queue = require("../src/services/evaluationQueue");

let s;
beforeAll(async () => {
  await startDb();
  installFakeLlm();
});
afterAll(stopDb);
beforeEach(async () => {
  await clearDb();
  s = await seed();
  llmCalls.length = 0;
});

const waitFor = async (fn, ms = 5000) => {
  const end = Date.now() + ms;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    if (await fn()) return;
    if (Date.now() > end) throw new Error("timeout");
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 50));
  }
};

async function techInterview(extra = {}) {
  return Interview.create({
    platform: "web",
    roll_no: s.studentA.roll_no,
    tenant_id: s.tenantA._id,
    user_id: s.studentA._id,
    technology: s.tech._id,
    module: [s.mod._id],
    topic: [s.topic._id],
    start_date_time: new Date(Date.now() - 60000),
    level: "easy",
    questions_count: "3",
    status: 1,
    ...extra,
  });
}

describe("server-owned technology interview", () => {
  test("full flow: start -> answers saved -> submit -> background evaluation -> report", async () => {
    const iv = await techInterview();
    const agent = await loginAs(s.studentA);

    const start = await agent.post("/backend/api/interview-session/start").send({ interview_id: String(iv._id), interview_type: "ai generated" });
    expect(start.status).toBe(200);
    expect(start.body.questions).toHaveLength(3);
    expect(start.body.attempt_token).toBeTruthy();
    expect(start.body.questions[0].source_id).toBeUndefined();
    const token = start.body.attempt_token;
    const qs = start.body.questions;

    const save = (qid, answer) =>
      request(app).post("/backend/api/interview-session/answer").set("X-Attempt-Token", token)
        .send({ interview_id: String(iv._id), interview_type: "ai generated", question_id: qid, answer, time: 30 });
    expect((await save(qs[0].id, "a good answer")).status).toBe(200);
    expect((await save(qs[0].id, "a good answer, edited")).status).toBe(200); // overwrite, not duplicate
    expect((await save(qs[1].id, "meh")).status).toBe(200);
    expect((await save("q99", "x")).status).toBe(400); // only issued questions

    const stored = await Interview.findById(iv._id).lean();
    expect(stored.answers).toHaveLength(2);
    expect(stored.answers.find((a) => a.qid === qs[0].id).answer).toBe("a good answer, edited");

    const submit = await request(app).post("/backend/api/interview-session/submit").set("X-Attempt-Token", token)
      .send({ interview_id: String(iv._id), interview_type: "ai generated" });
    expect(submit.status).toBe(202);
    // duplicate submits are harmless
    const again = await request(app).post("/backend/api/interview-session/submit").set("X-Attempt-Token", token)
      .send({ interview_id: String(iv._id), interview_type: "ai generated" });
    expect(again.status).toBe(202);
    expect(again.body.already_submitted).toBe(true);

    await waitFor(async () => (await Interview.findById(iv._id)).status === 0);
    const done = await Interview.findById(iv._id).lean();
    expect(done.evaluation_status).toBe("completed");
    expect(done.question_details).toHaveLength(3);
    expect(done.question_details[0].accuracy).toBe(85);
    expect(done.question_details[2].accuracy).toBe(0); // unanswered
    // answers can no longer change
    expect((await save(qs[0].id, "late")).status).toBe(409);
    // scoring prompt fences the candidate answer as untrusted data
    const scoring = llmCalls.find((c) => c.messages[0].content.includes("evaluator of technical interview answers"));
    expect(scoring.messages[1].content).toContain("<candidate_answer>");

    const report = await agent.get(`/backend/api/get-question-details/${iv._id}/ai%20generated/${s.studentA.roll_no}`);
    expect(report.status).toBe(200);
    expect(report.body.question_details).toHaveLength(3);
    expect(JSON.stringify(report.body)).not.toContain("token_hash");
  });

  test("another student cannot start, read or answer someone else's interview", async () => {
    const iv = await techInterview();
    const other = await loginAs(s.studentA2);
    expect((await other.post("/backend/api/interview-session/start").send({ interview_id: String(iv._id), interview_type: "ai generated" })).status).toBe(404);
    expect((await other.get(`/backend/api/get-question-details/${iv._id}/ai%20generated/${s.studentA.roll_no}`)).status).toBe(404);
    const owner = await loginAs(s.studentA);
    await owner.post("/backend/api/interview-session/start").send({ interview_id: String(iv._id), interview_type: "ai generated" });
    const bad = await request(app).post("/backend/api/interview-session/answer").set("X-Attempt-Token", "forged")
      .send({ interview_id: String(iv._id), interview_type: "ai generated", question_id: "q1", answer: "x" });
    expect(bad.status).toBe(401);
  });

  test("college staff can read the report; another college cannot", async () => {
    const iv = await techInterview();
    const a = await loginAs(s.adminA, { admin: true });
    expect((await a.get(`/backend/api/get-question-details/${iv._id}/ai%20generated/${s.studentA.roll_no}`)).status).toBe(200);
    const b = await loginAs(s.adminB, { admin: true });
    expect((await b.get(`/backend/api/get-question-details/${iv._id}/ai%20generated/${s.studentA.roll_no}`)).status).toBe(404);
  });

  test("start window is enforced", async () => {
    const agent = await loginAs(s.studentA);
    const future = await techInterview({ start_date_time: new Date(Date.now() + 60 * 60000) });
    const r1 = await agent.post("/backend/api/interview-session/start").send({ interview_id: String(future._id), interview_type: "ai generated" });
    expect(r1.status).toBe(409);
    expect(r1.body.code).toBe("NOT_STARTED");
    await Interview.deleteMany({});
    const past = await techInterview({ start_date_time: new Date(Date.now() - 30 * 60000) });
    const r2 = await agent.post("/backend/api/interview-session/start").send({ interview_id: String(past._id), interview_type: "ai generated" });
    expect(r2.status).toBe(409);
    expect(r2.body.code).toBe("EXPIRED");
  });

  test("resume issues the same questions and a new token; old token stops working", async () => {
    const iv = await techInterview();
    const agent = await loginAs(s.studentA);
    const s1 = await agent.post("/backend/api/interview-session/start").send({ interview_id: String(iv._id), interview_type: "ai generated" });
    await request(app).post("/backend/api/interview-session/answer").set("X-Attempt-Token", s1.body.attempt_token)
      .send({ interview_id: String(iv._id), interview_type: "ai generated", question_id: "q1", answer: "saved" });
    const s2 = await agent.post("/backend/api/interview-session/start").send({ interview_id: String(iv._id), interview_type: "ai generated" });
    expect(s2.status).toBe(200);
    expect(s2.body.questions.map((q) => q.question)).toEqual(s1.body.questions.map((q) => q.question));
    expect(s2.body.answers[0].answer).toBe("saved");
    const old = await request(app).post("/backend/api/interview-session/answer").set("X-Attempt-Token", s1.body.attempt_token)
      .send({ interview_id: String(iv._id), interview_type: "ai generated", question_id: "q1", answer: "x" });
    expect(old.status).toBe(401);
    // generation ran exactly once
    expect(llmCalls.filter((c) => c.messages[0].content.includes("You write interview questions"))).toHaveLength(1);
  });

  test("kiosk-only interview cannot be started from the website", async () => {
    const iv = await techInterview({ platform: "mpod" });
    const agent = await loginAs(s.studentA);
    expect((await agent.post("/backend/api/interview-session/start").send({ interview_id: String(iv._id), interview_type: "ai generated" })).status).toBe(403);
  });

  test("sweeper auto-submits an attempt whose time ran out", async () => {
    const iv = await techInterview();
    const agent = await loginAs(s.studentA);
    const st = await agent.post("/backend/api/interview-session/start").send({ interview_id: String(iv._id), interview_type: "ai generated" });
    await request(app).post("/backend/api/interview-session/answer").set("X-Attempt-Token", st.body.attempt_token)
      .send({ interview_id: String(iv._id), interview_type: "ai generated", question_id: "q1", answer: "a good answer" });
    await Interview.updateOne({ _id: iv._id }, { $set: { "attempt.deadline_at": new Date(Date.now() - 60 * 60000) } });
    await queue.sweep();
    await waitFor(async () => (await Interview.findById(iv._id)).status === 0);
  });
});

describe("kiosk", () => {
  test("registration needs a college admin; kiosk only serves its own college", async () => {
    const bad = await request(app).post("/backend/api/kiosk/register").send({ roll_no: s.studentA.roll_no, password: PASSWORD, device_name: "Lab 1" });
    expect(bad.status).toBe(403);

    const kiosk = request.agent(app);
    const reg = await kiosk.post("/backend/api/kiosk/register").send({ roll_no: s.adminA.roll_no, password: PASSWORD, device_name: "Lab 1" });
    expect(reg.status).toBe(201);
    expect((await kiosk.get("/backend/api/kiosk/me")).body.name).toBe("Lab 1");

    const iv = await techInterview({ platform: "mpod" });
    const ivB = await Interview.create({
      platform: "mpod", roll_no: s.studentB.roll_no, tenant_id: s.tenantB._id, technology: s.tech._id, module: [s.mod._id],
      start_date_time: new Date(Date.now() - 60000), level: "easy", questions_count: "2", status: 1,
    });

    const lookup = await kiosk.post("/backend/api/kiosk/interview").send({ roll_no: s.studentA.roll_no.toLowerCase() });
    expect(lookup.status).toBe(200);
    expect(String(lookup.body._id)).toBe(String(iv._id));
    expect((await kiosk.post("/backend/api/kiosk/interview").send({ roll_no: s.studentB.roll_no })).status).toBe(404);
    expect((await kiosk.post("/backend/api/kiosk/start").send({ interview_id: String(ivB._id), interview_type: "ai generated" })).status).toBe(404);

    const start = await kiosk.post("/backend/api/kiosk/start").send({ interview_id: String(iv._id), interview_type: "ai generated" });
    expect(start.status).toBe(200);
    expect(start.body.questions.length).toBe(3);

    // the kiosk screen may show this report with the attempt token, but not other reports
    const reportUrl = `/backend/api/get-question-details/${iv._id}/ai%20generated/${s.studentA.roll_no}`;
    expect((await kiosk.get(reportUrl).set("X-Attempt-Token", start.body.attempt_token)).status).toBe(401); // not submitted yet
    await request(app).post("/backend/api/interview-session/submit").set("X-Attempt-Token", start.body.attempt_token)
      .send({ interview_id: String(iv._id), interview_type: "ai generated" });
    await waitFor(async () => (await Interview.findById(iv._id)).status === 0);
    expect((await kiosk.get(reportUrl).set("X-Attempt-Token", start.body.attempt_token)).status).toBe(200);
    expect((await kiosk.get(reportUrl)).status).toBe(401);
    expect((await kiosk.get(reportUrl).set("X-Attempt-Token", "nope")).status).toBe(401);

    // revoke from the admin portal: the kiosk stops working immediately
    const admin = await loginAs(s.adminA, { admin: true });
    const list = await admin.get("/backend/api/kiosk/devices");
    expect(list.body).toHaveLength(1);
    const adminB = await loginAs(s.adminB, { admin: true });
    expect((await adminB.put(`/backend/api/kiosk/devices/${list.body[0]._id}/revoke`)).status).toBe(403);
    expect((await admin.put(`/backend/api/kiosk/devices/${list.body[0]._id}/revoke`)).status).toBe(200);
    expect((await kiosk.get("/backend/api/kiosk/me")).status).toBe(401);
  });

  test("profile photos are only visible to the student, their college or its kiosk", async () => {
    const stu = await loginAs(s.studentA);
    expect((await stu.get(`/backend/profile-pics/${s.studentA.roll_no}.png`)).status).toBe(200);
    expect((await stu.get(`/backend/profile-pics/${s.studentA2.roll_no}.png`)).status).toBe(404);
    const adminB = await loginAs(s.adminB, { admin: true });
    expect((await adminB.get(`/backend/profile-pics/${s.studentA.roll_no}.png`)).status).toBe(404);
    expect((await request(app).get(`/backend/profile-pics/${s.studentA.roll_no}.png`)).status).toBe(401);
    expect((await stu.get("/backend/profile-pics/..%2F..%2Fapp.js")).status).toBe(404);
  });
});

describe("coding interview", () => {
  test("idea check is server-recorded and limited; evaluation uses server values", async () => {
    const iv = await CodingInterview.create({
      platform: "web", roll_no: s.studentA.roll_no, tenant_id: s.tenantA._id, start_date_time: new Date(Date.now() - 60000),
      level: "Easy", questions_count: "1", status: 1,
    });
    const agent = await loginAs(s.studentA);
    const st = await agent.post("/backend/api/interview-session/start").send({ interview_id: String(iv._id), interview_type: "coding" });
    expect(st.status).toBe(200);
    expect(st.body.questions[0].problem_name).toBe("Two Sum");
    const token = st.body.attempt_token;
    const base = { interview_id: String(iv._id), interview_type: "coding", question_id: "q1" };

    const idea = await request(app).post("/backend/api/interview-session/analyze-idea").set("X-Attempt-Token", token).send({ ...base, idea: "use a hash map" });
    expect(idea.body.accuracy).toBe(75);
    for (let i = 0; i < 4; i++) {
      // eslint-disable-next-line no-await-in-loop
      await request(app).post("/backend/api/interview-session/analyze-idea").set("X-Attempt-Token", token).send({ ...base, idea: "again" });
    }
    expect((await request(app).post("/backend/api/interview-session/analyze-idea").set("X-Attempt-Token", token).send({ ...base, idea: "6th" })).status).toBe(429);

    // client-sent matched_accuracy is ignored
    await request(app).post("/backend/api/interview-session/answer").set("X-Attempt-Token", token)
      .send({ ...base, answer: "function f(){return 1}", idea: "hash map", optimized_answer: "function g(){}", matched_accuracy: 100, idea_check: 0 });
    await request(app).post("/backend/api/interview-session/submit").set("X-Attempt-Token", token).send(base);
    await waitFor(async () => (await CodingInterview.findById(iv._id)).status === 0);
    const done = await CodingInterview.findById(iv._id).lean();
    expect(done.question_details[0].accuracy).toBe("90");
    expect(done.question_details[0].matched_accuracy).toBe(75);
    expect(done.question_details[0].idea_check).toBe(5);

    const report = await agent.get(`/backend/api/get-coding-report-details/${iv._id}/coding/${s.studentA.roll_no}`);
    expect(report.status).toBe(200);
    expect(report.body.question_details[0].optimized_result.optimized_percentage).toBe(50);
  });
});
