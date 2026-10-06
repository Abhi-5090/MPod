/**
 * One-time, idempotent data migration for the security/ledger release.
 *
 *   node scripts/migrate.js            # dry run: only reports what would change
 *   node scripts/migrate.js --apply    # applies the changes
 *
 * 1. Creates an opening_balance ledger entry for every tenant (current balance).
 * 2. Stamps tenant_id/user_id on interviews whose roll number maps to exactly one user.
 * 3. Removes legacy plaintext OTPs and stored session tokens.
 * 4. Builds the new indexes.
 * 5. Reports users whose password is not a bcrypt hash (they cannot log in).
 */
const mongoose = require("mongoose");
const env = require("../src/config/env");
const Tenant = require("../src/models/tenant");
const User = require("../src/models/user");
const CreditTransaction = require("../src/models/creditTransaction");
const KioskDevice = require("../src/models/kioskDevice");
const { ALL_MODELS } = require("../src/services/interviewModels");

const APPLY = process.argv.includes("--apply");

async function main() {
  await mongoose.connect(env.mongoUri);
  console.log(`Connected. Mode: ${APPLY ? "APPLY" : "DRY RUN"}\n`);

  // 1. Opening balances
  const tenants = await Tenant.find().select("organization_name active_credits").lean();
  let opened = 0;
  for (const t of tenants) {
    // eslint-disable-next-line no-await-in-loop
    if (await CreditTransaction.exists({ tenant_id: t._id })) continue;
    opened++;
    if (APPLY) {
      const bal = Number(t.active_credits) || 0;
      // eslint-disable-next-line no-await-in-loop
      await CreditTransaction.create({
        tenant_id: t._id, type: "opening_balance", amount: bal, balance_after: bal, reason: "Balance before credit ledger",
      });
    }
  }
  console.log(`Opening balances ${APPLY ? "created" : "to create"}: ${opened} of ${tenants.length} tenants`);

  // 2. Tenant/user ownership on interviews
  const users = await User.find({}).select("roll_no tenant_id").lean();
  const byRoll = new Map();
  users.forEach((u) => {
    const k = String(u.roll_no);
    byRoll.set(k, byRoll.has(k) ? null : u); // null marks ambiguous roll numbers
  });
  for (const Model of ALL_MODELS) {
    // eslint-disable-next-line no-await-in-loop
    const docs = await Model.find({ tenant_id: { $exists: false } }).select("roll_no").lean();
    let stamped = 0;
    let ambiguous = 0;
    let orphan = 0;
    const ops = [];
    for (const d of docs) {
      const u = byRoll.get(String(d.roll_no));
      if (u === null) { ambiguous++; continue; }
      if (!u || !u.tenant_id) { orphan++; continue; }
      stamped++;
      ops.push({ updateOne: { filter: { _id: d._id }, update: { $set: { tenant_id: u.tenant_id, user_id: u._id } } } });
    }
    // eslint-disable-next-line no-await-in-loop
    if (APPLY && ops.length) await Model.bulkWrite(ops, { ordered: false });
    console.log(`${Model.collection.name}: ${stamped} ${APPLY ? "stamped" : "to stamp"}, ${ambiguous} ambiguous roll numbers, ${orphan} without a user`);
  }

  // 3. Legacy secrets
  const legacy = await User.countDocuments({ $or: [{ sessionToken: { $exists: true } }, { otp: { $exists: true } }] });
  if (APPLY && legacy) await User.updateMany({}, { $unset: { sessionToken: "", otp: "" } });
  console.log(`Users with legacy session tokens / plaintext OTPs ${APPLY ? "cleaned" : "to clean"}: ${legacy}`);

  // 4. Indexes
  if (APPLY) {
    for (const M of [...ALL_MODELS, CreditTransaction, KioskDevice]) {
      // eslint-disable-next-line no-await-in-loop
      await M.createIndexes();
    }
    console.log("Indexes created.");
  }

  // 5. Passwords that are not bcrypt hashes
  const weak = await User.find({ password: { $not: /^\$2[aby]\$/ } }).select("roll_no").limit(20).lean();
  const weakCount = await User.countDocuments({ password: { $not: /^\$2[aby]\$/ } });
  console.log(`Users whose password is not a bcrypt hash (cannot log in until reset): ${weakCount}`);
  if (weak.length) console.log("  e.g.", weak.map((u) => u.roll_no).join(", "));

  // Duplicate roll numbers across colleges
  const dups = await User.aggregate([
    { $group: { _id: "$roll_no", n: { $sum: 1 } } },
    { $match: { n: { $gt: 1 } } },
    { $count: "count" },
  ]);
  console.log(`Roll numbers used by more than one user: ${dups[0]?.count || 0}`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
