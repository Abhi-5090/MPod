const mongoose = require("mongoose");

// Append-only ledger of every change to a tenant's credit balance.
// tenant.active_credits is the cached balance; balance_after on the latest
// entry must always equal it.
const CreditTransactionSchema = new mongoose.Schema(
  {
    tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: "tenant", required: true },
    type: {
      type: String,
      enum: ["opening_balance", "topup", "adjust", "consume", "refund"],
      required: true,
    },
    amount: { type: Number, required: true }, // signed: +topup/refund, -consume
    balance_after: { type: Number, required: true },
    reason: { type: String, maxlength: 500 },
    interview_id: { type: mongoose.Schema.Types.ObjectId },
    interview_type: { type: String, enum: ["ai generated", "company", "coding", null] },
    roll_no: { type: String },
    actor_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "credittransactions" }
);

CreditTransactionSchema.index({ tenant_id: 1, createdAt: -1 });
// At most one consume and one refund per interview, enforced by the database.
CreditTransactionSchema.index(
  { interview_id: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: { $in: ["consume", "refund"] } } }
);
CreditTransactionSchema.index(
  { tenant_id: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: "opening_balance" } }
);

module.exports = mongoose.model("creditTransaction", CreditTransactionSchema);
