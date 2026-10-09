# mPod

mPod is an AI mock-interview platform for colleges. A college buys interview credits and schedules interviews for its students. Students take them on the mPod kiosk on campus or on the website. The AI scores the answers, and students and staff see a report.

| Folder | App | Dev URL |
|---|---|---|
| `backend/` | Express + MongoDB API | http://localhost:8002/backend |
| `frontend/` | Student website, kiosk screen, reports (React + Vite) | http://localhost:3000 |
| `Admin/` | Admin portal for platform admins and college staff (React + Vite) | http://localhost:8003/admin |

How to use the product (every role, every screen) is in **[USER_GUIDE.md](USER_GUIDE.md)**.

---

## Quick start

You need **Node.js 20+** and **MongoDB**:

```bash
brew tap mongodb/brew && brew install mongodb-community
```

You don't need to start MongoDB yourself; `npm run dev` does it.

```bash
npm run setup      # once: installs all three apps, creates backend/.env.development.local
npm run dev        # starts DB + backend + student site + admin portal together
npm run seed       # once, in a second terminal while dev is running: demo data and logins
```

Then open:

- Student site: http://localhost:3000. Log in as `STUDENT1` / `Passw0rd!`.
- Admin portal: http://localhost:8003/admin. Log in as `COLLEGEADM` (college admin) or `ADMIN1` (platform admin), password `Passw0rd!`.

Press **Ctrl+C** once to stop everything.

### All commands (run from the `mPod/` folder)

| Command | What it does |
|---|---|
| `npm run setup` | Installs dependencies for all apps and creates the local dev env file. Safe to re-run. |
| `npm run dev` | Starts database, backend, student site and admin portal (colour-coded logs) |
| `npm run dev:backend` / `dev:frontend` / `dev:admin` / `dev:db` | Starts just one of them |
| `npm run seed` | Creates demo college, users, syllabus and question banks in the **local** database |
| `npm test` | Runs the backend test suite (in-memory database, safe) |
| `npm run build` | Production builds of the student site and admin portal (into `frontend/build` and `Admin/build`) |
| `npm run migrate` | Dry run of the one-time production data migration (add `-- --apply` to apply) |

### Demo logins created by `npm run seed`

The password for all of them is `Passw0rd!`.

| User id | Role | Use it for |
|---|---|---|
| `ADMIN1` | Platform admin | Admin portal: colleges, credits, syllabus, question banks |
| `COLLEGEADM` | College admin (Demo College) | Admin portal: students, interviews, kiosks, credits |
| `TRAINER1` | Trainer | Admin portal: scheduling interviews |
| `STUDENT1`, `STUDENT2` | Students | Student website, kiosk |

---

## How the local setup works

- **Database.** `npm run dev` starts a local MongoDB replica set on port **27018**, with data in `backend/.dev-db/`. It keeps your data between runs. To start over, stop dev, delete `backend/.dev-db/`, then run dev and seed again.
- **Backend config.**
  - `backend/.env` holds the real settings: the AI provider and OpenAI key, email, `JWT_SECRET`.
  - `backend/.env.development.local`, created by setup, overrides them for local work. It points to the local database and uses plain-HTTP cookies.
  - **That's why `npm run dev` never touches the production database.** To deliberately use another database locally, change `MONGODB_URI` in `backend/.env.development.local`.
- **Front-ends.** Both call the API on their own address under `/backend`, and the Vite dev server forwards that to `http://localhost:8002`. Because of this:
  - there is no CORS setup,
  - the login cookie just works,
  - no API URLs need to be configured.

  The old `REACT_APP_*` lines in `frontend/.env` and `Admin/.env` are no longer used.
- **Ports in use?** If you see `Port 8002 is already in use`, an old backend is still running. Stop it with Ctrl+C in its terminal, or run `lsof -ti tcp:8002 | xargs kill`. Do the same for ports 3000 and 8003.

### Troubleshooting

