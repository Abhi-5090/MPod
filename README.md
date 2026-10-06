# mPod

mPod is an AI mock-interview platform for colleges. A college buys interview credits and schedules interviews for its students. Students take them on the mPod kiosk on campus or on the website. The AI scores the answers and the student gets a report.

| Folder | What it is | Dev port |
|---|---|---|
| `backend/` | Express + MongoDB API (`/backend/api/*`) | 8002 |
| `frontend/` | Student website, kiosk screen (`/home-2`) and reports | 3000 |
| `Admin/` | Admin portal for platform admins and college staff (served under `/admin`) | 8003 |

## Requirements

- **Node.js** 18.18 or newer (20 LTS recommended).
- **MongoDB 6+ running as a replica set.** Credit updates use transactions. A single-node replica set is fine for development.
- **An OpenAI API key** whose project allows model requests (`model.request` scope).
- **A Gmail account with an app password**, for OTP and schedule emails. Optional in development.

## 1. Start MongoDB locally (development)

```bash
mkdir -p ~/mpod-db
mongod --replSet rs0 --dbpath ~/mpod-db --port 27017 --bind_ip 127.0.0.1
# in another terminal, once:
mongosh --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"127.0.0.1:27017"}]})'
```

If `mongosh` isn't installed, run `brew install mongosh`.

## 2. Backend

```bash
cd backend
cp .env.example .env        # then fill in values (see below)
npm install
npm test                    # 170 tests, in-memory MongoDB, no network or real DB used
MONGODB_URI="mongodb://127.0.0.1:27017/mpod_dev?replicaSet=rs0" npm run seed:dev   # demo data (local DB only)
npm run dev                 # http://localhost:8002/backend
```

### Environment variables

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | yes | Production must be a replica set |
| `JWT_SECRET` | yes | Long random string (32+ characters). Changing it logs everyone out. |
| `OPENAI_API_KEY` | yes | Key must allow model requests |
| `EMAIL_USER`, `EMAIL_PASS` | prod | Gmail address and app password |
| `NODE_ENV` | prod | Set to `production`. Enables Secure cookies and hides error details. |
| `CORS_ORIGINS` | prod | Comma-separated, e.g. `https://mpod.ai` |
| `TRUST_PROXY` | prod | `1` behind nginx or a load balancer on another host; `loopback` (default) for nginx on the same host |

Optional settings (model overrides, timings) are documented in `backend/.env.example`.

### Demo logins from `seed:dev`

The password for all of them is `Passw0rd!`.

- `ADMIN1`: platform admin (Admin portal)
- `COLLEGEADM`: college admin of "Demo College" (Admin portal; can register kiosks)
- `TRAINER1`: trainer (Admin portal, schedules interviews)
- `STUDENT1`, `STUDENT2`: students (student website)

## 3. Student website

```bash
cd frontend
cp .env.example .env
```

For local development, edit `.env` to point at your local backend:

```
REACT_APP_PUBLIC_BACKEND_URL=http://localhost:8002/backend/api/
REACT_APP_PUBLIC_BACKEND_IMAGE_URL=http://localhost:8002/backend/
REACT_APP_PUBLIC_BACKEND_MODEL_URL=http://localhost:8002/backend/models/
```

Then install and start:

```bash
npm install --legacy-peer-deps
npm start                   # http://localhost:3000
```

## 4. Admin portal

```bash
cd Admin
cp .env.example .env
```

Edit `.env`:

```
REACT_APP_MPOD_BACKEND_URL=http://localhost:8002/backend/api/
REACT_APP_BACKEND_IMAGE_URL=http://localhost:8002/backend/
REACT_APP_STUDENT_APP_URL=http://localhost:3000/
```

Then install and start:

```bash
npm install --legacy-peer-deps
npm start                   # http://localhost:8003/admin
```

Cookies are `SameSite=Strict`. Cookie "site" ignores the port, so the apps work together on `localhost`. In production, serve all three under the same domain:

- `https://mpod.ai/` for the student site
- `https://mpod.ai/admin/` for the Admin portal
- `https://mpod.ai/backend/` proxied to the API

## 5. Try the whole flow locally

1. Admin portal: log in as `COLLEGEADM`. Go to **AI Interviews → Company interviews → Add**, choose platform **web**, roll number `STUDENT1`, company "Demo Corp", and a start time 1–2 minutes from now. One credit is charged; see **Credits**.
2. Student site: log in as `STUDENT1`. On the dashboard, click **Attempt** when it becomes available, answer by voice (Chrome) or by typing, and submit. The report opens when the evaluation finishes.
3. Kiosk: open `http://localhost:3000/kiosk-setup` and register the kiosk with `COLLEGEADM`. Schedule an interview with platform **mpod**, then open `/home-2` and enter the roll number. Revoke kiosks from the Admin portal under **Kiosk devices**.

## Deploying to production

1. **Back up the database.**
2. Deploy the backend with `NODE_ENV=production`. Then run the one-time migration:
   - `npm run migrate` does a dry run and reports what it would change.
   - `npm run migrate -- --apply` applies it. This creates credit-ledger opening balances, stamps the college on existing interviews, removes stored legacy session tokens and plaintext OTPs, and builds indexes.
3. Build the front-ends with production `.env` values:
   - Student site: `npm run build`
   - Admin portal: `npm run build`, served under `/admin/`
   Serve the static `build/` folders; don't use `npm start` in production.
4. Register each campus kiosk once at `https://mpod.ai/kiosk-setup`, signed in as that college's admin.
5. Everyone has to log in again after this release, because the old session format is no longer accepted.

## Security model (summary)

- **Routes are closed by default.** Every API route requires a login unless it is listed as public (login, OTP, kiosk registration, health check).
- **Three kinds of caller:**
  - students (`userSessionToken` cookie)
  - staff (`adminSessionToken` cookie)
  - registered kiosks (`kioskDeviceToken` cookie)
  Sessions are revocable server-side.
- **College scoping.** College staff only see and change their own college's data. Platform admins (`admin`, `superadmin`) see all colleges.
- **Server-owned interviews.** Interviews are issued, timed and saved by the server. The browser only sends answers, using a per-attempt token. Submitting is idempotent, and evaluation runs in the background with automatic retries.
- **Credit ledger.** Credits change only through the append-only ledger (`credittransactions`), using atomic updates.
