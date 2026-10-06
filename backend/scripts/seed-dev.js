/**
 * Seeds a LOCAL development database with demo data and logins.
 *
 *   MONGODB_URI="mongodb://127.0.0.1:27017/mpod_dev?replicaSet=rs0" node scripts/seed-dev.js
 *
 * Refuses to run against anything that is not localhost.
 * Creates (password for all: Passw0rd!):
 *   ADMIN1      platform admin
 *   COLLEGEADM  college (tenant) admin of "Demo College"
 *   TRAINER1    trainer of "Demo College"
 *   STUDENT1    student of "Demo College" (plus STUDENT2)
 * and a small syllabus, company question bank and coding problems.
 */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const env = require("../src/config/env");
const Tenant = require("../src/models/tenant");
const User = require("../src/models/user");
const Technology = require("../src/models/technology");
const Module = require("../src/models/module");
const Topic = require("../src/models/topic");
const Company = require("../src/models/companies");
const Tag = require("../src/models/tags");
const CompanyQuestion = require("../src/models/companyQuestion");
const CodingQuestion = require("../src/models/codingQuestion");
const CreditTransaction = require("../src/models/creditTransaction");

const PASSWORD = "Passw0rd!";

async function main() {
  const uri = env.mongoUri || "";
  const hosts = uri.replace(/^mongodb(\+srv)?:\/\//, "").split("/")[0].replace(/^[^@]*@/, "");
  const local = hosts.split(",").every((h) => /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(h));
  if (!local) {
    console.error("Refusing to seed: MONGODB_URI must point to localhost. Set it explicitly for this command.");
    process.exit(1);
  }
  await mongoose.connect(uri);

  const hash = await bcrypt.hash(PASSWORD, 10);
  let tenant = await Tenant.findOne({ organization_code: "DEMO" });
  if (!tenant) {
    tenant = await Tenant.create({
      organization_name: "Demo College", contact_person: "Placement Cell", email: "demo@college.local",
      organization_code: "DEMO", assigned_credits: [100], active_credits: 100, interview_duration_minutes: 30, status: 1,
    });
    await CreditTransaction.create({ tenant_id: tenant._id, type: "topup", amount: 100, balance_after: 100, reason: "Initial credits" });
  }

  const users = [
    { roll_no: "ADMIN1", first_name: "Platform Admin", role: "admin" },
    { roll_no: "COLLEGEADM", first_name: "College Admin", role: "tenantadmin" },
    { roll_no: "TRAINER1", first_name: "Trainer", role: "trainer" },
    { roll_no: "STUDENT1", first_name: "Student One", role: "student", gender: "male", branch: "CSE", passout_year: 2027 },
    { roll_no: "STUDENT2", first_name: "Student Two", role: "student", gender: "female", branch: "ECE", passout_year: 2027 },
  ];
  for (const u of users) {
    // eslint-disable-next-line no-await-in-loop
    await User.updateOne(
      { roll_no: u.roll_no },
      { $setOnInsert: { ...u, password: hash, email: `${u.roll_no.toLowerCase()}@college.local`, tenant_id: tenant._id, college: "Demo College", status: 1 } },
      { upsert: true }
    );
  }

  let tech = await Technology.findOne({ technology_name: "Java" });
  if (!tech) {
    tech = await Technology.create({ technology_name: "Java", technology_category: "Programming", added_by: "seed" });
    const oop = await Module.create({ technology: tech._id, module_name: "OOP", added_by: "seed" });
    const coll = await Module.create({ technology: tech._id, module_name: "Collections", added_by: "seed" });
    await Topic.insertMany([
      { technology: tech._id, module: oop._id, topic_name: "Inheritance", added_by: "seed" },
      { technology: tech._id, module: oop._id, topic_name: "Polymorphism", added_by: "seed" },
      { technology: tech._id, module: coll._id, topic_name: "HashMap", added_by: "seed" },
    ]);
  }

  if (!(await Company.exists({ company_name: "Demo Corp" }))) {
    const company = await Company.create({ company_name: "Demo Corp", added_date: new Date().toISOString(), added_by: "seed", status: 1 });
    const tag = await Tag.create({ tag_name: "Freshers", createdAt: new Date().toISOString(), added_by: "seed", status: 1 });
    await CompanyQuestion.insertMany(
      ["Tell me about yourself.", "Explain OOP concepts.", "What is a REST API?", "Describe a challenging project."].map((q) => ({
        company: company._id, type: "Technical", round: "TR1", year: "2025", tag: tag._id, question: q, added_by: "seed", status: 1,
      }))
    );
  }

  if (!(await CodingQuestion.exists({ problem_name: "Two Sum" }))) {
    await CodingQuestion.insertMany([
      { problem_name: "Two Sum", complexity: "easy", time: 15, description: "<p>Given an array of integers and a target, return the indices of two numbers that add up to the target.</p>", input: "nums = [2,7,11,15], target = 9", output: "[0,1]", constraints: "2 <= n <= 10^4", added_by: "seed", status: 1 },
      { problem_name: "Reverse a String", complexity: "easy", time: 10, description: "<p>Reverse the given string without using built-in reverse.</p>", input: "\"hello\"", output: "\"olleh\"", constraints: "1 <= length <= 10^5", added_by: "seed", status: 1 },
    ]);
  }

  console.log(`Seeded. Tenant id: ${tenant._id}. Logins (password ${PASSWORD}): ADMIN1, COLLEGEADM, TRAINER1, STUDENT1, STUDENT2`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
