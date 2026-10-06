const { app, request, startDb, stopDb, clearDb, seed, loginAs } = require("./helpers");
const Tenant = require("../src/models/tenant");
const CreditTransaction = require("../src/models/creditTransaction");
const Interview = require("../src/models/interview");
const CompanyInterview = require("../src/models/companyInterview");

let s;
beforeAll(startDb);
afterAll(stopDb);
beforeEach(async () => {
  await clearDb();
  s = await seed();
});

const inMinutes = (m) => new Date(Date.now() + m * 60000).toISOString();
const techBody = (extra = {}) => ({
  platform: "web",
  roll_no: s.studentA.roll_no,
  technology: String(s.tech._id),
  module: [String(s.mod._id)],
  topic: [String(s.topic._id)],
  level: "easy",
  questions_count: 3,
  start_date_time: inMinutes(60),
  ...extra,
});

async function assertLedgerReconciles(tenantId) {
  const t = await Tenant.findById(tenantId).lean();
  const txns = await CreditTransaction.find({ tenant_id: tenantId }).sort({ createdAt: 1, _id: 1 }).lean();
  const sum = txns.reduce((a, x) => a + x.amount, 0);
  expect(sum).toBe(t.active_credits);
  expect(txns[txns.length - 1].balance_after).toBe(t.active_credits);
  expect(t.active_credits).toBeGreaterThanOrEqual(0);
}

