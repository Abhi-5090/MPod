// One-time (and safe to re-run) setup: installs all three apps and creates the
// local development env file. Usage: npm run setup
import { execSync } from "node:child_process";
import { existsSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, cwd = root) => {
  console.log(`\n> ${cmd}${cwd !== root ? `   (in ${cwd.replace(root + "/", "")})` : ""}`);
  execSync(cmd, { cwd, stdio: "inherit" });
};

const [major] = process.versions.node.split(".").map(Number);
if (major < 20) {
  console.error(`Node.js 20 or newer is required (you have ${process.versions.node}).`);
  process.exit(1);
}

run("npm install --no-audit --no-fund");
for (const app of ["backend", "frontend", "Admin"]) {
  run("npm install --no-audit --no-fund --legacy-peer-deps", join(root, app));
}

const backendEnv = join(root, "backend/.env");
if (!existsSync(backendEnv)) {
  copyFileSync(join(root, "backend/.env.example"), backendEnv);
  console.log("\nCreated backend/.env from .env.example - fill in JWT_SECRET, OPENAI_API_KEY and EMAIL_* before using AI/email features.");
}

const devEnv = join(root, "backend/.env.development.local");
if (!existsSync(devEnv)) {
  writeFileSync(
    devEnv,
    [
      "# Local development overrides (git-ignored). Values here win over backend/.env",
      "# and are never used when NODE_ENV=production.",
      "#",
      "# The local database started by `npm run dev` (port 27018, data in backend/.dev-db):",
      "MONGODB_URI=mongodb://127.0.0.1:27018/mpod_dev?replicaSet=rs0&directConnection=true",
      "NODE_ENV=development",
      "COOKIE_SECURE=false",
      "CORS_ORIGINS=http://localhost:3000,http://localhost:8003",
      "",
    ].join("\n")
  );
  console.log("\nCreated backend/.env.development.local (local dev database, plain-HTTP cookies).");
}

console.log(`
Setup complete.

  npm run dev     start database + backend + student site + admin portal
  npm run seed    (first time) create demo data and logins

  Student site : http://localhost:3000
  Admin portal : http://localhost:8003/admin
  API          : http://localhost:8002/backend
`);
