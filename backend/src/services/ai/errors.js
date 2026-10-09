/**
 * Normalised AI provider errors.
 *
 * Every provider adapter throws AiError, so the rest of the app can decide what to do
 * without knowing which provider was used:
 *  - outage reasons mean "the provider can't serve anything right now" (fail over,
 *    use fallbacks, retry later, don't count it against the interview);
 *  - any other reason is a problem with this one request.
 */
const OUTAGE_REASONS = new Set([
  "no_key", // provider not configured
  "auth", // key rejected / missing permission
  "quota", // billing limit
  "rate_limit",
  "network", // cannot reach the provider
  "timeout", // no answer in time (server overloaded, model loading)
  "overloaded", // provider says it's busy
  "provider", // provider-side 5xx
  "model_missing", // model not installed / not available to this key
]);

class AiError extends Error {
  constructor(message, { provider, reason = "error", status = null, hint = null, models, cause } = {}) {
    super(message);
    if (models) this.models = models; // for model_missing: the models that are not available
    this.name = "AiError";
    this.provider = provider;
    this.reason = reason;
    this.status = status;
    this.hint = hint;
    if (cause) this.cause = cause;
  }

  get outage() {
    return OUTAGE_REASONS.has(this.reason);
  }
}

module.exports = { AiError, OUTAGE_REASONS };
