const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const request = require("supertest");
const { MongoMemoryReplSet } = require("mongodb-memory-server");

const app = require("../src/app");
const evaluation = require("../src/services/evaluation");
const { detectTransactions } = require("../src/lib/db");
const User = require("../src/models/user");
const Tenant = require("../src/models/tenant");
const Technology = require("../src/models/technology");
const Module = require("../src/models/module");
const Topic = require("../src/models/topic");
const CodingQuestion = require("../src/models/codingQuestion");

let replset;

async function startDb() {
  replset = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: "wiredTiger" } });
  await mongoose.connect(replset.getUri());
  await detectTransactions();
  await Promise.all(Object.values(mongoose.models).map((m) => m.createIndexes()));
}

async function stopDb() {
  await mongoose.disconnect();
  if (replset) await replset.stop();
}

async function clearDb() {
  const cols = await mongoose.connection.db.collections();
  await Promise.all(cols.map((c) => c.deleteMany({})));
}

// Fake OpenAI client: answers by recognising the prompt.
const llmCalls = [];
function installFakeLlm() {
  evaluation._setClient({
    chat: {
      completions: {
        create: async (req) => {
          llmCalls.push(req);
          const sys = req.messages[0].content;
          const user = req.messages[1].content;
          let out;
          if (sys.includes("You write interview questions")) {
            const n = Number((user.match(/exactly (\d+)/) || [])[1] || 3);
            out = { questions: Array.from({ length: n }, (_, i) => `Question ${i + 1}?`) };
          } else if (sys.includes("evaluator of technical interview answers")) {
            out = { accuracy: user.includes("good answer") ? 85 : 10, analysis: "ok", improvements: "more" };
          } else if (sys.includes("summarise a candidate")) {
            out = { strengths: ["s"], areas_of_improvement: ["a"], interview_parameters: { communication_skills: 70 } };
          } else if (sys.includes("proposed approach")) {
            out = { accuracy: 75 };
          } else if (sys.includes("evaluator of coding interview answers")) {
            out = { is_code: true, accuracy: 90, efficiency: { time_complexity: "O(n)" }, observations: ["x"], analysis: "fine" };
          } else if (sys.includes("optimised solution")) {
            out = { optimized_percentage: 50, time_complexity: "O(n)", space_complexity: "O(1)", optimization_comment: "better" };
          } else {
            out = {};
          }
          return { choices: [{ message: { content: JSON.stringify(out) } }] };
        },
      },
    },
  });
}

const PASSWORD = "Passw0rd!";
let hash;
async function makeUser(fields) {
  hash = hash || (await bcrypt.hash(PASSWORD, 4));
  return User.create({ password: hash, status: 1, email: `${fields.roll_no.toLowerCase()}@example.com`, ...fields });
}

async function seed() {
  const tenantA = await Tenant.create({ organization_name: "College A", email: "a@a.com", active_credits: 5, assigned_credits: [5], organization_code: "A", interview_duration_minutes: 30 });
  const tenantB = await Tenant.create({ organization_name: "College B", email: "b@b.com", active_credits: 5, assigned_credits: [5], organization_code: "B" });
  const platform = await makeUser({ roll_no: "ADMIN1", role: "admin", tenant_id: tenantA._id, first_name: "Plat" });
  const adminA = await makeUser({ roll_no: "TADMIN_A", role: "tenantadmin", tenant_id: tenantA._id });
  const trainerA = await makeUser({ roll_no: "TRAINER_A", role: "trainer", tenant_id: tenantA._id });
  const adminB = await makeUser({ roll_no: "TADMIN_B", role: "tenantadmin", tenant_id: tenantB._id });
  const studentA = await makeUser({ roll_no: "21A91A0001", role: "student", tenant_id: tenantA._id, first_name: "Stu A" });
  const studentA2 = await makeUser({ roll_no: "21A91A0002", role: "student", tenant_id: tenantA._id });
  const studentB = await makeUser({ roll_no: "21B91B0001", role: "student", tenant_id: tenantB._id });
  const tech = await Technology.create({ technology_name: "Java", technology_category: "Programming" });
  const mod = await Module.create({ technology: tech._id, module_name: "OOP" });
  const topic = await Topic.create({ technology: tech._id, module: mod._id, topic_name: "Inheritance" });
  await CodingQuestion.create({ problem_name: "Two Sum", complexity: "easy", time: 10, description: "Find two numbers", status: 1 });
  return { tenantA, tenantB, platform, adminA, trainerA, adminB, studentA, studentA2, studentB, tech, mod, topic };
}

// Returns a supertest agent that keeps cookies.
async function loginAs(user, { admin } = {}) {
  const agent = request.agent(app);
  const res = await agent
    .post(admin ? "/backend/api/admin-login" : "/backend/api/login")
    .send({ roll_no: user.roll_no, password: PASSWORD, confirmLogout: true });
  if (res.status !== 200) throw new Error(`login failed ${res.status} ${JSON.stringify(res.body)}`);
  return agent;
}

module.exports = { app, request, startDb, stopDb, clearDb, seed, loginAs, makeUser, installFakeLlm, llmCalls, PASSWORD };
