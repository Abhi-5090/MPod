const mongoose = require("mongoose");

// Fields shared by the three interview collections (technology / company / coding)
// for tenant ownership and the server-owned interview session.
module.exports = function interviewSessionPlugin(schema) {
  schema.add({
    tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: "tenant" },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },

    attempt: {
      started_at: Date,
      deadline_at: Date,
      token_hash: { type: String, select: false },
      device_id: { type: mongoose.Schema.Types.ObjectId, ref: "kioskDevice" },
      platform: String,
      resumes: { type: Number, default: 0 },
      generation_failed_at: Date,
    },
    // Questions issued by the server when the attempt started. Answers are only
    // accepted for these ids; the client never supplies question text.
    issued_questions: { type: Array, default: undefined },
    answers: { type: Array, default: undefined },
    // Per-question idea-check results for coding interviews, recorded server-side.
    idea_checks: { type: Array, default: undefined },

    submitted_at: Date,
    evaluation_status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", null],
      default: null,
    },
    evaluation_lease_until: Date,
    evaluation_lease_id: String,
    evaluation_attempts: { type: Number, default: 0 },
    evaluation_error: String,
    evaluated_at: Date,
    credit_refunded: { type: Boolean, default: false },
  });

  schema.index({ roll_no: 1, start_date_time: -1 });
  schema.index({ tenant_id: 1, start_date_time: -1 });
  schema.index({ evaluation_status: 1, evaluation_lease_until: 1 });
  schema.index({ status: 1, start_date_time: -1 });
};