| Symptom | Fix |
|---|---|
| `Port ... is already in use` | An old dev server is still running. Stop it (see above). |
| `mongod not found` | `brew tap mongodb/brew && brew install mongodb-community`. Until then, dev uses a temporary in-memory database. |
| Login works, but every page says "Please login" | Make sure you opened the app on `localhost` (not `127.0.0.1`) and started it with `npm run dev`. |
| Yellow "AI service unavailable" banner, or interviews stuck on "Waiting for AI" | The AI provider can't be used: for OpenAI a missing, wrong, restricted or out-of-quota key; for Ollama the server is not running or a model is not installed. The banner shows the reason and the fix. Fix it, restart the backend, and the waiting interviews are scored automatically. Interviews keep working meanwhile, using bank and template questions. Run `npm run ai:check` to test the setup. |
| No OTP email arrives | Set `EMAIL_USER` / `EMAIL_PASS` (a Gmail app password) in `backend/.env`. |
| Voice answer box doesn't appear | Use Chrome and allow the microphone, or click **Type instead**. |

---

## Production

1. **Back up the database.**
2. **Backend:** run `npm ci` in `backend/`, then start it with `NODE_ENV=production npm start` (use pm2 or systemd to keep it running). Required in `backend/.env`:
   - `MONGODB_URI` (a replica set)
   - `JWT_SECRET` (32+ random characters)
   - `AI_PROVIDER` (`openai` or `ollama`), optional `AI_FALLBACK_PROVIDER`, and `OPENAI_API_KEY` when OpenAI is used
   - `EMAIL_USER`, `EMAIL_PASS`
   - `CORS_ORIGINS=https://mpod.ai`
   - `TRUST_PROXY` (`1` when behind nginx on another host)
3. **One-time migration:** run `npm run migrate` (dry run, reports what it would change), then `npm run migrate -- --apply`.
4. **Front-ends:** `npm run build`, then serve:
   - `frontend/build` at `https://mpod.ai/`
   - `Admin/build` at `https://mpod.ai/admin/`
   - and proxy `https://mpod.ai/backend/` to the Node server.

   Both are single-page apps, so unknown paths must fall back to `index.html`.
5. **Kiosks:** register each campus kiosk once at `https://mpod.ai/kiosk-setup`, signed in as that college's admin.
6. Everyone has to log in again after this release.

To run everything, including the AI models, on an NVIDIA DGX Spark, follow [DEPLOY_DGX_SPARK.md](DEPLOY_DGX_SPARK.md).

## AI providers

All AI calls go through one gateway (`backend/src/services/ai/`) and work with either provider:

| Setting | Meaning |
|---|---|
| `AI_PROVIDER=openai` | Hosted OpenAI models (default) |
| `AI_PROVIDER=ollama` | Self-hosted models through Ollama, e.g. on a DGX Spark |
| `AI_FALLBACK_PROVIDER=openai\|ollama\|none` | Used automatically while the primary is unavailable |

To try Ollama locally, install Ollama, pull a model, and put the provider and model settings in `backend/.env.development.local`. For example: `AI_PROVIDER=ollama` plus `OLLAMA_SCORING_MODEL`, `OLLAMA_GENERATION_MODEL`, `OLLAMA_SUMMARY_MODEL` and `OLLAMA_CODING_MODEL`, all set to `qwen2.5-coder:1.5b`. Then run `npm run ai:check`. `npm run ai:calibrate` compares how the providers score the same answers.

## Security model (summary)

- **Routes are closed by default.** Every API route requires a login unless it is listed as public (login, OTP, kiosk registration, health check).
- **Three kinds of caller:**
  - students (`userSessionToken` cookie)
  - staff (`adminSessionToken` cookie)
  - registered kiosks (`kioskDeviceToken` cookie)

  Sessions can be revoked on the server.
- **College scoping.** College staff only see and change their own college. Platform admins see all colleges.
- **Server-owned interviews.** Interviews are issued, timed and saved by the server. Submitting is idempotent, and evaluation runs in the background with retries.
- **Credit ledger.** Credits change only through the append-only `credittransactions` ledger.