describe("scheduling consumes credits through the ledger", () => {
  test("schedules, records opening balance and consume entry", async () => {
    const agent = await loginAs(s.adminA, { admin: true });
    const res = await agent.post("/backend/api/add-interviewee-details").send(techBody());
    expect(res.status).toBe(201);
    expect(String(res.body.data.tenant_id)).toBe(String(s.tenantA._id));
    expect(res.body.data.created_by).toBe(s.adminA.roll_no);
    const t = await Tenant.findById(s.tenantA._id);
    expect(t.active_credits).toBe(4);
    const types = (await CreditTransaction.find({ tenant_id: s.tenantA._id }).lean()).map((x) => x.type).sort();
    expect(types).toEqual(["consume", "opening_balance"]);
    await assertLedgerReconciles(s.tenantA._id);
  });

  test("college admin cannot schedule a student of another college (or charge another college)", async () => {
    const agent = await loginAs(s.adminA, { admin: true });
    const res = await agent.post("/backend/api/add-interviewee-details").send(techBody({ roll_no: s.studentB.roll_no }));
    expect(res.status).toBe(400);
    const res2 = await agent.post("/backend/api/add-interviewee-details").send(techBody({ tenant_id: String(s.tenantB._id) }));
    expect(res2.status).toBe(403);
    expect((await Tenant.findById(s.tenantB._id)).active_credits).toBe(5);
  });

  test("insufficient credits: refused and nothing created", async () => {
    await Tenant.updateOne({ _id: s.tenantA._id }, { active_credits: 0 });
    const agent = await loginAs(s.adminA, { admin: true });
    const res = await agent.post("/backend/api/add-interviewee-details").send(techBody());
    expect(res.status).toBe(400);
    expect(await Interview.countDocuments()).toBe(0);
    expect((await Tenant.findById(s.tenantA._id)).active_credits).toBe(0);
  });

  test("concurrent scheduling never overspends", async () => {
    await Tenant.updateOne({ _id: s.tenantA._id }, { active_credits: 3 });
    const agent = await loginAs(s.adminA, { admin: true });
    const students = [];
    const { makeUser } = require("./helpers");
    for (let i = 0; i < 6; i++) {
      // eslint-disable-next-line no-await-in-loop
      students.push(await makeUser({ roll_no: `CONC${i}`, role: "student", tenant_id: s.tenantA._id }));
    }
    const results = await Promise.all(
      students.map((st) => agent.post("/backend/api/add-interviewee-details").send(techBody({ roll_no: st.roll_no })))
    );
    const ok = results.filter((r) => r.status === 201).length;
    expect(ok).toBe(3);
    expect((await Tenant.findById(s.tenantA._id)).active_credits).toBe(0);
    expect(await Interview.countDocuments()).toBe(3);
    await assertLedgerReconciles(s.tenantA._id);
  });

  test("overlapping interviews for the same student are refused", async () => {
    const agent = await loginAs(s.adminA, { admin: true });
    expect((await agent.post("/backend/api/add-interviewee-details").send(techBody())).status).toBe(201);
    const second = await agent.post("/backend/api/add-coding-interview").send({
      platform: "web", roll_no: s.studentA.roll_no, level: "easy", questions_count: 1, start_date_time: inMinutes(70),
    });
    expect(second.status).toBe(400);
    expect((await Tenant.findById(s.tenantA._id)).active_credits).toBe(4);
  });

  test("start time in the past is refused", async () => {
    const agent = await loginAs(s.adminA, { admin: true });
    expect((await agent.post("/backend/api/add-interviewee-details").send(techBody({ start_date_time: inMinutes(-60) }))).status).toBe(400);
  });

  test("module must belong to technology", async () => {
    const Module = require("../src/models/module");
    const Technology = require("../src/models/technology");
    const other = await Technology.create({ technology_name: "Py", technology_category: "x" });
    const m2 = await Module.create({ technology: other._id, module_name: "x" });
    const agent = await loginAs(s.adminA, { admin: true });
    const res = await agent.post("/backend/api/add-interviewee-details").send(techBody({ module: [String(m2._id)], topic: [] }));
    expect(res.status).toBe(400);
  });

  test("bulk scheduling reports per-row results and stops charging when credits run out", async () => {
    await Tenant.updateOne({ _id: s.tenantA._id }, { active_credits: 1 });
    const xlsx = require("xlsx");
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet([{ roll_no: s.studentA.roll_no }, { roll_no: s.studentA2.roll_no }, { roll_no: s.studentB.roll_no }, { roll_no: "" }]), "S");
    const buf = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
    const agent = await loginAs(s.adminA, { admin: true });
    const b = techBody();
    const res = await agent
      .post("/backend/api/add-bulk-interviewee-details")
      .field("platform", b.platform)
      .field("technology", b.technology)
      .field("module", JSON.stringify(b.module))
      .field("topic", JSON.stringify(b.topic))
      .field("level", b.level)
      .field("questions_count", "3")
      .field("start_date_time", b.start_date_time)
      .field("type", "bulk")
      .attach("file", buf, "students.xlsx");
    expect(res.status).toBe(207);
    expect(res.body.total).toBe(4);
    expect(res.body.success).toBe(1);
    expect(res.body.failed).toBe(3);
    expect((await Tenant.findById(s.tenantA._id)).active_credits).toBe(0);
    await assertLedgerReconciles(s.tenantA._id);
  });

  test("upload of a non-spreadsheet is rejected", async () => {
    const agent = await loginAs(s.adminA, { admin: true });
    const res = await agent.post("/backend/api/add-bulk-interviewee-details").attach("file", Buffer.from("x"), "evil.exe");
    expect(res.status).toBe(400);
  });
});

describe("deleting interviews and refunds", () => {
  test("refund once when never started; no refund after start", async () => {
    const agent = await loginAs(s.adminA, { admin: true });
    const a = await agent.post("/backend/api/add-interviewee-details").send(techBody());
    const b = await agent.post("/backend/api/add-interviewee-details").send(techBody({ roll_no: s.studentA2.roll_no }));
    expect((await Tenant.findById(s.tenantA._id)).active_credits).toBe(3);

    const del = await agent.delete(`/backend/api/delete-interviewee-details/${a.body.data._id}`);
    expect(del.status).toBe(200);
    expect(del.body.refunded).toBe(true);
    expect((await Tenant.findById(s.tenantA._id)).active_credits).toBe(4);
    expect((await agent.delete(`/backend/api/delete-interviewee-details/${a.body.data._id}`)).status).toBe(404);

    await Interview.updateOne({ _id: b.body.data._id }, { $set: { "attempt.started_at": new Date() } });
    const del2 = await agent.delete(`/backend/api/delete-interviewee-details/${b.body.data._id}`);
    expect(del2.body.refunded).toBe(false);
    expect((await Tenant.findById(s.tenantA._id)).active_credits).toBe(4);
    await assertLedgerReconciles(s.tenantA._id);
  });

  test("another college cannot delete or view the interview", async () => {
    const agentA = await loginAs(s.adminA, { admin: true });
    const a = await agentA.post("/backend/api/add-interviewee-details").send(techBody());
    const agentB = await loginAs(s.adminB, { admin: true });
    expect((await agentB.delete(`/backend/api/delete-interviewee-details/${a.body.data._id}`)).status).toBe(404);
    expect((await agentB.get(`/backend/api/get-interviewee-details/${a.body.data._id}`)).status).toBe(404);
    const listB = await agentB.get(`/backend/api/get-all-interviewee-details/${s.tenantB._id}?date=${new Date().toISOString().slice(0, 10)}`);
    expect(listB.status).toBe(200);
    expect(listB.body.length).toBe(0);
  });

  test("an interview that has started cannot be edited", async () => {
    const agent = await loginAs(s.adminA, { admin: true });
    const a = await agent.post("/backend/api/add-interviewee-details").send(techBody());
    expect((await agent.put(`/backend/api/edit-interviewee-details/${a.body.data._id}`).send({ level: "hard" })).status).toBe(200);
    await Interview.updateOne({ _id: a.body.data._id }, { $set: { "attempt.started_at": new Date() } });
    expect((await agent.put(`/backend/api/edit-interviewee-details/${a.body.data._id}`).send({ level: "easy" })).status).toBe(409);
  });
});

