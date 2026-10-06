const mongoose = require("mongoose");

// A physical mPod booth registered to one college (tenant).
const KioskDeviceSchema = new mongoose.Schema(
  {
    tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: "tenant", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    status: { type: String, enum: ["active", "revoked"], default: "active" },
    registered_by: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    revoked_by: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    revoked_at: { type: Date },
    last_seen_at: { type: Date },
  },
  { timestamps: true, collection: "kioskdevices" }
);

module.exports = mongoose.model("kioskDevice", KioskDeviceSchema);
