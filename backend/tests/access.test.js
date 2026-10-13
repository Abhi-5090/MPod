const { app, request, startDb, stopDb, clearDb, seed, loginAs, PASSWORD } = require("./helpers");
const User = require("../src/models/user");

// Routes that are intentionally reachable without a session.
const PUBLIC = new Set([
  "POST /backend/api/login",
  "POST /backend/api/admin-login",
  "POST /backend/api/logout",
  "GET /backend/api/logout/:roll_no/:slug",
  "POST /backend/api/send-otp",
  "POST /backend/api/check-otp",
  "POST /backend/api/reset-password",
  "POST /backend/api/kiosk/register",
  // authorised by the per-attempt token instead of a cookie
  "POST /backend/api/interview-session/answer",
  "POST /backend/api/interview-session/analyze-idea",
  "POST /backend/api/interview-session/face-frame",
  "POST /backend/api/interview-session/submit",
  "GET /backend/api/interview-session/status",
  "GET /backend/api/health",
  "GET /backend/api/server-time",
]);

function listRoutes() {
  const out = [];
  const walk = (stack, prefix) => {
    for (const layer of stack) {
      if (layer.route) {
        for (const m of Object.keys(layer.route.methods)) {
          const paths = Array.isArray(layer.route.path) ? layer.route.path : [layer.route.path];
          paths.forEach((p) => out.push({ method: m.toUpperCase(), path: prefix + p }));
        }
      } else if (layer.name === "router" && layer.handle.stack) {
        walk(layer.handle.stack, "/backend");
      }
    }
  };
  walk(app._router.stack, "");
  return out;
}

const fill = (p) => p.replace(/:([a-z_]+)/g, (_, k) => (k === "roll_no" ? "21A91A0001" : k === "interview_type" ? "company" : "64b000000000000000000000"));

let s;
beforeAll(startDb);
afterAll(stopDb);
beforeEach(async () => {
  await clearDb();
  s = await seed();
});

describe("every API route requires authentication unless explicitly public", () => {
  const routes = listRoutes().filter((r) => r.path.startsWith("/backend/api/") || r.path.startsWith("/backend/profile-pics"));

  test("route table is non-trivial", () => {
    expect(routes.length).toBeGreaterThan(90);
  });

  test.each(listRoutes().filter((r) => (r.path.startsWith("/backend/api/") || r.path.startsWith("/backend/profile-pics")) && !PUBLIC.has(`${r.method} ${r.path}`)).map((r) => [r.method, r.path]))(
    "%s %s -> 401 without a session",
    async (method, path) => {
      const res = await request(app)[method.toLowerCase()](fill(path)).send({});
      expect(res.status).toBe(401);
    }
  );

  test("token-authorised session routes reject a missing token", async () => {
    for (const p of ["answer", "submit", "analyze-idea", "face-frame"]) {
      const res = await request(app).post(`/backend/api/interview-session/${p}`).send({ interview_type: "company", interview_id: "64b000000000000000000000" });
      expect(res.status).toBe(401);
    }
  });
});

describe("authentication", () => {
  test("removed legacy endpoints that leaked sessions no longer exist", async () => {
    expect((await request(app).get("/backend/api/find-session-token/21A91A0001")).status).toBe(404);
    expect((await request(app).post("/backend/api/update-session-token").send({ roll_no: "21A91A0001" })).status).toBe(404);
    expect((await request(app).post("/backend/api/get-accuracy-temp").send({})).status).toBe(404);
  });

  test("student login sets an httpOnly cookie and identifies the student", async () => {
    const agent = await loginAs(s.studentA);
    const me = await agent.get("/backend/api/get-currentUser");
    expect(me.status).toBe(200);
    expect(me.body.roll_no).toBe("21A91A0001");
    expect(me.body.password).toBeUndefined();
  });

  test("students cannot use the admin portal and staff cannot use the student portal", async () => {
    const a = await request(app).post("/backend/api/admin-login").send({ roll_no: s.studentA.roll_no, password: PASSWORD });
    expect(a.status).toBe(403);
    const b = await request(app).post("/backend/api/login").send({ roll_no: s.adminA.roll_no, password: PASSWORD });
    expect(b.status).toBe(403);
  });

  test("a student cookie does not grant admin access", async () => {
    const agent = await loginAs(s.studentA);
    expect((await agent.get("/backend/api/get-tenants")).status).toBe(401);
  });

  test("single session: second login asks before ending the first, and the first is revoked", async () => {
    const first = await loginAs(s.studentA);
    const second = await request(app).post("/backend/api/login").send({ roll_no: s.studentA.roll_no, password: PASSWORD });
    expect(second.status).toBe(403);
    expect(second.body.code).toBe("SESSION_ACTIVE");
    await loginAs(s.studentA); // confirmLogout: true
    expect((await first.get("/backend/api/get-currentUser")).status).toBe(401);
  });

  test("logout revokes the session server-side", async () => {
    const agent = await loginAs(s.studentA);
    const cookie = (await agent.get("/backend/api/get-currentUser")).request.cookies;
    expect((await agent.post("/backend/api/logout").send({ slug: "user" })).status).toBe(200);
    const replay = await request(app).get("/backend/api/get-currentUser").set("Cookie", cookie);
    expect(replay.status).toBe(401);
  });

  test("account locks after repeated wrong passwords", async () => {
    for (let i = 0; i < 10; i++) {
      // eslint-disable-next-line no-await-in-loop
      await request(app).post("/backend/api/login").send({ roll_no: s.studentA.roll_no, password: "wrong" });
    }
    const res = await request(app).post("/backend/api/login").send({ roll_no: s.studentA.roll_no, password: PASSWORD });
    expect(res.status).toBe(429);
  });

  test("deactivated users cannot log in and lose existing sessions", async () => {
    const agent = await loginAs(s.studentA);
    await User.updateOne({ _id: s.studentA._id }, { status: 0 });
    expect((await agent.get("/backend/api/get-currentUser")).status).toBe(401);
    const res = await request(app).post("/backend/api/login").send({ roll_no: s.studentA.roll_no, password: PASSWORD });
    expect(res.status).toBe(403);
  });
});

