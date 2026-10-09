/**
 * Concurrency limiter with two priorities.
 *
 * A self-hosted GPU serves only a few requests at a time; sending more just makes every
 * request slower and causes timeouts. Interactive calls (a student is waiting: question
 * generation, the coding idea check) always get the next free slot before background
 * scoring calls.
 */
function createLimiter(max) {
  const limit = Math.max(1, Number(max) || 1);
  let active = 0;
  const queues = { interactive: [], batch: [] };

  const next = () => {
    if (active >= limit) return;
    const job = queues.interactive.shift() || queues.batch.shift();
    if (!job) return;
    active++;
    Promise.resolve()
      .then(job.fn)
      .then(job.resolve, job.reject)
      .finally(() => {
        active--;
        next();
      });
  };

  return {
    run(fn, { interactive = false } = {}) {
      return new Promise((resolve, reject) => {
        queues[interactive ? "interactive" : "batch"].push({ fn, resolve, reject });
        next();
      });
    },
    stats: () => ({ limit, active, waiting: queues.interactive.length + queues.batch.length }),
  };
}

module.exports = { createLimiter };
