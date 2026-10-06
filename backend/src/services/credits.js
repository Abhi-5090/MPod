const mongoose = require("mongoose");
const Tenant = require("../models/tenant");
const CreditTransaction = require("../models/creditTransaction");
const { withTransaction } = require("../lib/db");
const { HttpError, badRequest, notFound } = require("../lib/http");

const opt = (session) => (session ? { session } : {});

// Every tenant gets one opening_balance entry recording the balance that existed
// before the ledger, so balance_after always reconciles with tenant.active_credits.
async function ensureOpeningBalance(tenantId, session = null) {
  const exists = await CreditTransaction.exists({ tenant_id: tenantId }).session(session || null);
  if (exists) return;
  const tenant = await Tenant.findById(tenantId).select("active_credits").session(session || null);
  if (!tenant) throw notFound("Tenant not found.");
  const bal = Number(tenant.active_credits) || 0;
  try {
    await CreditTransaction.create(
      [{ tenant_id: tenantId, type: "opening_balance", amount: bal, balance_after: bal, reason: "Balance before credit ledger" }],
      opt(session)
    );
  } catch (e) {
    if (e.code !== 11000) throw e; // a concurrent request created it first
  }
}

class InsufficientCreditsError extends HttpError {
  constructor() {
    super(400, "Your credits are not enough to create an interview.");
    this.code = "INSUFFICIENT_CREDITS";
  }
}

/**
 * Atomically deducts one credit for an interview. Must be called with the same
 * session used to create the interview so both commit or roll back together.
 */
// Callers must await ensureOpeningBalance(tenantId) BEFORE opening the transaction:
// a duplicate-key race inside a transaction would abort it.
async function consumeForInterview({ tenantId, interviewId, interviewType, rollNo, actorId }, session) {
  const tenant = await Tenant.findOneAndUpdate(
    { _id: tenantId, active_credits: { $gte: 1 } },
    { $inc: { active_credits: -1 } },
    { new: true, ...opt(session) }
  );
  if (!tenant) throw new InsufficientCreditsError();
  await CreditTransaction.create(
    [{
      tenant_id: tenantId,
      type: "consume",
      amount: -1,
      balance_after: tenant.active_credits,
      interview_id: interviewId,
      interview_type: interviewType,
      roll_no: rollNo,
      actor_id: actorId,
      reason: "Interview scheduled",
    }],
    opt(session)
  );
  return tenant.active_credits;
}

/**
 * Refunds the credit of an interview exactly once (unique index on interview_id+type).
 * Returns true when a refund was recorded.
 */
async function refundForInterview({ tenantId, interviewId, interviewType, rollNo, actorId, reason }, session) {
  const consumed = await CreditTransaction.findOne({ interview_id: interviewId, type: "consume" }).session(session || null).lean();
  // Interviews scheduled before the ledger existed have no consume entry; they were
  // still paid for, so refund against the tenant passed in.
  const tid = consumed ? consumed.tenant_id : tenantId;
  if (!tid) return false;
  const already = await CreditTransaction.exists({ interview_id: interviewId, type: "refund" }).session(session || null);
  if (already) return false;
  const tenant = await Tenant.findOneAndUpdate({ _id: tid }, { $inc: { active_credits: 1 } }, { new: true, ...opt(session) });
  if (!tenant) return false;
  await CreditTransaction.create(
    [{
      tenant_id: tid,
      type: "refund",
      amount: 1,
      balance_after: tenant.active_credits,
      interview_id: interviewId,
      interview_type: interviewType,
      roll_no: rollNo,
      actor_id: actorId,
      reason: reason || "Interview deleted before it was started",
    }],
    opt(session)
  );
  return true;
}

/** Manual top-up (amount > 0) or adjustment (any non-zero amount) by platform staff. */
async function addCredits({ tenantId, amount, type, reason, actorId }) {
  if (!["topup", "adjust"].includes(type)) throw badRequest("type must be 'topup' or 'adjust'.");
  if (!Number.isInteger(amount) || amount === 0) throw badRequest("amount must be a non-zero whole number.");
  if (type === "topup" && amount < 0) throw badRequest("A top-up must be positive. Use 'adjust' to remove credits.");
  if (Math.abs(amount) > 1000000) throw badRequest("amount is too large.");
  if (!reason || !String(reason).trim()) throw badRequest("A reason is required.");

  await ensureOpeningBalance(tenantId);
  return withTransaction(async (session) => {
    const filter = { _id: tenantId };
    if (amount < 0) filter.active_credits = { $gte: -amount };
    const update = { $inc: { active_credits: amount } };
    if (type === "topup") update.$push = { assigned_credits: amount }; // keep legacy history field
    const tenant = await Tenant.findOneAndUpdate(filter, update, { new: true, ...opt(session) });
    if (!tenant) {
      const exists = await Tenant.exists({ _id: tenantId }).session(session || null);
      if (!exists) throw notFound("Tenant not found.");
      throw badRequest("Balance cannot go below zero.");
    }
    const [txn] = await CreditTransaction.create(
      [{
        tenant_id: tenantId,
        type,
        amount,
        balance_after: tenant.active_credits,
        reason: String(reason).trim().slice(0, 500),
        actor_id: actorId,
      }],
      opt(session)
    );
    return { tenant, transaction: txn };
  });
}

/** Records the starting balance of a newly created tenant. */
async function recordInitialCredits({ tenantId, amount, actorId }, session) {
  await CreditTransaction.create(
    [{ tenant_id: tenantId, type: "topup", amount, balance_after: amount, reason: "Initial credits", actor_id: actorId }],
    opt(session)
  );
}

async function listTransactions(tenantId, { page = 1, limit = 50 } = {}) {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(200, Math.max(1, Number(limit) || 50));
  const filter = { tenant_id: new mongoose.Types.ObjectId(String(tenantId)) };
  const [items, total] = await Promise.all([
    CreditTransaction.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .populate({ path: "actor_id", select: "roll_no first_name", model: "user" })
      .lean(),
    CreditTransaction.countDocuments(filter),
  ]);
  return {
    items: items.map((t) => ({
      _id: t._id,
      type: t.type,
      amount: t.amount,
      balance_after: t.balance_after,
      reason: t.reason,
      interview_type: t.interview_type || null,
      interview_id: t.interview_id || null,
      roll_no: t.roll_no || null,
      actor: t.actor_id ? { roll_no: t.actor_id.roll_no, first_name: t.actor_id.first_name } : null,
      createdAt: t.createdAt,
    })),
    total,
    page: p,
    limit: l,
  };
}

module.exports = {
  consumeForInterview,
  refundForInterview,
  addCredits,
  recordInitialCredits,
  listTransactions,
  ensureOpeningBalance,
  InsufficientCreditsError,
};