describe("tenant (college) isolation", () => {
  test("college admin only sees their own users, without secrets", async () => {
    const agent = await loginAs(s.adminA, { admin: true });
    const own = await agent.get(`/backend/api/get-users/${s.tenantA._id}`);
    expect(own.status).toBe(200);
    expect(own.body.length).toBeGreaterThan(0);
    own.body.forEach((u) => {
      expect(u.password).toBeUndefined();
      expect(u.session_sid).toBeUndefined();
      expect(u.otp_hash).toBeUndefined();
    });
    const other = await agent.get(`/backend/api/get-users/${s.tenantB._id}`);
    expect(other.status).toBe(403);
  });

  test("college admin cannot manage tenants, content or credits", async () => {
    const agent = await loginAs(s.adminA, { admin: true });
    expect((await agent.get("/backend/api/get-tenants")).status).toBe(403);
    expect((await agent.post("/backend/api/add-technology").send({ technology_name: "x", technology_category: "y" })).status).toBe(403);
    expect((await agent.post(`/backend/api/tenants/${s.tenantA._id}/credits`).send({ amount: 100, type: "topup", reason: "x" })).status).toBe(403);
  });

  test("college admin can read their own credit history but not another college's", async () => {
    const agent = await loginAs(s.adminA, { admin: true });
    expect((await agent.get(`/backend/api/tenants/${s.tenantA._id}/credit-transactions`)).status).toBe(200);
    expect((await agent.get(`/backend/api/tenants/${s.tenantB._id}/credit-transactions`)).status).toBe(403);
    expect((await agent.get(`/backend/api/get-tenant/${s.tenantB._id}`)).status).toBe(403);
  });

  test("trainer cannot manage users", async () => {
    const agent = await loginAs(s.trainerA, { admin: true });
    expect((await agent.get(`/backend/api/get-users/${s.tenantA._id}`)).status).toBe(403);
  });

  test("dashboard stats for another college are refused", async () => {
    const agent = await loginAs(s.adminA, { admin: true });
    expect((await agent.get(`/backend/api/get-users-stats/${s.tenantA._id}`)).status).toBe(200);
    expect((await agent.get(`/backend/api/get-users-stats/${s.tenantB._id}`)).status).toBe(403);
    expect((await agent.get("/backend/api/get-overall-stats")).status).toBe(403);
  });

  test("college admin cannot edit users of another college or promote to admin", async () => {
    const agent = await loginAs(s.adminA, { admin: true });
    expect((await agent.put(`/backend/api/update-user/${s.studentB._id}`).send({ first_name: "x" })).status).toBe(404);
    expect((await agent.put(`/backend/api/update-user/${s.studentA._id}`).send({ role: "admin" })).status).toBe(403);
    expect((await agent.put(`/backend/api/update-user/${s.studentA._id}`).send({ first_name: "New" })).status).toBe(200);
  });
});

describe("password reset", () => {
  const mailer = require("../src/services/mailer");
  let lastText = "";
  beforeEach(() => {
    jest.spyOn(mailer, "sendMail").mockImplementation(async ({ text }) => {
      lastText = text;
      return true;
    });
  });
  afterEach(() => jest.restoreAllMocks());

  test("generic response for unknown roll numbers", async () => {
    const res = await request(app).post("/backend/api/send-otp").send({ roll_no: "NOPE" });
    expect(res.status).toBe(200);
  });

  test("OTP is limited to 5 wrong attempts, then a correct OTP resets the password and ends sessions", async () => {
    const agent = await loginAs(s.studentA);
    await request(app).post("/backend/api/send-otp").send({ roll_no: s.studentA.roll_no }).expect(200);
    const otp = lastText.match(/(\d{6})/)[1];
    const wrong = otp === "000000" ? "111111" : "000000";
    for (let i = 0; i < 5; i++) {
      // eslint-disable-next-line no-await-in-loop
      expect((await request(app).post("/backend/api/check-otp").send({ roll_no: s.studentA.roll_no, otp: wrong })).status).toBe(400);
    }
    expect((await request(app).post("/backend/api/check-otp").send({ roll_no: s.studentA.roll_no, otp })).status).toBe(429);

    // request a new OTP after the resend window
    await User.updateOne({ _id: s.studentA._id }, { $unset: { otp_last_sent_at: "" } });
    await request(app).post("/backend/api/send-otp").send({ roll_no: s.studentA.roll_no }).expect(200);
    const otp2 = lastText.match(/(\d{6})/)[1];
    const reset = await request(app).post("/backend/api/reset-password").send({ roll_no: s.studentA.roll_no, otp: otp2, new_password: "NewPassw0rd!" });
    expect(reset.status).toBe(200);
    expect((await agent.get("/backend/api/get-currentUser")).status).toBe(401);
    // OTP is single-use
    const again = await request(app).post("/backend/api/reset-password").send({ roll_no: s.studentA.roll_no, otp: otp2, new_password: "Another1!" });
    expect(again.status).toBe(400);
    const login = await request(app).post("/backend/api/login").send({ roll_no: s.studentA.roll_no, password: "NewPassw0rd!" });
    expect(login.status).toBe(200);
  });
});
