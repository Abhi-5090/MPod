/**
 * Local development MongoDB (single-node replica set, so transactions work).
 *
 *   npm run db      (also started automatically by `npm run dev` at the repo root)
 *
 * Data is kept in backend/.dev-db between runs. Uses the `mongod` on your PATH
 * (e.g. `brew install mongodb-community`); falls back to a throwaway in-memory
 * server if mongod is not installed.
 */
const fs = require("fs");
const path = require("path");
const { spawn, execSync } = require("child_process");
const { MongoClient } = require("mongodb");

const PORT = Number(process.env.DEV_DB_PORT || 27018);
const DATA_DIR = path.resolve(__dirname, "../.dev-db");
const URI = `mongodb://127.0.0.1:${PORT}/?directConnection=true`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function tryConnect(timeoutMs = 1000) {
  try {
    const c = await MongoClient.connect(URI, { serverSelectionTimeoutMS: timeoutMs });
    return c;
  } catch (_) {
    return null;
  }
}

async function ensureReplicaSet(client) {
  try {
    const hello = await client.db("admin").command({ hello: 1 });
    if (hello.setName) return;
    await client.db("admin").command({ replSetInitiate: { _id: "rs0", members: [{ _id: 0, host: `127.0.0.1:${PORT}` }] } });
  } catch (e) {
    if (!/already initialized/i.test(e.message)) throw e;
  }
  for (let i = 0; i < 40; i++) {
    // eslint-disable-next-line no-await-in-loop
    const hello = await client.db("admin").command({ hello: 1 });
    if (hello.isWritablePrimary) return;
    // eslint-disable-next-line no-await-in-loop
    await sleep(250);
  }
}

function findMongod() {
  if (process.env.MONGOD_BIN) return process.env.MONGOD_BIN;
  try {
    return execSync("command -v mongod", { stdio: ["ignore", "pipe", "ignore"], shell: "/bin/sh" }).toString().trim() || null;
  } catch (_) {
    return null;
  }
}

async function main() {
  const existing = await tryConnect();
  if (existing) {
    await ensureReplicaSet(existing);
    await existing.close();
    console.log(`[db] Development database already running on port ${PORT}.`);
    return; // keep it simple: whoever started it owns it
  }

  const mongod = findMongod();
  if (!mongod) {
    console.warn("[db] mongod not found - starting a temporary in-memory database (data is lost when it stops).");
    console.warn("[db] For a persistent dev database: brew tap mongodb/brew && brew install mongodb-community");
    const { MongoMemoryReplSet } = require("mongodb-memory-server");
    const rs = await MongoMemoryReplSet.create({ replSet: { count: 1, name: "rs0", storageEngine: "wiredTiger" }, instanceOpts: [{ port: PORT }] });
    console.log(`[db] In-memory development database ready on port ${PORT}.`);
    const stop = async () => {
      await rs.stop();
      process.exit(0);
    };
    process.on("SIGINT", stop);
    process.on("SIGTERM", stop);
    return;
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const child = spawn(
    mongod,
    ["--replSet", "rs0", "--dbpath", DATA_DIR, "--port", String(PORT), "--bind_ip", "127.0.0.1", "--quiet", "--logappend", "--logpath", path.join(DATA_DIR, "mongod.log")],
    { stdio: ["ignore", "inherit", "inherit"] }
  );
  child.on("exit", (code) => {
    console.log(`[db] mongod exited (${code}). See backend/.dev-db/mongod.log`);
    process.exit(code || 0);
  });
  const stop = () => child.kill("SIGINT");
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  let client = null;
  for (let i = 0; i < 60 && !client; i++) {
    // eslint-disable-next-line no-await-in-loop
    client = await tryConnect(500);
    // eslint-disable-next-line no-await-in-loop
    if (!client) await sleep(500);
  }
  if (!client) {
    console.error("[db] mongod did not start. See backend/.dev-db/mongod.log");
    child.kill("SIGINT");
    return;
  }
  await ensureReplicaSet(client);
  await client.close();
  console.log(`[db] Development database ready: mongodb://127.0.0.1:${PORT} (data in backend/.dev-db)`);
}

main().catch((e) => {
  console.error("[db]", e);
  process.exit(1);
});