describe("manual credit changes", () => {
  test("platform admin tops up and adjusts; balance never goes negative", async () => {
    const agent = await loginAs(s.platform, { admin: true });
    const up = await agent.post(`/backend/api/tenants/${s.tenantA._id}/credits`).send({ amount: 10, type: "topup", reason: "Invoice 12" });
    expect(up.status).toBe(200);
    expect(up.body.tenant.active_credits).toBe(15);
    const neg = await agent.post(`/backend/api/tenants/${s.tenantA._id}/credits`).send({ amount: -100, type: "adjust", reason: "x" });
    expect(neg.status).toBe(400);
    const adj = await agent.post(`/backend/api/tenants/${s.tenantA._id}/credits`).send({ amount: -5, type: "adjust", reason: "correction" });
    expect(adj.body.tenant.active_credits).toBe(10);
    const noReason = await agent.post(`/backend/api/tenants/${s.tenantA._id}/credits`).send({ amount: 5, type: "topup" });
    expect(noReason.status).toBe(400);
    const hist = await agent.get(`/backend/api/tenants/${s.tenantA._id}/credit-transactions`);
    expect(hist.body.total).toBe(3); // opening + topup + adjust
    expect(hist.body.items[0].actor.roll_no).toBe(s.platform.roll_no);
    await assertLedgerReconciles(s.tenantA._id);
  });

  test("updating a tenant does not change its credits", async () => {
    const agent = await loginAs(s.platform, { admin: true });
    const res = await agent.put(`/backend/api/update-tenant/${s.tenantA._id}`).send({ assigned_credits: "100,200", active_credits: 999, organization_name: "Renamed" });
    expect(res.status).toBe(200);
    const t = await Tenant.findById(s.tenantA._id);
    expect(t.active_credits).toBe(5);
    expect(t.organization_name).toBe("Renamed");
  });

  test("new tenant records its initial credits in the ledger", async () => {
    const agent = await loginAs(s.platform, { admin: true });
    const res = await agent.post("/backend/api/add-tenant").send({ organization_name: "C", email: "c@c.com", assigned_credits: 50, organization_code: "C" });
    expect(res.status).toBe(201);
    await assertLedgerReconciles(res.body.data._id);
  });

  test("company interview with tag-less bulk schedule works and charges once per row", async () => {
    const Company = require("../src/models/companies");
    const c = await Company.create({ company_name: "TCS", added_date: "2026-01-01", added_by: "admin", status: 1 });
    const agent = await loginAs(s.adminA, { admin: true });
    const res = await agent.post("/backend/api/add-company-interview").send({
      platform: "web", roll_no: s.studentA.roll_no, company: [String(c._id)], type: ["Technical"], round: ["TR1"], questions_count: 2, start_date_time: inMinutes(30),
    });
    expect(res.status).toBe(201);
    expect(await CompanyInterview.countDocuments()).toBe(1);
  });
});
