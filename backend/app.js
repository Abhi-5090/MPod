const mongoose = require("mongoose");
const env = require("./src/config/env");
const app = require("./src/app");
const { detectTransactions } = require("./src/lib/db");
const evaluationQueue = require("./src/services/evaluationQueue");

async function main() {
  await mongoose.connect(env.mongoUri);
  console.log("Connected to DB");
  await detectTransactions();
  evaluationQueue.start();

  const server = app.listen(env.port, () => console.log(`Server started on port ${env.port}`));

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    evaluationQueue.stop();
    server.close(() => mongoose.disconnect().finally(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

process.on("unhandledRejection", (err) => console.error("[unhandledRejection]", err));

main().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
