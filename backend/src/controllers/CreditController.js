const credits = require("../services/credits");
const { resolveTenantScope } = require("../middlewares/auth");
const { asyncHandler, toObjectId, toInt } = require("../lib/http");

/** POST /tenants/:id/credits { amount, type: "topup" | "adjust", reason } — platform staff. */
const addCredits = asyncHandler(async (req, res) => {
  const tenantId = toObjectId(req.params.id, "tenant id");
  const amount = toInt(req.body?.amount, { field: "amount" });
  const { tenant, transaction } = await credits.addCredits({
    tenantId,
    amount,
    type: req.body?.type || "topup",
    reason: req.body?.reason,
    actorId: req.auth.user._id,
  });
  return res.status(200).json({ message: "Credits updated", tenant, transaction });
});

/** GET /tenants/:id/credit-transactions?page=&limit= — platform staff or the college's tenant admin. */
const listTransactions = asyncHandler(async (req, res) => {
  const tenantId = resolveTenantScope(req, req.params.id);
  const result = await credits.listTransactions(tenantId, { page: req.query.page, limit: req.query.limit });
  return res.status(200).json(result);
});

module.exports = { addCredits, listTransactions };
