const mongoose = require("mongoose");
const env = require("./src/config/env");
const app = require("./src/app");
const { detectTransactions } = require("./src/lib/db");
const evaluationQueue = require("./src/services/evaluationQueue");

async function main() {
  // Retry for a while so the server can start before the database is ready (e.g. in `npm run dev`).
  for (let attempt = 1; ; attempt++) {
    try {
      await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
      break;
    } catch (err) {
      if (attempt >= 12) throw err;
      console.log(`Waiting for the database (${err.message.split("\n")[0]})...`);
      await new Promise((r) => setTimeout(r, 2500));
    }
  }
  const dbHost = (env.mongoUri.match(/@([^/?]+)/) || env.mongoUri.match(/\/\/([^/?]+)/) || [])[1] || "?";
  console.log(`Connected to DB (${dbHost})`);
  // A just-started local replica set needs a moment to elect itself primary.
  const expectsReplicaSet = /[?&]replicaSet=/.test(env.mongoUri);
  for (let i = 0; i < 20; i++) {
    const hello = await mongoose.connection.db.admin().command({ hello: 1 }).catch(() => ({}));
    if (!expectsReplicaSet || (hello.setName && hello.isWritablePrimary)) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  await detectTransactions();
  evaluationQueue.start();

  const server = app.listen(env.port, () => console.log(`Server started on http://localhost:${env.port}/backend`));
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${env.port} is already in use - another backend is probably still running.`);
      console.error(`Stop it (Ctrl+C in its terminal, or: lsof -ti tcp:${env.port} | xargs kill) and start again.`);
    } else {
      console.error("Server error:", err);
    }
    process.exit(1);
  });

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
