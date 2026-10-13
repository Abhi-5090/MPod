# mPod: Application Overview

> **What this document is.** A complete, implementation-accurate description of mPod as it exists in this repository: every feature, screen, form field, business rule, API, data model and background process, for the backend, the student website and kiosk, and the admin portal. It was generated from the source code (October 2026) and is meant to be given to a product or engineering reviewer, human or AI, to plan enterprise-grade enhancements.
>
> **How to use it with an AI assistant.** Paste the whole document, then ask, for example: *"Act as a principal product manager and architect at a large enterprise SaaS company. Using this specification, propose a prioritised enhancement roadmap (features, UX, security, scalability, analytics, compliance) without changing the product's core purpose. For each item give the problem, the proposed design (screens, fields, APIs, data model changes), acceptance criteria and effort."*

---

## Table of contents
1. [Product summary](#1-product-summary)
2. [System architecture](#2-system-architecture)
3. [Roles and permissions](#3-roles-and-permissions)
4. [Domain model and hierarchy](#4-domain-model-and-hierarchy)
5. [End-to-end workflows](#5-end-to-end-workflows)
6. [Backend: features and logic](#6-backend-features-and-logic)
7. [Student website and kiosk (frontend)](#7-student-website-and-kiosk-frontend)
8. [Admin portal](#8-admin-portal)
9. [API reference](#9-api-reference)
10. [Data model (collections and fields)](#10-data-model-collections-and-fields)
11. [Business rules, limits and configuration](#11-business-rules-limits-and-configuration)
12. [Non-functional design](#12-non-functional-design)
13. [Known limitations and enhancement opportunities](#13-known-limitations-and-enhancement-opportunities)

---

## 1. Product summary

**mPod** is a multi-tenant, AI-assisted **mock-interview platform for colleges**. A college (called a *tenant*) buys interview **credits**. College staff schedule timed interviews for their students. Students take the interviews either:
- on a physical **mPod kiosk** (booth) on campus (platform `mpod`), or
- on the **student website** from their own computer (platform `web`).

The AI generates or selects questions, reads them aloud, captures spoken or typed answers, scores every answer, and produces a report. Colleges get dashboards; the platform owner gets cross-college analytics.

| Item | Description |
|---|---|
| Primary users | Engineering students preparing for campus placements |
| Buyers / operators | College placement cells (college admin, placement admin, trainer) |
| Platform owner | Technical Hub (platform admin, super admin) |
| Unit of value | One evaluated interview = one credit |
| Interview types | **Technology** (AI-generated from a syllabus), **Company** (from a company question bank), **Coding** (from a coding problem bank: idea → code → optimise) |
| Channels | Student website, campus kiosk, admin portal |
| AI provider | Pluggable AI gateway: self-hosted models on the NVIDIA DGX Spark (`dgx`: URL + API key, Ollama or OpenAI-compatible protocol) or OpenAI (hosted), with automatic failover (question generation, answer scoring, coding review, idea check). Camera model on the DGX Spark, with the browser model as fallback. |

**Three applications in one repository:**

| App | Folder | Tech | Dev URL |
|---|---|---|---|
| Backend API | `backend/` | Node.js 20, Express 4, Mongoose 7 (MongoDB replica set), OpenAI SDK + Ollama REST API (DGX Spark), Nodemailer | `http://localhost:8002/backend` |
| Student website + kiosk + reports | `frontend/` | React 18, Vite 5, React Router 6, axios, react-speech-recognition, Web Speech TTS, face-api.js, react-to-pdf | `http://localhost:3000` |
| Admin portal | `Admin/` | React 18, Vite 5, React Router 6 (base `/admin`), Redux (layout only), reactstrap/Bootstrap 5, react-select, flatpickr, MDB/react-bootstrap-table, ApexCharts/Recharts, xlsx | `http://localhost:8003/admin` |

---

## 2. System architecture

### 2.1 Component view
```
                ┌──────────────────────┐        ┌───────────────────────┐
 Students ────▶ │ Student website      │        │ Admin portal (/admin) │ ◀──── College staff / platform admins
 Kiosk booth ─▶ │ (+ /home-2 kiosk UI) │        │                       │
                └──────────┬───────────┘        └───────────┬───────────┘
                           │ same-origin /backend/api/* (httpOnly cookies)
                           ▼                                 ▼
                ┌──────────────────────────────────────────────────────┐
                │ Backend API (Express)                                │
                │  auth & RBAC • tenant scoping • scheduling • credits │
                │  interview sessions • evaluation queue • AI status   │
                │  reports • dashboards • uploads • rate limiting      │
                └───────┬──────────────┬───────────────┬──────────────┘
                        │              │               │
                  MongoDB (replica   AI gateway:     SMTP (Gmail)
                  set; 17 collections) DGX/OpenAI   OTP & schedule emails
                        │
                Local disk: profile photos, technology/module icons,
                face-api models (served by the API)
```

### 2.2 Request and auth model
- **Same origin.** All browser calls go to `/backend/api/*` on the site's own origin. In development, Vite proxies `/backend` to the API on port 8002. In production, all three apps sit under one domain (`/`, `/admin/`, `/backend/`).
- **Cookies.** Sessions are **httpOnly cookies** (`SameSite=Strict`, `Secure` in production). There are three principals:
  - `userSessionToken`: student
  - `adminSessionToken`: staff
  - `kioskDeviceToken`: registered kiosk device
- **Session revocation.** Each JWT carries a random session id (`sid`) that is also stored on the user (or kiosk device) record. Logging out, resetting a password, deactivating the account or changing its role invalidates the session server-side.
- **Interview attempt token.** Calls made while a student takes an interview (answer, idea check, submit, status) use a per-attempt bearer token (`X-Attempt-Token`). The server stores only its SHA-256 hash.
- **Deny by default.** Every API route requires a principal, except login, OTP, kiosk registration, health and server time.

### 2.3 Backend layering
```
routes/*.js        → access rules (requireStaff(roles), requireStudent, requireKiosk, reportAccess, scopeTenantParam, rate limits, upload limits)
controllers/*.js   → request validation and response shaping
services/*.js      → business logic: scheduling, credits (ledger), interviewSession, evaluation (AI prompts),
                     evaluationQueue (background jobs), provisionalScoring, aiStatus, interviewModels (access checks), mailer
models/*.js        → Mongoose schemas (+ plugins/interviewSession.js shared by the 3 interview collections)
middlewares/*.js   → auth, rateLimits, upload, errorHandler
lib/*.js           → HTTP errors, ObjectId/number/date validation, DB transactions, IST day ranges
config/*.js        → env loading/validation, roles and permissions, filesystem paths
scripts/*.js       → migrate.js (one-time data migration), seed-dev.js (local demo data), dev-db.js (local MongoDB)
```

### 2.4 Background processing (inside the API process)
| Job | Trigger | What it does |
|---|---|---|
| Evaluation worker | On submit (in-process queue, concurrency `EVALUATION_CONCURRENCY` = 3) | Claims an interview with a lease (`evaluation_lease_id`, 5 min, heartbeat every 60 s) and scores it with the AI. Writes the results, or a provisional score, or schedules a retry. |
| Sweeper | Every 60 s and at startup | Re-queues pending/expired leases. Auto-submits attempts whose time ran out (deadline + 10 min grace). Re-scores provisional results with the AI when the AI is available. |
| AI health check | Startup + every 10 min, and updated by every AI call | One-token request; tracks available / reason / message for the admin banner and fallbacks. |

### 2.5 Development and deployment
- `npm run setup` installs all apps and creates `backend/.env.development.local`, which points to a local database.
- `npm run dev` starts four processes: local MongoDB replica set (port 27018, data in `backend/.dev-db`), API (node --watch), student site, admin portal.
- `npm run seed` loads demo data. `npm test` runs the backend tests (Jest + Supertest + in-memory MongoDB, 191 tests).
- **Production:** `NODE_ENV=production npm start` for the API. Static builds of `frontend/build` and `Admin/build` are served under one domain. Run `npm run migrate -- --apply` once on existing data.

---

## 3. Roles and permissions

| Role (`user.role`) | Type | Portal | Scope |
|---|---|---|---|
| `superadmin` | Platform | Admin | All colleges |
| `admin` | Platform | Admin | All colleges |
| `tenantadmin` (college admin) | College staff | Admin | Own college only |
| `placementadmin` | College staff | Admin | Own college only |
| `trainer` | College staff | Admin | Own college only |
| anything else (e.g. `student`) | Student | Student website / kiosk | Own data only |
| registered kiosk device | Device | Kiosk screen | Students of the device's college; `mpod` interviews only |

**Permission matrix** (enforced by the backend, mirrored in the admin menu and routes):

| Capability | superadmin/admin | tenantadmin | placementadmin / trainer | Student |
|---|:-:|:-:|:-:|:-:|
| Dashboard (college stats) | ✓ (platform view) | ✓ | ✓ | – |
| Platform-wide stats | ✓ | – | – | – |
| Manage colleges (tenants) | ✓ | – | – | – |
| Add / adjust credits | ✓ | – | – | – |
| View credit history | ✓ (any college) | ✓ (own) | – | – |
| Manage syllabus & question banks | ✓ | – | – | – |
| View syllabus/banks (to schedule) | ✓ | ✓ | ✓ | – |
| Import / edit / deactivate users | ✓ (students + college staff roles) | ✓ (students only) | – | – |
| List students for scheduling | ✓ | ✓ | ✓ | – |
| Schedule / edit / delete interviews | ✓ | ✓ | ✓ | – |
| Retry evaluation / re-score with AI | ✓ | ✓ | ✓ | – |
| Register / revoke kiosks | ✓ | ✓ | – | – |
| Take interviews, view own reports | – | – | – | ✓ |

Role assignment rules:
- Platform admins can assign `student`, `tenantadmin`, `placementadmin` and `trainer`.
- College admins can assign `student` only.
- Platform roles can never be assigned through the UI or import.
- A college admin cannot edit staff accounts.

---

## 4. Domain model and hierarchy

```
Tenant (college) ──< User (students & staff)        Tenant ──< CreditTransaction (ledger)
       │                                            Tenant ──< KioskDevice
       └─< Interview (technology) ─┐
       └─< CompanyInterview        ├─ attempt { started_at, deadline_at, token_hash, device_id, resumes }
       └─< CodingInterview        ─┘   issued_questions[], answers[], idea_checks[], question_details[] (scores),
                                       overall_analysis[], emotions, evaluation_* state, credit refund flag

Syllabus:        Technology ──< Module ──< Topic
Company bank:    Company ──< CompanyQuestion >── Tag      (type: service_based|product_based, round: TR1..TR4|MR1|HR1, year)
Coding bank:     CodingQuestion (complexity easy|medium|hard, time, description HTML, input, output, constraints)
Practice bank:   LiteInterviewQuestion (technology, question, model answer, companies[], previously-asked flag)
                 InterviewQuestionInteraction (student favourites / doubts)   LiteInterview (practice attempts)
```

**Interview lifecycle (all three types):**
```
scheduled (status 1)
  └─ start ── attempt claimed; questions issued; deadline set
       ├─ answers saved (autosave + final per question)
       └─ submit (or deadline auto-submit) → evaluation_status: pending
            ├─ AI OK          → completed (status 0, evaluation_mode "ai")
            ├─ AI outage      → technology/company: completed with evaluation_mode "provisional" (AI re-score queued)
            │                   coding: pending + waiting_for_ai (retried with backoff up to 72 h)
            └─ data error ×3  → failed (staff can retry)
not started within window → shown as Expired (credit not refunded unless deleted before start)
```

---

## 5. End-to-end workflows

### 5.1 Onboarding a college (platform admin)
1. **Add the college:** Admin → Tenants → Add Tenant, with name, unique code, contact, email, initial credits and interview duration. This creates the tenant and records a `topup` ledger entry for the initial credits.
2. **Create the college's staff:** Admin → Users → Add Users (Excel, choosing the college). Rows with `role` = `tenantadmin` / `placementadmin` / `trainer` create staff accounts.
3. **Register campus kiosks (optional):** at `/kiosk-setup` on each kiosk, signed in as the college admin.

### 5.2 Importing students (college admin)
1. Upload an Excel file with the columns `roll_no, email, password, first_name, mobile, gender, college, branch, passout_year, role`.
2. The backend validates every row and returns `inserted`, `existingRollNos` and `rejected[{row, roll_no, reason}]`:
   - `roll_no` must match `[A-Za-z0-9_-]{1,40}` and is stored in upper case.
   - The email must be valid and unique.
   - The password must be at least 8 characters, or an existing bcrypt hash.
   - The role must be one the importer may assign.
   - Duplicates are rejected, both inside the file and against existing users (case-insensitive).
3. Passwords are stored as bcrypt hashes.
4. Optionally, upload a zip of photos named `<ROLL>.png/jpg`. Only images of students in the caller's college are accepted. Images are checked by magic bytes, limited to 5 MB each and 300 MB unpacked, and stored as `<ROLL>.png`.

### 5.3 Scheduling interviews (any college staff)
1. Choose the type, platform (web/mpod), start date & time, and either one student (searchable dropdown) or a bulk Excel file (a `roll_no` column, up to 2,000 rows).
2. The backend checks:
   - the start time is no more than 5 minutes in the past and no more than 1 year ahead;
   - the student belongs to the college, is active and is not staff;
   - the student has no other pending interview within ± the college's interview duration (default 30 min);
   - the type-specific fields are valid (modules belong to the technology, topics belong to the modules, companies exist, question count 1–30, coding 1–10).
3. A transaction creates the interview and **atomically consumes 1 credit**. If credits are insufficient, nothing is created.
4. The student is emailed the schedule. Bulk scheduling returns HTTP 207 with per-row results.

### 5.4 Taking an interview on the website (student)
1. **Dashboard:** "Attempt" appears from 1 minute before the start to 5 minutes after it, or as "Resume" while an attempt is running.
2. **Instructions screen:** the server claims the attempt immediately and issues the questions, while a 15-second countdown runs (or the student clicks "Start now").
3. **Technology/company question loop:**
   1. Text-to-speech reads the question.
   2. A 5-second countdown follows.
   3. The student has 60 seconds to answer by voice (Chrome speech recognition, `en-IN`) or by typing ("Type instead").
   4. The answer is autosaved every 15 s and saved as *final* on "Next question".
4. **Coding:** see 5.6.
5. **Submit:** returns 202 and the UI polls the status every 3 s. On completion it redirects to the report. If scoring is delayed (coding waiting for the AI), it shows "Interview submitted… report will be ready automatically".

### 5.5 Kiosk interview
1. The kiosk was registered once (`/kiosk-setup`, college admin credentials) and holds a device cookie bound to the college.
2. **Lookup:** the student enters a roll number at `/home-2`. The server finds an `mpod` interview of that college that is startable now (or resumable).
3. **Interview:** same flow as the website. Afterwards the report is shown on the kiosk using the attempt token (valid for 2 h after submit). "Done – next student" clears it.

### 5.6 Coding interview
For each problem (the timer is the problem's `time` in minutes):
1. **Explain approach (idea):** server-side idea check by the AI. The student needs ≥ 50% to continue, with at most 5 checks per problem. If the AI is unavailable the check is skipped.
2. **Write code** (plain text area with copy/paste blocked).
3. **Optimise code.**

Camera-based attention tracking: the camera model (face detector, 68 landmarks, 7 expressions) runs on the DGX Spark when `DGX_VISION_URL` is set. The browser sends a 320-px frame about once per second to `POST /interview-session/face-frame`, and the backend forwards it with the key; frames are not stored. Otherwise, or when the service fails, face-api.js runs in the browser. It warns if the face is missing or more than one person is visible, and sends aggregate emotion and head-pose counts (plus which mode was used) with the submission.

### 5.7 Evaluation pipeline
- **Technology/company answers:** each one is scored by the AI against a rubric (0–100), returning accuracy, analysis, improvements and confidence. Up to 4 calls run in parallel, with the candidate text fenced as untrusted data. A summary call adds strengths, areas of improvement and 7 skill parameters.
- **Coding:** an AI code review (correctness %, time/space complexity, readability, naming, approach, observations) and an optimisation comparison.
- **AI outage:**
  - technology/company → **provisional score**, which is deterministic and explainable (see 6.8);
  - coding → waits for the AI;
  - in both cases the interview is re-scored automatically when the AI returns.

### 5.8 Credits
- Scheduling consumes 1 credit.
- Deleting an interview **before it starts** refunds it, once only.
- A platform admin can add credits (`topup`) or correct them (`adjust`, with a required reason; the balance can never go negative).
- Every change is an append-only ledger row with `balance_after` and the actor.

### 5.9 Password reset (any user)
1. Enter the user id. If the account exists, a 6-digit OTP is emailed. It is valid for 10 minutes, and at most 5 OTPs can be requested per hour, at least 60 s apart. The response is always generic.
2. Enter the OTP. Each attempt is reserved atomically, 5 attempts maximum, after which the OTP is burned.
3. Set a new password (8–128 characters). This ends all of the user's sessions.

---
## 6. Backend: features and logic

The backend is organised by module below. Exact endpoints and access rules are listed in section 9.

### 6.1 Authentication and sessions (`AuthController`, `middlewares/auth.js`)

**Student login** (`POST /login {roll_no, password, confirmLogout}`):
- The roll number is matched as typed or in upper case.
- The password is checked with bcrypt. When the user does not exist, a dummy hash is compared so the response time doesn't reveal which roll numbers exist.
- Staff accounts are refused here (403, "use the admin portal").
- The account is blocked if the user's college is inactive.
- **Single active session:** if a live session exists and `confirmLogout` is false, the response is 403 `SESSION_ACTIVE` and the UI asks for confirmation. A confirmed login rotates the session id, which ends the other device's session.
- **Account lockout:** after 10 wrong passwords the account is locked for 15 minutes. The failure counter is incremented atomically. A successful login resets it.
- Sets the `userSessionToken` cookie; the JWT (HS256) lasts `SESSION_HOURS` (24 h).

**Admin login** (`POST /admin-login`):
- Same credential checks, but only staff roles are allowed (403 otherwise).
- Sets `adminSessionToken` and returns `{roll_no, first_name, role, t_id, organization}`.

**Current user:**
- `GET /get-currentUser` (student): roll_no, name, college, branch, role, gender, t_id.
- `GET /get-admin-current-user` (staff): roll_no, name, college, branch, role, t_id, organization.

**Logout** (`POST /logout {slug:"user"|"admin"}`): clears the matching session id server-side and removes the cookie. The legacy `GET /logout/:roll/:slug` also works, but the roll number in it is ignored.

**Password reset:** see 5.9. OTPs are stored as an HMAC-SHA256 hash and are never logged.

**On every request, the auth middleware:**
1. Verifies the JWT (HS256, signed with `JWT_SECRET`).
2. Loads the user or device record and checks that the session id matches.
3. Checks the account is active and the college is active (cached for 60 s).
4. Applies the role list for the route.

`resolveTenantScope`:
- Platform staff may target any college with `tenant_id` or `:tid`.
- Everyone else is forced to their own college; asking for another college returns 403.

### 6.2 Users (`UserController`)
- **Import** (`POST /add-user`, multipart `file` + `tenant_id`): see 5.2. Limits are 5,000 rows and a 5 MB file. The temp file is deleted after the request.
- **List** (`GET /get-users/:tenantId`): safe fields only (no password, session or OTP fields), sorted by roll number.
- **Students for scheduling** (`GET /get-students/:tenantId`): active, non-staff users, returning roll_no, first_name, branch and passout_year.
- **Get / update** (`GET /get-user-by-id/:id`, `PUT /update-user/:id`):
  - Editable fields: first_name, gender, college, branch, mobile (7–15 digits), passout_year (1990–2100), email (unique), role (assignable roles only), status (0/1) and password (8–128 characters).
  - Changing the role, deactivating the account or changing the password ends the user's sessions.
- **Deactivate** (`DELETE /delete-user/:id`): sets status 0 and ends sessions. History is kept, and you cannot deactivate yourself.
- **Profile photos:**
  - Upload: `POST /upload-profile-pics`, a zip of up to 5,000 entries, 300 MB unpacked, 5 MB per image. Each entry is inflated with a hard byte cap and must be PNG or JPEG by magic bytes.
  - Serve: `GET /backend/profile-pics/:roll.png`. Only the student, staff of the same college, platform staff, or the college's kiosk may load a photo. Otherwise `default.png` is served.
- **Student dashboard data** (always the logged-in student's own data):
  - assigned/upcoming interviews (including resumable ones)
  - past interviews with status: attended / expired / in progress / evaluating / scoring delayed / evaluation failed, plus a provisional flag
  - attempted counts per type
  - kiosk vs web counts
  - average accuracy per type and overall

### 6.3 Colleges (tenants) and credits (`TenantController`, `CreditController`, `services/credits.js`)
- **Create** (`POST /add-tenant`):
  - Fields: organization_name (required), email (required, valid, unique), organization_code (required, unique), contact_person, assigned_credits (initial credits, an integer ≥ 0; the legacy comma list is summed), interview_duration_minutes (5–300, default 30), status.
  - Runs in a transaction that also writes an "Initial credits" ledger row.
- **Update** (`PUT /update-tenant/:id`): profile fields only. **Credits can never be changed here.**
- **Delete:** refused (409) while the college still has users; deactivate it instead.
- **Read:** `GET /get-tenants` (platform staff); `GET /get-tenant/:id` (platform staff, or the college admin for their own college).
- **Credit ledger** (`credittransactions`):
  - Row types: `opening_balance`, `topup`, `adjust`, `consume`, `refund`.
  - Each row stores the signed amount, `balance_after`, reason, actor, interview id/type and roll number.
  - Unique indexes guarantee one consume and one refund per interview, and one opening balance per college.
  - Balance changes use atomic conditional `$inc`, inside MongoDB transactions on a replica set.
  - `POST /tenants/:id/credits {amount, type, reason}` is platform-only: a top-up must be greater than 0, the reason is required, the maximum is ±1,000,000, and the balance can't go below 0.
  - `GET /tenants/:id/credit-transactions?page&limit` returns a paginated history, newest first.

### 6.4 Content: syllabus and question banks
| Entity | Create | Key rules |
|---|---|---|
| Technology | `POST /add-technology {technology_name, technology_category}` | Icon upload on update (png/jpg/webp ≤ 2 MB, stored with a random name). Can't delete while it has modules. |
| Module | `POST /add-module` (multipart: module_name, technology, optional icon) | Can't delete while it has topics. |
| Topic | `POST /add-topic` (multipart Excel, one topic per row in column A, plus technology and module) | The module must belong to the technology; up to 2,000 topics per file. |
| Company | `POST /add-company {company_name}` | 2–50 characters, unique (case-insensitive). |
| Tag | `POST /add-tag {tag_name}` | 2–50 characters, unique. |
| Company question | `POST /add-company-question` (multipart Excel, one question per row in column A, plus company, type, round, year, tag) | The company and tag must exist; up to 5,000 per file; question ≤ 2,000 characters. |
| Coding question | `POST /add-coding-question {problem_name, complexity, time, description(HTML), input, output, constraints, company?}` | Complexity is easy/medium/hard; time 1–180 minutes; the description is required (≤ 2 MB, may contain images). |
| Practice question | `POST /add-interview-questions` (multipart Excel with columns `question`, `answer`, `star_status`, plus technology and companies[]) | Up to 5,000 rows; `star_status` 1 = previously asked (falls back to the form value). |

All content can be read by any staff member (needed for scheduling) and changed only by platform admins. `available-company-questions` counts the bank questions matching companies + types + rounds (+ tag). `coding-questions-count` returns `{easy, medium, hard}`.

### 6.5 Scheduling (`services/scheduling.js`, the interview controllers)
- **Single:**
  - Technology: `POST /add-interviewee-details`
  - Company: `POST /add-company-interview`
  - Coding: `POST /add-coding-interview`
- **Bulk** (multipart, `roll_no` column):
  - `add-bulk-interviewee-details`
  - `bulk-add-company-interviews`
  - `add-bulk-coding-interview`
- **Fields:** platform (`web` | `mpod`), start_date_time (ISO), questions_count, `tenant_id` (platform staff), plus the type-specific fields:
  - Technology: `technology`, `module[]`, `topic[]`, `level`
  - Company: `company[]`, `type[]`, `round[]`, `tag?`
  - Coding: `level`
- **Rules:** validation, overlap check, transaction (create interview + consume credit), email to the student; `created_by` is the logged-in staff member. See 5.3.
- **Edit** (`PUT edit-interviewee-details/:id`, `update-company-interview/:id`, `update-coding-interview/:id`):
  - Allowed only while the interview has not started.
  - The new start time and new student are re-validated, and overlap is re-checked.
- **Delete** (`DELETE delete-interviewee-details/:id`, `delete-company-interviewee-details/:id`, `delete-coding-interview/:id`):
  - Refunds the credit only if the interview never started; the delete is conditional, so it can't race with a start.
  - The response includes `refunded: true|false`.
- **Lists:**
  - Technology and company: per IST calendar day (`?date=YYYY-MM-DD`, default yesterday on the API; the admin UI requests today).
  - Coding: all interviews.
  - Rows include student name, details and `interview_status`: Upcoming, In progress, Evaluating, Waiting for AI, Evaluation failed, Attempted, Expired. Rows also carry a `provisional` flag and `evaluation_error`.

### 6.6 Interview session engine (`services/interviewSession.js`, `SessionController`, `KioskController`)
- **Start** (website: `POST /interview-session/start {interview_id, interview_type}`; kiosk: `POST /kiosk/start`):
  - Checks ownership and channel: website interviews must be `web`; kiosk interviews must be `mpod` and belong to the kiosk's college.
  - Checks the window: from 1 minute before to 5 minutes after the start time. If question preparation failed earlier, a 15-minute retry window applies.
  - Claims the attempt atomically, so two devices can't start the same interview.
  - Issues the questions once:
    - Technology: AI-generated from technology + modules + topics + level. If the AI fails, the fallback is first the practice bank for that technology, then 5 templates over the selected topics.
    - Company: random sample from the matching bank.
    - Coding: random sample by complexity.
  - Sets the deadline: the college's duration, or the time the questions need (90 s per voice question + 5 min, or the sum of the coding problems' minutes + 5), whichever is longer.
  - Returns `{attempt_token, deadline_at, server_time, interview, questions, answers}`. Questions never include source ids or model answers.
  - Calling start again resumes the attempt with a new token and the saved answers; the old token stops working.
- **Answer** (`POST /interview-session/answer`, attempt token):
  - Saves one answer per question id; verbal answers ≤ 10,000 characters, code ≤ 30,000.
  - Coding answers also store `idea` and `optimized_answer`; `time` is in seconds.
  - `final: true` marks the student as having moved on. A later, non-final autosave can never overwrite a final answer.
  - Accepted only while the attempt is open and within the deadline (+30 s).
- **Idea check** (`POST /interview-session/analyze-idea`, coding only):
  - Reserves an attempt atomically (max 5 per problem), then asks the AI, which returns accuracy and attempts left.
  - If the AI is down, it returns `{unavailable: true}` and gives the attempt back.
  - The best and last scores are stored server-side; client-reported values are ignored.
- **Submit** (`POST /interview-session/submit`):
  - Idempotent. Sanitises the optional emotion summary, sets `evaluation_status: pending` and queues the evaluation. Returns 202.
- **Status** (`GET /interview-session/status`): `{status, evaluation_status, report_ready, waiting_for_ai}`.
- **Kiosk lookup** (`POST /kiosk/interview {roll_no}`): the startable or resumable `mpod` interview for that student at this kiosk's college, including interview summary details.

### 6.7 AI evaluation (`services/evaluation.js`, gateway `services/ai/`)
- **AI gateway.** Every model call goes through `services/ai`, which:
  - picks the provider (`AI_PROVIDER` = `openai` or `ollama`);
  - fails over to `AI_FALLBACK_PROVIDER` on outages, skipping a failed provider for 60 s;
  - limits concurrent requests per provider, serving interactive calls first;
  - tolerates reasoning text around the JSON and retries invalid JSON once;
  - records provider, model, tokens and time per evaluation (`evaluation_ai`).
- **Tasks and default models** (OpenAI / DGX Spark):
  - **scoring:** `gpt-4o` / `gpt-oss:120b` (verbal answer scoring)
  - **generation:** `gpt-3.5-turbo` / `gpt-oss:20b` (question generation, OpenAI health check)
  - **summary:** `gpt-3.5-turbo` / `gpt-oss:20b` (overall analysis)
  - **coding:** `gpt-4-turbo` / `qwen3-coder:30b` (idea check, code review, optimisation comparison)

  Models are configurable with `OPENAI_*_MODEL` and `DGX_*_MODEL`. All calls request JSON output.
- **The DGX provider** reaches the DGX Spark at `DGX_BASE_URL` with `DGX_API_KEY` through the API-key gateway. It speaks Ollama's native API (`num_ctx`, `num_predict`, `keep_alive` and `think` per request) or an OpenAI-compatible API (vLLM, TensorRT-LLM; `reasoning_effort` for gpt-oss, thinking off for Qwen3). Each task can have its own endpoint, key and protocol. Plain HTTP to public addresses is refused in production. The full model list and API contract are in `docs/DGX_MODEL_CONTRACT.md`.
- **Question generation:** "exactly N questions, single, ≤ 25 words, no code (except the Placements technology)" over shuffled module/topic lists. Timeout 25 s, 1 retry, 2 tries.
- **Verbal scoring rubric:**

  | Answer | Score |
  |---|---|
  | Incorrect or irrelevant | 0 |
  | Partly correct with errors | 10–20 |
  | Partially correct | 40–70 |
  | Mostly correct | 70–90 |
  | Fully correct | 90–100 |

  Speech-to-text errors are ignored. Confidence is low at 0, medium up to 50, high above 50.
- **Overall summary:** strengths[], areas_of_improvement[], and percentages for communication_skills, understandability, analytical_skills, time_management, domain_skills, logical_thinking and attention_to_detail.
- **Coding review:** is_code; accuracy; efficiency {time_complexity, space_complexity}; code_quality {readability, variable_naming}; logical_approach; output_format; observations[]; analysis. An optimisation comparison adds optimized_percentage, complexities and a comment.
- **Safety:** candidate text is wrapped in `<candidate_*>` tags with an instruction to treat it as data; scores are clamped to 0–100; calls time out at 60 s with 2 retries.

### 6.8 Resilience when the AI is unavailable (`aiStatus`, `provisionalScoring`, `evaluationQueue`)
- **Detecting outages:**
  - `aiStatus` classifies failures as: no_key, auth (e.g. a restricted key missing `model.request`), quota, rate_limit, network or provider.
  - `GET /system-status` returns `{ai:{available, reason, message, checked_at, last_success_at}}`. Platform admins can force a re-check with `?refresh=1`.
- **Question preparation:** falls back to bank and template questions (6.6).
- **Idea check:** skipped rather than blocking.
- **Provisional scoring (technology/company):** deterministic, using:
  - cosine similarity to the bank's model answer, when one exists;
  - coverage of the question's key terms (stop words and task words removed, light stemming);
  - completeness (a word-count score that is full at about 60 words) and a bonus when an example is given.

  Short answers are capped: under 5 words → 10 at most; under 12 words → 35 at most. Each answer gets an accuracy, an "analysis" explaining the score and improvement tips. The overall summary and skill parameters are derived from the same signals. Results are stored with `evaluation_mode: "provisional"` and `ai_rescore_pending: true`.
- **AI re-score:**
  - The sweeper re-scores provisional interviews with the AI when it is available (own lease, retries every 30 min). Staff can trigger "Re-score with AI" at any time.
  - The AI result then replaces the provisional one (`evaluation_mode: "ai"`).
- **Coding during an outage:** waits with backoff (2, 5, 10, 20, then 30 min) for up to 72 h before being marked failed. Outage retries don't use up the 3 attempts reserved for real data errors.

### 6.9 Reports
- **Technology/company report** (`GET /get-question-details/:id/:type/:roll_no`):
  - Content: user details (from the same college), question_details[] (question, answer, accuracy, analysis, improvements, confidence_level, time), overall_analysis, emotions, start time, level, count, technology/modules/topics or companies/types/rounds, and `evaluation_mode`.
- **Coding report** (`GET /get-coding-report-details/:id/:type/:roll_no`): coding question_details[], emotions, and the start time in IST.
- **Access:** the owning student; staff of the same college; platform staff; or the kiosk holding that attempt's token, within 2 h of submit.

### 6.10 Dashboards (`DashboardController`)
- **College** (`:tid`, forced to the caller's own college):
  - users by gender
  - attempted and assigned counts per type
  - kiosk vs web split
  - coding question counts by difficulty; company question count
  - yesterday's assigned and attempted counts (IST day)
  - yesterday per technology (assigned / attempted)
- **Platform** (platform staff only):
  - overall assigned/attempted per type, overall and by college
  - all colleges' assigned counts yesterday
  - overall attempted yesterday
  - today's ("current") stats
  - day-wise assigned vs attempted for the last 10 days (IST)

### 6.11 Practice bank (student self-study; backend only, no student UI yet)
- **Endpoints:**
  - Technologies with question counts.
  - Questions by technology, with the student's favourite/doubt flags.
  - Add/remove favourite and doubt; list favourites, doubts and starred (previously asked) questions.
  - Practice scoring (`POST /get-lite-interview-accuracy`): up to 10 questions per call, each answer ≤ 3,000 characters.
- **Limits:** practice scoring is capped at **20 per student per day**. All ids are cast to ObjectIds, so query operators can't be injected.

### 6.12 Kiosk devices (`KioskController`)
- **Register** (`POST /kiosk/register {roll_no, password, device_name, tenant_id?}`):
  - Requires college-admin or platform-admin credentials; platform admins pass `tenant_id`.
  - Creates the device and sets a 365-day `kioskDeviceToken` cookie.
- **Device calls:** `GET /kiosk/me` (device info) and `POST /kiosk/unregister` (revokes the device itself).
- **Management:** `GET /kiosk/devices` (own college; platform admins can view all or one college) and `PUT /kiosk/devices/:id/revoke`. Revocation is checked on every kiosk request.

### 6.13 Uploads, security and platform services
| Concern | Implementation |
|---|---|
| Upload limits | Uploads go to an OS temp dir and are deleted after the response (finish or abort). Spreadsheets (.xlsx/.xls/.csv) ≤ 5 MB, parsed with a row cap; zip ≤ 50 MB; images (png/jpg/webp) ≤ 2 MB. |
| Rate limits (in-memory) | Login: 20 per 15 min per IP+roll and 100 per 15 min per IP. OTP send: 5 per 15 min. OTP verify: 20 per 15 min. Kiosk register: 10 per 15 min. AI endpoints: 20 per min per user/device/token. Whole API: 3,000 per min per IP. |
| HTTP hardening | helmet headers, CORS allow-list (`CORS_ORIGINS`), JSON body ≤ 3 MB, `trust proxy` configurable, central error handler (no stack traces in production). |
| Static files | Technology/module icons and face-api models are public; profile photos are access-controlled. |
| Email | Gmail SMTP via Nodemailer: schedule notifications (non-blocking) and OTPs. |
| Health | `GET /backend/api/health` (DB status) and `GET /backend/api/server-time`. |
| Data migration | `scripts/migrate.js`: dry run by default, `--apply` to write. It adds ledger opening balances, stamps tenant/user on legacy interviews, removes legacy session tokens and OTPs, builds indexes, and reports weak passwords and duplicate roll numbers. |

---

## 7. Student website and kiosk (frontend)

Routes (all pages lazy-loaded):

| Route | Screen |
|---|---|
| `/`, `/login` | Login |
| `/forgot-password` | Password reset |
| `/dashboard` | Student dashboard (also hosts the interview flow) |
| `/report` | Technology/company report |
| `/coding-report` | Coding report |
| `/home-2` | Kiosk screen |
| `/kiosk-setup` | Kiosk registration |
| `*` | 404 page |

### 7.1 Login (`/login`)
- **Fields:** "Roll Number / Interviewee Id" (text, `autocomplete=username`, required) and "Password" (password, required).
- **Buttons and links:** "Sign in" (disabled while busy or empty) and the "Forgot Password?" link.
- **Behaviour:**
  - `POST /login`. On `SESSION_ACTIVE`, a confirm dialog asks whether to log out the other session and continue (it retries with `confirmLogout: true`).
  - Errors are shown inline (invalid credentials, locked, inactive college, staff account).
  - Success → `/dashboard`.

### 7.2 Forgot password (`/forgot-password`)
1. "Roll Number" field → **Send OTP** (generic success message).
2. "OTP" field appears → **Check OTP** (`check-otp`).
3. "New Password" and "Re-enter New Password" fields appear → **Reset Password** (`reset-password`). The client checks that the fields are filled, that they match and that the password is at least 8 characters. Messages come from the server (invalid or expired OTP, too many attempts). Success → `/login`.

### 7.3 Dashboard (`/dashboard`)
- **Profile card:** name, roll number, college, branch, and profile photo (fallback to a boy/girl avatar).
- **Overall accuracy:** a percentage, plus three circular progress bars (Technology, Company, Coding).
- **Attempted interviews:** total plus counts for Technology, Coding and Company.
- **Platform interviews:** total plus counts for mPOD (kiosk) and Sky (web).
- **Upcoming interviews table:** Type, Platform, Date & Time, Action:
  - "Starts in: hh:mm:ss" countdown
  - **Attempt** button with a 5-minute countdown
  - **Resume** button for an attempt in progress
  - "Take this at the mPod kiosk" for kiosk interviews
- **My Interviews table:** Type, Platform, Date & Time, Status, Action, paginated 5 per page.
  - Statuses: expired, attended, in progress, evaluating, scoring delayed, evaluation failed.
  - Action: **View** (opens the report), with a "provisional" tag when the score isn't from the AI yet.
- Data refreshes while the dashboard is idle; polling is paused during an interview.

### 7.4 Interview flow (shared by website and kiosk)
- **Instructions screen:**
  - Content: roll number, name, interview type, technology + modules/topics, or level (coding), or companies + types/rounds.
  - Rules: voice and typing guidance, autosave/resume, no phone. Shows the profile photo.
  - A 15-second countdown (3 s when resuming) and a **Start now** button, disabled until the questions are ready, plus **Back**.
  - The attempt is claimed and questions are prepared as soon as this screen opens. A "Preparing…" message auto-retries; errors offer **Try again**.
- **Voice interview (technology/company):**
  - Header "QUESTION n / N" with a 60-second timer; the question text is shown and read aloud (Indian English voice preferred).
  - A 5-second "Start answering in…" countdown follows.
  - **Answering:** live transcript (Chrome speech recognition) or a **Type instead** text area (max 10,000 characters). Buttons: **Next question** / **Submit interview**.
  - Warnings when the interview time left is under 2 minutes, and when a save fails (with automatic retry).
  - A terminal "Interview paused" message appears if the session moves to another tab or device.
- **Coding interview:**
  - "PROBLEM n / N" with a per-problem timer.
  - Left panel: problem name; sanitised description (HTML); Input, Output and Constraints.
  - Right panel, step 1: **Explain your approach** (text area) → **Check idea**. Feedback shows the % and the checks left, or that the check is skipped when the AI is down.
  - Step 2: **Write your code** (monospace text area, copy/paste blocked) → **Done, optimise**.
  - Step 3: **Optimise your code**. **Next problem** / **Submit interview** is available at every step.
  - The camera runs hidden with on-screen attention warnings. If camera access is denied, a "Camera access is required" screen pauses the problem timers.
- **After submit:** "Submitting…" → "Evaluating your answers…" (polling) → the report. If scoring is delayed: "Interview submitted. All your answers are saved…" with **Go to dashboard** (website) or **Done – next student** (kiosk).

### 7.5 Reports (`/report`, `/coding-report`)
- **Technology/company:**
  - Header: name, roll number, college; technology/modules/topics; scheduled time.
  - Confidence % and Accuracy % rings.
  - An accordion per question: answer, analysis, improvements, accuracy ring, confidence badge, time taken.
  - Strengths and areas of improvement; **Download PDF**.
  - A "Provisional score" banner when the result isn't from the AI yet.
- **Coding:** per problem: idea and idea score, submitted code, optimised code, correctness, time/space complexity, code quality, optimisation %, observations. Attention stats: looking left/centre/right, blinks, emotion percentages.
- **On a kiosk:** a floating **Done – next student** button clears the attempt token.

### 7.6 Kiosk (`/kiosk-setup`, `/home-2`)
- **Kiosk setup form:**
  - Fields: "Kiosk name" (≤ 100 characters), "Admin user id", "Password", and "College id (platform admins only, optional)".
  - **Register kiosk** → confirmation with a link to the kiosk screen. Shows the current registration with an **Unregister** button.
- **Kiosk screen:**
  - Checks the device (`/kiosk/me`). If the kiosk isn't registered, it shows a message and a link to set it up.
  - Otherwise it shows "ENTER YOUR ROLL NUMBER", the college · kiosk name, a roll number field and **Continue**.
  - Then the same interview flow as above.

### 7.7 Client behaviour
- axios with credentials; a 401 redirects to `/login`, except on the kiosk, report, login and reset pages.
- The attempt token is kept in `sessionStorage` on kiosks only.
- Everything else stays in httpOnly cookies; nothing sensitive is kept in localStorage.

---

---

## 8. Admin portal

The admin portal (`Admin/`, served at `/admin`) is used by platform staff and college staff. This section lists every screen, its route and roles, every form field with its options and validation messages, list columns, row actions, and the API each action calls.

**Stack:** Vite with `base: "/admin/"`. React Router `BrowserRouter` with basename `/admin`. Redux is used only for the layout and the breadcrumb. Other libraries: reactstrap, react-select, react-toastify (`ToastContainer` top-right, `autoClose` 4000 ms, newest on top), mdbreact `MDBDataTable`, react-bootstrap-table-next, xlsx with file-saver, react-switch, react-draft-wysiwyg, flatpickr, recharts and react-apexcharts.

**API base:** `API_BASE = VITE_API_URL || "/backend/api/"`. Images come from `IMAGE_BASE = VITE_BACKEND_URL || "/backend/"`. The student app link is `STUDENT_APP_URL = VITE_STUDENT_APP_URL || window.location.origin + "/"`. Below, every API path is relative to `API_BASE`.

**Generic error text:** `getErrorMessage(err, fallback)` picks the first match from:
1. the response body if it is a string under 300 characters
2. `data.message`
3. `data.error`
4. "Network error: …" when there is no response
5. the fallback text

---

### 8.0 Cross-cutting behaviour

#### Roles (`config/roles.js`)
- **PLATFORM** = `superadmin`, `admin`
- **TENANT** = `tenantadmin`, `placementadmin`, `trainer`
- **ALL_STAFF** = PLATFORM + TENANT

| Feature key | Roles allowed |
|---|---|
| dashboard, interviews | ALL_STAFF |
| users, kiosk, tenantCredits | PLATFORM + tenantadmin |
| tenants, technologies, modules, topics, interviewQuestions, companyQuestions, codingQuestions, companies, tags | PLATFORM only |

`canManageUserRole(viewer, target)` decides who can edit or deactivate a user:
- A tenant viewer can manage only non-staff accounts (students).
- A platform viewer managing an `admin` or `superadmin` account must be `superadmin`.
- A platform viewer can manage everyone else.

#### Routes (`routes/allRoutes.js`)
- **Public, wrapped in NonAuthLayout:** `/login`, `/logout`, `/forgot-password`.
- **`/`** redirects to `/dashboard`.
- **`*`** shows NotFound: "404", "Sorry, page not found", button "Back to Dashboard". Page title "Page not found | Mpod".
- **Authenticated routes:** all share one `Authmiddleware` + `VerticalLayout`, and each route is also wrapped in `Authmiddleware roles={…}`.

| Path | Component | Roles |
|---|---|---|
| /dashboard | Dashboard | ALL_STAFF |
| /users-list, /add-user, /edit-user/:userId, /users-profile-pics-list | Users pages | PLATFORM + tenantadmin |
| /tenants-list, /add-tenant, /edit-tenant/:id | Tenants pages | PLATFORM |
| /tenant-credits/:id | TenantCredits | PLATFORM + tenantadmin |
| /kiosk-devices | KioskDevices | PLATFORM + tenantadmin |
| /technologies-list, /add-technology, /edit-technology/:technologyId | Technologies | PLATFORM |
| /modules-list, /add-module, /edit-module/:moduleId | Modules | PLATFORM |
| /topics-list, /add-topic, /edit-topic/:topicId | Topics | PLATFORM |
| /interview-questions-list, /add-interview-question, /edit-interview-question/:questionId | Interview Qs | PLATFORM |
| /companies-questions-list, /add-company-question, /edit-company-question/:questionId | Company Qs | PLATFORM |
| /coding-questions-list, /add-coding-question, /edit-coding-question/:questionId | Coding Qs | PLATFORM |
| /tags-list, /add-tag, /edit-tag/:tagId | Tags | PLATFORM |
| /companies-list, /add-company, /edit-company/:companyId | Companies | PLATFORM |
| /ai-interviews-list, /add-ai-interview, /edit-ai-interview/:id | Technology (AI) interviews | ALL_STAFF |
| /company-interviews-list, /add-company-interview, /edit-company-interview/:id | Company interviews | ALL_STAFF |
| /coding-interviews-list, /add-coding-interview, /edit-coding-interview/:id | Coding interviews | ALL_STAFF |

#### Route guard (`Authmiddleware`)
- While the session check is loading, it shows `PageLoader` (a centred spinner).
- With no user, it redirects to `/login` with `state.from = pathname + search`.
- When the user's role is not in `roles`, it renders **NotAuthorised** inside the layout:
  - Card heading "Not authorised"
  - Text "Your account does not have access to this page."
  - Button "Back to Dashboard"
  - Page title "Not authorised | Mpod"

#### Session (`context/AuthContext.js`)
- On mount it calls `GET get-admin-current-user` (with credentials).
- The user is set only if the response has `role`. The user shape is `{roll_no, first_name, college, branch, role, t_id, organization}`.
- Any error, including 401, means logged out (`user = null`).
- `logout()` calls `POST logout {slug:"admin"}`, ignores errors and sets the user to null.
- The session lives in the httpOnly cookie `adminSessionToken`.

#### Axios interceptor (`api/setupAxios.js`)
This runs before render. It sets `axios.defaults.withCredentials = true` and handles errors as follows.

**401:**
- The redirect is skipped when the URL ends with one of: `get-admin-current-user`, `admin-login`, `logout`, `send-otp`, `check-otp`, `reset-password`.
- It is also skipped when the current page is public (`/login`, `/logout`, `/forgot-password`).
- Otherwise it does a full `window.location.assign("/admin/login?next=" + encodeURIComponent(currentPathWithoutAdminPrefix + search))`.

**403** (any URL except `admin-login`):
- If the response body has no string `message`, it shows the toast "You do not have permission" (toastId `forbidden`).
- Otherwise the page shows its own message.

The error is always re-rejected.

#### Layout (`VerticalLayout`)
**Header:**
- Maya logo, which links to `/dashboard`.
- Hamburger button (aria-label "Toggle menu"), which toggles the body classes `vertical-collpsed` and `sidebar-enable`.
- Profile dropdown:
  - Avatar from `IMAGE_BASE/profile-pics/<roll_no>.png`, falling back to `default.png`.
  - Header shows `first_name`, then `role · organization`.
  - Item "Logout" (red, power icon) links to `/logout`.

**Order on each page:** Breadcrumb (page title plus a crumb trail from Redux), then **AiStatusBanner**, then the page content. The footer reads "© {year} Mpod".

#### AI status banner (`components/Common/AiStatusBanner.js`)
- Runs only when a user is logged in.
- Calls `GET system-status` on mount and every 5 minutes. "Check again" calls `GET system-status?refresh=1`.
- Shown when `ai.available` is false (warning). Also shown to platform roles as an info Alert when `ai.degraded` is true (the primary provider is down and the fallback is serving). Errors are ignored.
- It is a warning Alert with this text: **"AI service unavailable."** `{ai.message}` "Interviews still run: technology questions come from the question bank and syllabus, the coding idea check is skipped, and scores are completed automatically once the AI is back."
- Platform roles also see "Fix: {ai.hint}": a provider-specific fix from the server (for example the OpenAI key permission, `ollama pull <model>`, or checking the DGX Spark gateway). They also get a link button **"Check again"** (shows "Checking..." while running).

#### Sidebar menu (`config/menu.js`)
- Groups are filtered by role. Each group is a collapsible MetisMenu entry with an icon from `/admin/dashboard-icons/<icon>`.
- The active item is highlighted by matching the path.
- There are no "Add" menu items for Content groups (except Users and Tenants). Add pages are reached by buttons on the list pages.

| Section | Group (icon) | Items | Roles |
|---|---|---|---|
| (none) | Dashboard (dashboard.svg) | Dashboard → /dashboard | ALL_STAFF |
| **Users** | Tenants (users.svg) | "Tenants List" → /tenants-list; "Add Tenant" → /add-tenant | PLATFORM |
| | Users (users.svg) | "Users List" → /users-list; "Add Users" → /add-user; "Update Profile pics" → /users-profile-pics-list | PLATFORM + tenantadmin |
| | Kiosk Devices (platform.svg) | "Kiosk Devices" → /kiosk-devices | PLATFORM + tenantadmin |
| | Credits (tests.svg) | "Credit History" → `/tenant-credits/${user.t_id}` | **tenantadmin only** (platform users reach credits from the Tenants list) |
| **Content** | Technologies (technologies.svg) | "Technologies List" | PLATFORM |
| | Modules (modules.svg) | "Modules List" | PLATFORM |
| | Topics (Topics.svg) | "Topics List" | PLATFORM |
| | Questions (coding questions.svg) | "Interview Questions" → /interview-questions-list; "Company Questions" → /companies-questions-list; "Coding Questions" → /coding-questions-list | PLATFORM |
| | Companies (company.svg) | "Companies List" | PLATFORM |
| | Tags (tags.svg) | "Tags List" | PLATFORM |
| **Interview** | Interviews (interview.png) | "Interviews List" → /ai-interviews-list; "Company Interviews List" → /company-interviews-list; "Coding Interviews List" → /coding-interviews-list | ALL_STAFF |

`placementadmin` and `trainer` therefore see only Dashboard and Interviews.

#### Shared components
**ConfirmModal**
- Defaults: title "Confirm", message "Are you sure?", confirm button "Delete" (danger), plus a "Cancel" button.
- While busy, the confirm button shows a spinner and the modal cannot be dismissed.

**LoadState**
- Loading: spinner + "Loading...".
- Error: danger Alert showing the error text, with a "Retry" outline button when a retry handler is given.
- Empty: centred muted text, default "No records found.".

**RetryEvaluationButton**
- Warning-coloured small button. Label "Retry evaluation" by default, or a custom label; shows "Queuing..." while running.
- Calls `POST interview-session/retry-evaluation {interview_id, interview_type}`.
- Success toast: "Evaluation queued. Refresh the list in a minute to see the result."
- Error toast: getErrorMessage with fallback "Could not retry the evaluation."

---

### 8.1 Authentication (public)

All three pages use the `AuthCard` frame: dark Maya logo linking to `/login`, a title and subtitle, and "© {year} Mpod" underneath.

#### `/login`: Login
**Page title:** "Login | Mpod". **Card:** "Welcome Back!" / "Sign in to continue to Mpod."

**Already signed in:** if a session already exists (and the form is not submitting), the page immediately redirects to the target.

**Fields (Formik + Yup):**
1. **User Id**: text, `roll_no`, placeholder "Enter user id", autocomplete username. Required (trimmed): "Please enter your user id".
2. **Password**: password, placeholder "Enter password". Required: "Please enter your password".

**Submit:** button "Log In" (spinner while submitting). Below it is the link "Forgot your password?" (lock icon), which goes to `/forgot-password`.

**On submit:**
1. Calls `POST admin-login {roll_no (trimmed), password}` with credentials.
2. Then calls `refresh()`, which is `GET get-admin-current-user`.
3. If refresh returns no user, it shows the error "Logged in, but the session could not be loaded. Please check that cookies are enabled."
4. Otherwise it navigates (replace) to the redirect target:
   - the `?next=` value first, then `location.state.from`, then `/dashboard`;
   - only safe relative paths are accepted (must start with `/`, must not start with `//` or `/\`, must not be `/login`).

**Errors (danger Alert above the fields):**

| Status | Message shown |
|---|---|
| 400 / 401 | server message, or "Invalid user id or password." |
| 403 | server message, or "This account is not a staff account." |
| 429 | server message, or "Too many login attempts. Please wait a few minutes and try again." |
| no response | "Cannot reach the server. Please check your connection." |
| anything else | server message, or "Login failed. Please try again." |

#### `/forgot-password`: three-step OTP reset
**Page title:** "Forgot Password | Mpod". **Card title:** "Reset Password". **Footer:** "Remember it? Sign in here" (links to /login).

The subtitle changes per step:
- request: "Enter your user id and we will send you an OTP."
- verify: "Enter the OTP you received."
- reset: "Choose a new password."

A green Alert shows info messages and a red Alert shows errors.

**Step 1 (request)**
- Field **User Id** (text, placeholder "Enter user id"). If empty: "Please enter your user id".
- Button **"Send OTP"** calls `POST send-otp {roll_no}`.
- Info text: server message, or "If the account exists, an OTP has been sent." Then moves to verify.
- Error fallback: "Could not send OTP. Please try again."

**Step 2 (verify)**
- Field **OTP** (numeric input mode, placeholder "Enter OTP"). If empty: "Please enter the OTP".
- Link buttons:
  - **"Resend OTP"** calls `send-otp` again; info "OTP sent again."; error fallback "Could not resend OTP."
  - **"Change user id"** resets back to step 1.
- Button **"Verify"** calls `POST check-otp {roll_no, otp}`.
- Info: server message, or "OTP verified. Choose a new password."
- Error fallback: "Invalid or expired OTP."

**Step 3 (reset)**
- **New password** (password). At least 8 characters: "Password must be at least 8 characters."
- **Confirm new password** (password). Must match: "Passwords do not match."
- Button **"Reset Password"** calls `POST reset-password {roll_no, otp, new_password}`.
- Info: server message, or "Password changed. You can now log in."
- Error fallback: "Could not reset password."

**Step 4 (done)**
- Button "Go to Login".

**Errors on every step:**
- 429: server message, or "Too many attempts. Please wait a few minutes and try again."
- No response: "Cannot reach the server. Please check your connection."

#### `/logout`
- Shows PageLoader, calls `POST logout {slug:"admin"}` (errors ignored), clears the user, then navigates (replace) to `/login`.
- Reached from the profile dropdown item "Logout".

---

### 8.2 Dashboard: `/dashboard` (ALL_STAFF; sidebar "Dashboard"; also the logo link)

**Page title:** "Dashboard | Mpod". **Breadcrumb:** Mpod › Dashboard.

**Header:** "Welcome! {user.organization}". For `tenantadmin` (when `t_id` is set) it also shows two buttons:
- **"Credit history"** → `/tenant-credits/{t_id}`
- **"Kiosk devices"** → `/kiosk-devices`

#### Platform roles (superadmin/admin): `TotalSuperAdminStats`
**Endpoints**, all fetched in parallel with `Promise.allSettled`:
- `GET get-overall-stats`
- `GET get-all-tenants-yesterday-assigned-stats`
- `GET get-overall-yesterday-attempted-interview-stats`
- `GET get-current-stats`
- `GET get-day-wise-stats`

If any of them fails, a danger Alert shows the first error (fallback "Some statistics failed to load.") with a **Retry** button.

**Contents:**
1. **Four overall cards**, each showing "Assigned" and "Attempted":
   - **Overall**: the sum of the three below
   - **Technology**: `overall.overallTechStats`
   - **Coding**: `overallCodingStats`
   - **Company**: `overallCompanyStats`
2. **"Tenant-wise overall statistics"** table.
   - Columns: Tenant | Technology (Assigned, Attempted) | Coding (Assigned, Attempted) | Company (Assigned, Attempted).
   - Rows come from `tenantwise.tenantWiseTechstats`, joined by `tenant_id` with `tenantWiseCodingstats` and `tenantWiseCompanystats` (fields `totalAssigned` / `totalAttempted`).
3. **"Yesterday's Statistics"** table, with the same column layout.
   - Assigned values come from `yesterdayAssigned.data[]` (`technologyInterviews`, `codingInterviews`, `companyInterviews`).
   - Attempted values are joined from `yesterdayAttempted.data[]` by `tenant_id`.
   - Loading: "Loading stats...". Empty: "No data available.".
4. **"Current Interview Stats"** table.
   - Columns: Tenant | Technology / Coding / Company, each with Assigned, Attempted, Upcoming.
   - Source: the `get-current-stats` array (`{tenant_name, technologyInterviews:{assigned,attempted,upcoming}, …}`).
5. **ApexCharts line chart "Daily Interview Attempts"**.
   - Series: Technology, Coding, Company. X axis is the sorted `_id` dates; the value is `attempted_count`.
   - Source: `get-day-wise-stats` `{technology[], coding[], company[]}`.

#### Tenant roles (tenantadmin/placementadmin/trainer): `TotalStats tenant={user.t_id}`
**Endpoints:** 10 in parallel with `allSettled`. Missing values show "-", or a spinner while loading. Failures show an Alert with **Retry**.

**Cards (each has a headline total and sub-counts):**
1. **Users**: total = male + female. Sub-counts "Male", "Female". Source `GET get-users-stats/{tid}`.
2. **Attempted Interviews**: total of technologyInterviews + codingInterviews + companyInterviews. Sub-counts "Technology", "Coding", "Company". Source `GET get-interview-stats/{tid}`.
3. **Assigned Interviews**: same layout. Source `GET get-assigned-interview-stats/{tid}`.
4. **Platform**: total = web + mpod. Sub-counts "mPod" (`mpod`) and **"Sky"** (`web`). Source `GET get-platform-stats/{tid}`.
5. **Coding Questions**: headline `total`, sub-counts Easy / Medium / Hard. Source `GET get-coding-questions-count` (global).
6. **Company Questions**: headline `totalCompanies`, sub-count "Count" = `totalQuestions`. Source `GET get-company-questions-count` (global).

**"Yesterday's Statistics" section:**
- **Assigned Interviews** card (`GET get-yesterday-assigned-interview-stats/{tid}`) and **Attempted Interviews** card (`GET get-yesterday-attempted-interview-stats/{tid}`), each split into Technology / Coding / Company.
- **"Yesterday's Technology Interviews Assigned vs Attempted"**: one card per technology showing "Assigned: n" and "Attempted: n".
  - Built by merging `technologyWiseCounts` from `GET get-yesterday-tech-stats/{tid}` and `GET get-yesterday-attempted-tech-stats/{tid}`.
  - Empty: "No technology interviews yesterday."
- **Recharts bar chart** (Assigned vs Attempted per technology) from the same data.

---

### 8.3 Users section

#### 8.3.1 Tenants (PLATFORM only)

##### `/tenants-list`: Tenants List (sidebar Tenants → "Tenants List")
**Page title:** "Tenants | Mpod". **Card title:** "Tenants List". **Button:** "+ Add Tenant" → /add-tenant.

- **Data:** `GET get-tenants`. Error fallback "Failed to fetch tenants."; empty text "No tenants yet.".
- **Table (MDBDataTable):** built-in search, paging and sorting.
- **Columns:** Organization Name | Code | Contact Person | Email | Credits (`active_credits`) | Status (Active / Inactive badge, `status===1`) | Actions.
- **Row actions:**
  - **Edit** → /edit-tenant/:id
  - **Credits** → /tenant-credits/:id
  - **Kiosks** → /kiosk-devices?tenant_id=:id
  - **Delete**, which opens a ConfirmModal:
    - Title "Delete tenant"; message `Delete tenant "{name}"? This cannot be undone.`; confirm "Delete".
    - Calls `DELETE delete-tenant/:id`.
    - Success toast: server message or "Tenant deleted"; the row is removed.
    - Error toast fallback: "Failed to delete tenant."

##### `/add-tenant`: Add Tenant (sidebar "Add Tenant" or the list button)
**Page title:** "Add Tenant | Mpod". **Card title:** "Add Tenant". Errors appear only after the first submit.

**Fields, in order:**
1. **Organization Name**: text, placeholder "Enter organization name". Required: "Please enter organization name".
2. **Organization Code**: text, placeholder "Enter organization code". Required: "Please enter organization code".
3. **Contact Person**: text, placeholder "Enter contact person name". Required: "Please enter contact person".
4. **Email**: email, placeholder "Enter email address". Must match `^[^\s@]+@[^\s@]+\.[^\s@]+$`: "Please enter a valid email".
5. **Initial credits**: number (min 0, step 1), default **"0"**, placeholder "e.g. 100". Must be digits only: "Initial credits must be a whole number (0 or more)".
   - Helper text: "Recorded as the opening balance. Later changes are made from the tenant's Credits page."
6. **Interview Duration (minutes)**: number (min 1), default **"30"**, placeholder "e.g. 30". Must be an integer above 0: "Please enter a duration in minutes".
7. **Status**: select, `1` = "Active" (default), `0` = "Inactive".

**Submit:** button **"Submit"** calls `POST add-tenant`.
- Body: `{organization_name, organization_code, contact_person, email, assigned_credits:int, interview_duration_minutes:int, status:number}`.
- Success toast: server message or "Tenant added successfully"; then navigate to /tenants-list.
- Error toast fallback: "Failed to add tenant. Please try again."

##### `/edit-tenant/:id`: Edit Tenant (Edit button on the list, or "Edit tenant" on the Credits page)
**Page title:** "Edit Tenant | Mpod".

- **Load:** `GET get-tenant/:id` through LoadState. Error fallback "Failed to load tenant." (with Retry).

**Left card "Edit Tenant", fields:**
1. **Organization Name** (required)
2. **Organization Code** (disabled, read-only)
3. **Contact Person** (required)
4. **Email** (valid email)
5. **Interview Duration (minutes)** (integer above 0; defaults to 30 when missing)
6. **Status** select: 1 = Active, 0 = Inactive

Validation messages are the same as on Add Tenant.

- **Submit:** **"Save"** calls `PUT update-tenant/:id {organization_name, contact_person, email, interview_duration_minutes, status}`.
- Success toast: server message or "Tenant updated successfully"; then navigate to /tenants-list.
- Error toast fallback: "Failed to update tenant. Please try again."

**Right card "Credits"** (read-only):
- "Current balance" showing `active_credits` (or "—").
- Text: "Credits are changed through top-ups and adjustments so every change is recorded in the tenant's credit history."
- Button "Manage credits & history" → /tenant-credits/:id.
- Credits are no longer edited on this form.

##### `/tenant-credits/:id`: Tenant Credits (PLATFORM + tenantadmin)
**How it is reached:**
- Platform users: the Credits button on Tenants List, or "Manage credits & history" on Edit Tenant.
- tenantadmin: sidebar Credits → "Credit History", or the Dashboard button "Credit history".

**Page title:** "Tenant Credits | Mpod". **Breadcrumb:** platform users see Mpod › Tenants › Credits; tenantadmin sees Mpod › Credits.

**Access check inside the page:** the viewer must be a platform user, or `user.t_id === :id`. Otherwise the page shows:
- "Not authorised"
- "You can only view your own organisation's credit history."
- Button "View my credits" → `/tenant-credits/{own t_id}`

**Balance card:**
- Title: tenant name (from `GET get-tenant/:id`), falling back to the user's organization or "Tenant".
- "Current credit balance" showing a large number (`active_credits`) or "—".
- A load error shows an Alert with Retry (fallback "Failed to load tenant.").
- Platform users also get the button "Edit tenant" → /edit-tenant/:id.

**"Add credits" card (platform only):**
1. **Type**: select.
   - `topup` = "Top-up (add credits)" (default)
   - `adjust` = "Adjustment (can be negative)"
2. **Amount**: number, step 1 (min 1 for a top-up).
   - Placeholder: "e.g. 100" (top-up) or "e.g. -5 or 10" (adjustment).
   - Must match `^-?\d+$`: "Enter a whole number".
   - Top-up must be greater than 0: "Top-up amount must be greater than 0".
   - Adjustment cannot be 0: "Adjustment cannot be 0".
3. **Reason**: textarea (2 rows), placeholder "e.g. Invoice #123, correction for duplicate interview". Required: "Please give a reason".

**Submit:** button label is **"Add credits"** (top-up) or **"Apply adjustment"** (adjustment).
- Calls `POST tenants/:id/credits {amount:int, type, reason}`.
- Success toast: server message or "Credits updated". The form resets, keeping the type. The balance updates from `data.tenant.active_credits` (or is re-fetched), and history reloads at page 1.
- Error (for example 400 when the balance would go below 0): an inline danger Alert with the server message (fallback "Could not update credits.").

**"Credit history" card:**
- Header counter: "{total} transactions".
- Data: `GET tenants/:id/credit-transactions?page=&limit=50`, returning `{items,total,page,limit}`.
- **Columns:**
  - **Date**: `createdAt`, in locale format
  - **Type**: badge
    - opening_balance = "Opening balance" (grey)
    - topup = "Top-up" (green)
    - adjust = "Adjustment" (yellow)
    - consume = "Consumed" (red)
    - refund = "Refund" (blue)
  - **Amount**: `+n` in green, negative in red
  - **Balance after**
  - **Reason / Interview**: reason, plus a small line `interview_type · interview_id`
  - **By**: `first_name (roll_no)` or "System"
- Pagination (shown when there is more than one page): "‹ Newer" / "Page X of Y" / "Older ›".
- Empty: "No credit transactions yet." Error fallback: "Failed to load credit history." (with Retry).

#### 8.3.2 Users (PLATFORM + tenantadmin)
Both list pages share the `useTenantUsers` hook:
- Platform roles load `GET get-tenants` (failure toast "Failed to load tenants.") and get a **Tenant** select, defaulting to their own `t_id`. If the current id is not in the list, a placeholder option reads `{tenantName || "Current tenant"}`.
- Tenant staff always use their own `t_id`.
- Users load from `GET get-users/{tenantId}`. Error fallback "Failed to load users."

##### `/users-list`: Users List (sidebar "Users List")
**Page title:** "Users List | Mpod". **Card title:** "{tenantName} - Users List". **Button:** "Add Users" → /add-user.

- **Table (MDBDataTable):** Profile Pic (from `IMAGE_BASE/profile-pics/{roll_no}.png`, falling back to default.png) | Name | Roll No | Gender | Email | Role | Status (Active/Inactive badge) | Action.
- **Action column:** if `canManageUserRole(viewer, row.role)` is false, it shows "—". Otherwise:
  - **Edit** → /edit-user/:_id
  - **Deactivate**, disabled when status is not 1. Opens a ConfirmModal:
    - Title "Deactivate user"; message "Deactivate {first_name} ({roll_no})? They will no longer be able to log in."; confirm "Deactivate".
    - Calls `DELETE delete-user/:id`.
    - Success toast: server message or "User deactivated."; the row status becomes 0.
    - Error toast fallback: "Failed to deactivate user."
- **Empty:** "No users found for this tenant."

##### `/add-user`: Add Users, by Excel upload (sidebar "Add Users" or the list button)
**Page title:** "Add User | Mpod". **Card title:** "Add Users (Excel upload)".

**Button "Download sample"** creates `users_sample.xlsx`, sheet "Users":
- Columns: **first_name, roll_no, mobile, email, gender, college, branch, passout_year, role, password**.
- Sample row: Ravi Kumar, 21A91A0501, 9876543210, ravi.kumar@example.com, male, Example College of Engineering, CSE, 2025, student, ChangeMe123.

**Fields:**
1. **Tenant** select (platform only), from get-tenants. A placeholder option shows the user's organization, "Current tenant" or "Select tenant".
2. **Users file**: file input accepting `.xlsx,.xls`.
   - Any other extension shows the toast "Please choose an Excel file (.xlsx or .xls)." and clears the input.
   - Help text: "Columns: first_name, roll_no, mobile, email, gender, college, branch, passout_year, role, password. role is optional (defaults to student). Staff roles (tenantadmin, placementadmin, trainer) can only be imported by platform admins. Passwords must be at least 8 characters."

**Submit:** **"Upload"** ("Uploading..." with a spinner while running). It is disabled until both a file and a tenant are set. A second button **"Back to users"** links to /users-list.
- Calls `POST add-user` as multipart with fields `file` and `tenant_id`.
- Success toast: server message or "Upload complete."; the file input clears.
- Error: inline Alert plus a toast (fallback "Failed to upload users.").

**"Upload result" card:**
- Alert: green when nothing was rejected, otherwise yellow.
- "Inserted: n".
- "Already existing roll numbers (n): …" or "None".
- "Rejected rows (n):", followed by a table with columns Row # | Roll no | Reason.
- Button "Go to users list".

##### `/edit-user/:userId`: Edit User (Edit on Users List or Profile Pics)
**Page title:** "Edit User | Mpod". **Card title:** "Edit User".

- **Load:** `GET get-user-by-id/:id`. Error fallback "Failed to load user." (with Retry).

**Fields, in a two-column grid:**
1. **Name** (required): "Name is required."
2. **Roll No** (disabled)
3. **Mobile** (tel). Checked only if changed: must match `^\+?\d{7,15}$` after removing spaces and hyphens, else "Enter a valid mobile number."
4. **Email** (email). Checked only if changed: "Enter a valid email."
5. **Gender** select.
   - "" = "Select gender", `male` = Male, `female` = Female, `other` = Other.
   - Any other existing value is added as an extra option.
6. **Passout Year** (number). Checked only if changed: must be 4 digits, else "Enter a 4-digit year."
7. **College** (text)
8. **Branch** (text)
9. **Role** select.
   - Platform viewer can assign: student, tenantadmin, placementadmin, trainer.
   - tenantadmin can assign: student only.
   - The user's current role, if not assignable, is shown as a disabled option.
   - Labels: Student / Tenant Admin / Placement Admin / Trainer / Admin / Super Admin.
10. **Status** select: 1 = Active, 0 = Inactive.
11. **New Password** (password, optional). Minimum 8: "Password must be at least 8 characters."
    - Help text: "Leave blank to keep the current password. Minimum 8 characters."

**Submit:** **"Save"** ("Saving...") plus **"Cancel"** → /users-list.
- Only changed fields are sent. `status` and `passout_year` are sent as numbers; `password` is sent when filled.
- If nothing changed, it shows the info toast "No changes to save."
- Calls `PUT update-user/:id` with the changed fields.
- Success toast: server message or "User updated successfully."; then navigate to /users-list.
- Error toast fallback: "Failed to update user."

##### `/users-profile-pics-list`: Users Profile Pictures (sidebar "Update Profile pics")
**Page title:** "Users Profile Pictures | Mpod". **Card title:** "{tenantName} - Users Profile Pictures". Platform users get the same Tenant select as Users List.

**Upload flow:**
1. **"Choose ZIP File"** opens a hidden `.zip` file input. After a file is picked, the button reads "ZIP: {name}".
   - A non-.zip file shows the toast "Please upload a valid ZIP file containing profile pictures."
2. **"Upload Profile Pics"** (green, disabled until a file is chosen).
   - Calls `POST upload-profile-pics` as multipart with field **`profile_pics_zip`**.
   - Success toast: server message or "Profile pictures uploaded."; images cache-bust with `?v=` and the list reloads.
   - Error toast fallback: "Failed to upload profile pictures."
   - The client does not define the image names inside the ZIP. The images are later read as `profile-pics/{roll_no}.png`.

**Table:** Profile Pic ("No Image" when there is no roll_no) | Name | Roll No | Status | Action. Actions are the same Edit / Deactivate (with the same modal) as Users List.

#### 8.3.3 Kiosk Devices: `/kiosk-devices` (PLATFORM + tenantadmin)
**How it is reached:** sidebar "Kiosk Devices"; the Tenants List "Kiosks" button (adds `?tenant_id=`); the tenantadmin Dashboard button "Kiosk devices".

**Page title:** "Kiosk Devices | Mpod". **Card title:** "Kiosk Devices".

**Info Alert:** "Kiosks are registered on the kiosk itself by opening **{STUDENT_APP_URL}kiosk-setup** (link, opens in a new tab) and signing in with a college admin account. Revoking a kiosk signs it out permanently; it must be registered again to be used."

**Tenant filter (platform only):**
- Select labelled **Tenant**: "" = "All tenants", plus every tenant from `GET get-tenants` (errors are ignored).
- The filter is synced to the URL query `?tenant_id=`.

**Data:** `GET kiosk/devices` (with `?tenant_id=` for platform users). Tenant staff always get their own tenant's devices.

**Table:** Name | Tenant (platform only; `organization_name` or `tenant_id`) | Status (`active` = Active green, anything else = Revoked grey) | Registered by (`first_name (roll_no)` or "—") | Last seen (`last_seen_at`) | Registered on (`createdAt`) | Action.
- Empty: "No kiosks registered yet." Error fallback: "Failed to load kiosk devices."

**Action:** **Revoke** (only when active) opens a ConfirmModal:
- Title "Revoke kiosk"; confirm "Revoke"; message `Revoke kiosk "{name}"? It will stop working immediately and must be registered again.`
- Calls `PUT kiosk/devices/:id/revoke`.
- Success toast: server message or "Kiosk revoked"; the row status becomes revoked.
- Error toast fallback: "Could not revoke kiosk."

---

### 8.4 Content section (PLATFORM only)

#### 8.4.1 Technologies
##### `/technologies-list` (sidebar "Technologies List")
**Page title:** "Technologies | Mpod". **Card title:** "Add Technology". **Button:** "ADD Technology" → /add-technology.

- **Data:** `GET get-technologies`. A 404 is treated as an empty list. Error fallback "Failed to load technologies."; empty text "No technologies found.".
- **Columns:** Technology Name | Category (raw value) | Status (Active/Inactive) | Action.
- **Action:** **Edit** → /edit-technology/:id.
  - A Delete button exists but is hidden (`d-none`). Its flow would be: ConfirmModal "Confirm Delete", `DELETE delete-technology/:id`, toast "Technology deleted successfully".

##### `/add-technology`
**Page title:** "Add Technology | Mpod". **Card title:** "ADD Technology".

**Fields:**
1. **Technology Name**: text, placeholder "Technology name", required (AvField "Enter Technology Name").
2. **Select Category**: react-select, placeholder "Select a category".
   - Options: `lowcode` "Low Code", `highcode` "High Code", `nocode` "No Code".

**Submit:** **"Submit"**. Client checks:
- empty name: toast "Technology name is required!"
- no category: toast "Please select a technology category!"

The request is `POST add-technology {technology_name, technology_category}`.
- Success toast: "Technology added successfully!"; then navigate to the list.
- Error toast fallback: "Something went wrong. Try again."

##### `/edit-technology/:technologyId`
**Page title:** "Edit Technology | Mpod". **Card title:** "EDIT Technology".

- **Load:** `GET get-technology-by-id/:id`. Error fallback "Failed to load technology."

**Fields:**
1. **Technology Name** (required)
2. **Select Category**: same options plus `owlground` "Owl Ground"
3. **Upload Technology Icon**: file input, `image/*`. Shows the current icon from `technology-icons/{file}`.
4. **Active**: toggle switch (No/Yes), status 1/0

**Submit:** **"Update"** calls `POST update-technology/:id` as multipart with `technology_name`, `technology_category`, `status`, and optionally `technology_icon`.
- Success toast: "Technology updated successfully"; then navigate to the list.
- Error toast fallback: "Failed to update technology."
- Client checks are the same as on Add.

#### 8.4.2 Modules
##### `/modules-list` (sidebar "Modules List")
**Page title:** "Modules | Mpod". **Card title:** "Add Module". **Button:** "ADD Module".

- **Data:** `GET get-modules` (404 means empty). Empty text "No modules found.".
- **Columns:** Technology Name | Module Name | Module Icon (image from `module-icons/`) | Status | Action.
- **Action:** **Edit**. Delete is hidden; it would call `DELETE delete-module/:id` with the toast "Module deleted successfully".

##### `/add-module`
**Page title:** "Add Module | Mpod". **Card title:** "ADD MODULE".

**Fields:**
1. **Select technology**: react-select from `GET get-technologies`.
2. **Module Name**: text, required ("Enter Module Name").
3. **Module icon**: optional file (`image/*`) with an inline preview.

**Submit:** **"Submit"**. Client checks:
- no technology: toast "Please select a technology"
- no name: "Module name is required"

The request is `POST add-module` as multipart with `file` (optional), `module_name` and `technology`.
- Success toast: "Module added successfully"; then go to the list.
- Error toast fallback: "Something went wrong while adding the module".

##### `/edit-module/:moduleId`
**Card title:** "EDIT Module".

- **Load:** `GET get-module-by-id/:id`. The technology is preselected.

**Fields:** Select Technology, Module Name, Module icon (current image or preview), **Status** toggle (No/Yes).

**Submit:** **"Submit"** calls `POST update-module/:id` as multipart with `file?`, `module_name`, `technology` and `status`.
- Success toast: "Module updated successfully". Error fallback: "Failed to update module.".

#### 8.4.3 Topics
##### `/topics-list` (sidebar "Topics List")
**Page title:** "Topics | Mpod". **Card title:** "Add Topic". **Button:** "ADD TOPIC".

- **Data:** `GET get-topics` (404 means empty). Empty text "No topics found.".
- **Columns:** Technology | Module | Topic | Status | Action.
- **Action:** **Edit**. Delete is hidden; it would call `DELETE delete-topic/:id` with the toast "Topic deleted successfully".

##### `/add-topic`: topics are uploaded as a file
**Card title:** "ADD TOPIC".

**Fields:**
1. **Select technology** (react-select).
2. **Select Module**: loads once a technology is chosen, via `POST get-modules-by-technology {technology_id}` (404 ignored). Changing the technology clears the module.
   - No options: "Select a technology first" or "No modules".
3. **Upload topics**: file input with no `accept` restriction. The expected file format is not stated in the client.

**Submit:** **"Submit"**. Client checks:
- "Please select a technology"
- "Please select a module"
- "Please upload a topic file"

The request is `POST add-topic` as multipart with `file`, `module` and `technology`.
- Success toast: "Topic created successfully". Error fallback: "Something went wrong while adding the topic".

##### `/edit-topic/:topicId`
**Card title:** "EDIT TOPIC".

- **Load:** `GET get-topic-by-id/:id`. The technology, then the module, are preselected.

**Fields:** Select technology, Select module (depends on technology), **Topic Name** (required, "Enter Topic Name"), **Status** toggle.

**Submit:** **"Submit"** calls `POST update-topic/:id {topic_name, module, technology, status}` (JSON).
- Success toast: "Topic updated successfully". Error fallback: "Failed to update topic.".
- An empty name shows the toast "Topic name is required".

#### 8.4.4 Interview Questions (sidebar Questions → "Interview Questions")
##### `/interview-questions-list`
**Page title:** "Interview Questions | Mpod". **Card title:** "Add Interview Question". **Button:** "Add Interview Question".

- **Data:** `GET get-interview-questions`. Empty text "No interview questions found.".
- **Columns:** Technology | Question | Answer | Star Status (raw `previous_asked_status`) | Action.
- **Actions:**
  - **Edit**
  - **Delete**: ConfirmModal "Confirm Delete", message "Are you sure you want to delete this interview question?"
    - Calls `DELETE delete-interview-question/:id`.
    - Success toast: "Interview Question deleted successfully".

##### `/add-interview-question`: uploaded as a file
**Card title:** "Add Interview Question".

**Fields:**
1. **Select Technology** (react-select).
2. **Select Companies (Multi-select)**: from `GET companies-list`.
3. **Upload questions File**: file input, no `accept` restriction.

**Submit:** **"Submit"**. Client checks:
- "Please select a technology"
- "Please upload a questions file"

The request is `POST add-interview-questions` as multipart with:
- `file`
- `company` = JSON array of ids
- `technology`
- `previous_asked_status` = 1 if any company was chosen, otherwise 0

Success toast: "Interview questions added successfully"; then go to the list. Error fallback: "Something went wrong while adding the questions".

##### `/edit-interview-question/:questionId`
**Card title:** "Edit Interview Question".

- **Load (parallel):** get-technologies, companies-list, `GET get-interview-question-by-id/:id`.

**Fields:**
1. Select technology
2. Select companies (multi)
3. **Question**: textarea, 4 rows, required
4. **Answer**: textarea, required
5. **Status** toggle (No/Yes). Its initial value comes from `previous_asked_status === 1`, but it is sent as `status`.

**Submit:** **"Submit"** calls `POST update-interview-question {id, question, answer, company:[ids], technology, status}`.
- Success toast: "Updated Successfully"; then go to the list.
- Error fallback: "Failed to update interview question."
- The required textareas have no JS-enforced check, because the button is `type="button"` and does not trigger AvForm validation.

#### 8.4.5 Company Questions (sidebar Questions → "Company Questions")
##### `/companies-questions-list`
**Page title:** "Company Questions | Mpod". **Card title:** "Company Questions".

**Header buttons:**
- **"EXPORT TO EXCEL"** (green, Excel icon). Disabled while loading or when the list is empty; an empty list also shows the warning toast "No data available to download".
  - Columns: Company, Tag, Type, Round, Year, Question, Status (Active/Inactive).
  - Sheet "Company Questions".
  - File name: `Questions_{tagName}.xlsx` when a tag filter is set, otherwise `All_Company_Questions.xlsx`.
- **"ADD COMPANY QUESTION"** → /add-company-question.

**Filter:** **"Filter by Tag"** select: "" = "All Tags", plus tags from `GET tags-list` (`data.tags`).
- With a tag: `GET get-company-questions-by-tag-id/:tagId`.
- Without: `GET get-company-questions`.
- A 404 means empty. Empty text "No company questions found.".

**Columns:** Company | Tag | Type | Round | Year | Question | Status | Action.

**Actions:**
- **Edit**
- **Delete**: ConfirmModal "Are you sure you want to delete this company question?"
  - Calls `DELETE delete-company-question/:id`.
  - Success toast: "Company question deleted successfully".

##### `/add-company-question`: uploaded as a file
**Card title:** "ADD COMPANY QUESTION". All inputs are react-selects.

**Fields:**
1. **Select Company** (companies-list)
2. **Select Type**: `service_based` "Service Based", `product_based` "Product Based"
3. **Select Round**: TR1, TR2, TR3, TR4, MR1, HR1 (value = label)
4. **Select Year**: 2015 up to (current year − 1). The list is built with `length = currentYear − 2014`, starting at 2015.
5. **Select Tag** (tags-list)
6. **Upload Questions**: file input, no `accept` restriction

**Submit:** **"Submit"**.
- If anything is missing: toast "Please fill all fields" (3 s).
- Calls `POST add-company-question` as multipart with `file, company, type, round, year, tag`.
- Success toast: "Question added successfully". Error fallback: "Failed to add question".

##### `/edit-company-question/:questionId`
**Card title:** "EDIT COMPANY QUESTION".

- **Load (parallel):** companies-list, tags-list, `GET get-company-question-by-id/:id`.

**Fields:** Select Company, Select Type, Select Round, Select Year, Select Tag, **Question** (textarea). All are required ("Please fill all fields").

**Submit:** **"Update"** calls `PUT update-company-question/:id {company, type, round, year, tag, question}`.
- Success toast: "Question updated successfully". Error fallback: "Failed to update question".

#### 8.4.6 Coding Questions (sidebar Questions → "Coding Questions")
##### `/coding-questions-list`
**Page title:** "Coding Questions | Mpod". **Card title:** "Coding Questions List". **Button:** "ADD CODING QUESTIONS".

- **Data:** `GET get-coding-questions` (404 means empty). Empty text "No coding questions found.".
- **Columns:** Problem | Complexity | Time | Status | Action.
- **Actions:**
  - **Edit**
  - **View**: opens a modal with the problem name as its title, on a dark body. Sections: "Description:" (sanitised HTML via DOMPurify), "Input:", "Output:", "Constraints:" (plain text in `<pre>`).
  - **Delete**: ConfirmModal `Are you sure you want to delete "{problem_name}"?`
    - Calls `DELETE delete-coding-question/:id`.
    - Success toast: "Coding question deleted successfully".

##### `/add-coding-question`
**Card title:** "Add Coding Question".

**Fields:**
1. **Problem Name**: text, required
2. **Complexity**: select, `easy` Easy / `medium` Medium / `hard` Hard, required
3. **Time**: select, `15` "15 min", `20` "20 min", `25` "25 min", `30` "30 min", required
4. **Company (Optional)**: clearable select (companies-list)
5. **Description**: rich text editor (Draft.js WYSIWYG; images are embedded as base64 data URLs)
6. **Input**: rich text editor
7. **Output**: rich text editor
8. **Constraints**: rich text editor

**Submit:** **"Submit"**.
- If required fields are missing: toast "Please fill all required fields".
- Calls `POST add-coding-question` with `{problem_name, complexity, time, company|null, description, input, output, constraints (HTML), added_by: user.roll_no}`.
- Success toast: "Question added successfully". Error fallback: "Failed to add question".

##### `/edit-coding-question/:questionId`
**Card title:** "EDIT CODING QUESTION".

- **Load:** companies-list and `GET get-coding-question-by-id/:id`. The HTML is converted back into editor state.

**Field order:** Problem Name, Time, Company (Optional), Complexity, then the Description / Input / Output / Constraints editors.

**Submit:** **"Update"** calls `PUT update-coding-question/:id` with the same body minus `added_by`.
- Success toast: "Question updated successfully".

#### 8.4.7 Companies (sidebar "Companies List")
##### `/companies-list`
**Page title:** "Companies | Mpod". There is no card title; the only header element is the button "Add Company".

- **Data:** `GET companies-list`. Empty text "No companies found.".
- **Columns:** Company Name | Action.
- **Actions:**
  - **Edit**
  - **Delete**: ConfirmModal `Are you sure you want to delete the company "{name}"?`
    - Calls `DELETE delete-company/:id`.
    - Success toast: "Company deleted". Error fallback: "Company not deleted".

##### `/add-company`
**Card title:** "Add Company".

- **Field:** **Company Name** (text, placeholder "Enter Company Name"). Empty: toast "Company name is required".
- **Submit:** **"Submit"** calls `POST add-company {company_name, added_date:now, update_date:now, added_by: first_name||roll_no||"admin", status:1}`.
- Success toast: "Company added". Error fallback: "Company not added".

##### `/edit-company/:companyId`
**Card title:** "Edit Company".

- **Load:** `GET get-company/:id`. An empty response shows "Company not found.".
- **Field:** Company Name.
- **Submit:** **"Submit"** calls `PUT update-company/:id {company_name, added_date, update_date:now, added_by, status}`.
- Success toast: "Company updated". Error fallback: "Company not updated".

#### 8.4.8 Tags (sidebar "Tags List")
##### `/tags-list`
**Page title:** "Tags | Mpod". **Button:** "Add Tag".

- **Data:** `GET tags-list` (`data.tags`). Empty text "No tags found.".
- **Columns:** Tag Name | Status (ACTIVE / INACTIVE badges) | Action.
- **Actions:**
  - **Edit**
  - **Delete**: ConfirmModal `Are you sure you want to delete the tag "{name}"?`
    - Calls `DELETE delete-tag/:id`.
    - Success toast: "Tag deleted". Error fallback: "Tag not deleted".

##### `/add-tag`
**Card title:** "Add Tag".

- **Field:** **Tag Name** (placeholder "Enter Tag Name"). Empty: toast "Tag name is required".
- **Submit:** **"Submit"** calls `POST add-tag {tag_name, createdAt, updatedAt, added_by, status:1}`.
- Success toast: "Tag added successfully". Error fallback: "Tag not added".

##### `/edit-tag/:tagId`
- **Load:** `GET get-tag/:id` ("Tag not found." when empty).
- **Field:** Tag Name.
- **Submit:** **"Submit"** calls `PUT update-tag/:id {tag_name, createdAt, updatedAt:now, added_by, status}`.
- Success toast: "Tag updated". Error fallback: "Tag not updated".

---

### 8.5 Interview section (ALL_STAFF): Maya AI

#### Shared pieces
**College selection (`useTenantSelection`)**
- Platform roles get a **"College"** select from `GET get-tenants` (failure toast "Failed to load colleges.").
  - Options: "" = "Select a college", then every tenant. A placeholder option shows `{tenantName || "Current college"}` when the current id is not in the list.
  - The choice is remembered in sessionStorage (`mpod_admin_interview_tenant`) and shared between the list and add pages.
  - The default is the stored value, then the user's `t_id`.
- Tenant staff always use their own `t_id` and see no selector.

**StudentSelect (searchable)**
- Data: `GET get-students/{tenantId}`.
- Option label: `"{roll_no} - {first_name} ({branch})"`; the value is the roll_no. The select is clearable.
- Placeholder: "Search by roll no or name...", or "Select a college first" (disabled when no college is set).
- No options: "Loading..." or "No students found. Import students under Users first."
- A load error shows small red text (fallback "Could not load students.").

**DateTimePicker (flatpickr)**
- Shows date and time, display format "F j, Y h:i K", stored format "Y-m-d H:i".
- Minutes step by 5. The placeholder is "Select date and time".
- Add pages set the minimum date to **today**. Edit pages pass `allowPast`.
- The value is reported on change, value update and close.

**Status colours:**

| Status | Colour |
|---|---|
| Attempted | success (green) |
| Upcoming | info (blue) |
| In progress | primary |
| Evaluating | secondary |
| Waiting for AI | warning |
| Evaluation failed | danger |
| Expired | dark |

- A **"Provisional"** warning badge is shown next to the status when `row.provisional` is set. Its tooltip is `evaluation_error` or "Scored without AI".

**Delete toast** (`deleteResultMessage`): the server message or "Interview deleted", followed by:
- " — Credit refunded" when `refunded === true`
- " — No refund (interview already started)" when `refunded === false`

**Percentage card:** Attempted / (Attempted + Expired) × 100, to 2 decimals.

**Bulk sample download** (all three add pages): `sample_data.xlsx`, sheet "Sample Data", one column **`roll_no`** (one empty row). The bulk upload accepts `.csv,.xlsx`.

**Row actions on the three list pages:**
- **If the status is "Attempted":**
  - **View**: opens the student-app report in a new tab: `{STUDENT_APP_URL}report?roll_no=&interview_type=ai generated|company&id=` (coding uses `coding-report?…interview_type=coding`).
  - If `provisional`: **"Re-score with AI"** (RetryEvaluationButton, title "Replace the provisional score with the AI evaluation").
- **Otherwise:**
  - **Edit**, only when "Upcoming".
  - **"Retry evaluation"**, only when "Waiting for AI" or "Evaluation failed" (tooltip `evaluation_error`).
  - **Delete**, always: ConfirmModal "Confirm Deletion" / "Are you sure you want to delete this interview?"

#### 8.5.1 `/ai-interviews-list`: Interviews List (technology / AI interviews)
**Page title:** "Interviews List | Mpod". **Breadcrumb:** Mpod › Maya Ai › Interviews List. **Card title:** "{tenantName} - Interview List".

**Header:** College select (platform only), **"Download Excel"** (green, disabled when there are no filtered rows), **"ADD INTERVIEW"** → /add-ai-interview.

**Summary cards** (computed from the filtered rows): Upcoming | Attempted | Expired | Percentage.

**Filters:**
- Text search, placeholder "Search by platform, roll no, or name" (matches platform, roll_no or first_name).
- **Date** input, defaulting to **today in IST**, with the hint "Showing today by default".
  - Fetched server-side: `GET get-all-interviewee-details/{tenantId}?date=YYYY-MM-DD`. Clearing the date re-fetches today.
- Status select: "All Statuses", Upcoming, Attempted, Expired, In progress, Waiting for AI, Evaluating, Evaluation failed.
- Technology select: "All" plus the distinct `technology_name` values in the data.

**Table** (react-bootstrap-table with pagination, condensed):
- Columns: Platform | Roll No | College | Name | Gender | Technology | Modules (joined) | Topics (joined) | Level | No of Questions | Start Date & Time (`start_date_time_ist`) | Status | Total Accuracy (`average_accuracy`) | Actions.
- Empty: "No interviews found", or "Select a college" when no college is set.
- Error fallback: "Failed to load interviews."

**Delete:** `DELETE delete-interviewee-details/:id`. Error fallback: "Failed to delete interview.".

**Retry/Re-score:** `interview_type = "ai generated"`.

**Excel export:** `InterviewsList.xlsx`, sheet "Interviews". Columns: Platform, Roll No, College, Name, Gender, Technology, Modules, Topics, Level, No of Questions, Start Date & Time, Accuracy, Status.

#### 8.5.2 `/add-ai-interview`: Add Interview
**Page title:** "Add Interview | Mpod". **Card title:** "Add Interview".

**Fields, in order:**
0. **College** (platform only)
1. **Select Platform**: `web` "Web", `mpod` "MPOD"
2. **Select Interview Type**: `single` "Single", `bulk` "Bulk". Changing it resets the roll no and file.
3. Depends on the interview type:
   - Single: **Student** (StudentSelect, searchable).
   - Bulk: **Upload File** (`.csv,.xlsx`) and the button **"Download Sample"**.
4. **Select Technology**: react-select from `GET get-technologies`. Changing it clears modules and topics.
5. **Select Module**: multi-select. Loads after a technology is chosen, via `POST get-modules-by-technology {technology_id}`.
6. **Topic**: multi-select. Loads after at least one module is chosen, via `POST get-topics-by-multi-modules {module_ids:[…]}`.
7. **Complexity**: `easy` Easy / `medium` Medium / `hard` Hard / `any` Any
8. **No. of Questions**: number, min 1, max 10. Red hint text below: "Upto 10 Questions is Valid".
9. **Start Date and Time**: DateTimePicker (no past dates), stored as an ISO string
10. **Status**: `1` "Active" / `0` "Not Active"

**Validation** (warning toasts):
- "Select a college"
- "Please fill all required fields" (all of items 1–10 are required)
- "please enter upto 10 questions" (when more than 10)
- "Please enter a Roll No" (single)
- "Please upload a file" (bulk)

**Submit:** **"Submit"**; shows "Processing..." with a spinner while running.

**Single:** `POST add-interviewee-details` with:
- `platform`
- `roll_no` (trimmed, upper-cased)
- `technology`
- `module`, `topic` (arrays of ids)
- `start_date_time`, `level`, `questions_count`, `status`
- `created_by: user.roll_no`
- `tenant_id`

Success toast: "Interview added successfully!"; then navigate to /ai-interviews-list.

**Bulk:** `POST add-bulk-interviewee-details` as multipart:
- `file`
- `module`, `topic` as JSON strings
- `platform`, `technology`, `start_date_time`, `level`, `questions_count`, `status`, `created_by`, `tenant_id`
- `type = "bulk"`

The response is handled as follows:
- **HTTP 207** with `results[]` containing `status:"failed"` entries: error toast "Some interviews failed to be scheduled." and a red card **"Failed Interview Creations"** with "{n} out of {total} interviews failed", listing each roll_no badge with "Reason: {message|reason}". The page stays open.
- Otherwise: success toast and navigate.

**Errors** (for example 400 insufficient credits): toast with the server message (fallback "Failed to add interview.").

#### 8.5.3 `/edit-ai-interview/:id` (Edit button; shown only for Upcoming rows)
**Page title:** "Edit Interview | Mpod".

- **Load:** `GET get-interviewee-details/:id`. Module and topic labels come from `module_details` / `topic_details`, or from legacy parallel name arrays.

**Fields:**
1. Select Platform
2. **Enter Roll No** (plain text, not StudentSelect)
3. Select Technology
4. Select Module (multi)
5. Topic (multi)
6. Complexity
7. No. of Questions (min 1, max 10 as HTML attributes only; no JS cap)
8. Start Date and Time (past allowed)

There is no Status field and no College field.

**Submit:** **"Update"** ("Updating...").
- If anything is missing: toast "Please fill all required fields".
- Calls `PUT edit-interviewee-details/:id {platform, roll_no (trimmed, not upper-cased), technology, module[], topic[], start_date_time (ISO), level, questions_count, created_by}`.
- Success toast: "Interview updated successfully!"; then navigate. Error fallback: "Failed to update interview.".

#### 8.5.4 `/company-interviews-list`: Company Interviews List
**Page title:** "Company Interviews List | Mpod". **Breadcrumb:** Mpod › Maya Ai › Company Interviews List. **Card title:** "{tenantName} - Company Interviews List".

**Header:** College select, **"ADD INTERVIEW"** → /add-company-interview. There is **no Excel export**.

**Summary cards:** Upcoming, Attempted, Expired, Percentage. These count the whole date-scoped dataset, not the search-filtered rows.

**Filters:**
- Search, placeholder "Search by Name, Roll No, Platform".
- Date (default today in IST, hint "Showing today by default"), fetched server-side: `GET get-company-interviews/{tenantId}?date=`.
- There is no status filter.

**Table** (paginated):
- Columns: Platform | Roll no | Name | Gender | Type | Round | No of Questions | Start Date & Time | Status | Actions.
- Empty: "No interviews found for selected date." or "Select a college". Error fallback: "Failed to load company interviews.".

**Delete:** `DELETE delete-company-interviewee-details/:id`. **Retry:** `interview_type = "company"`.

**Bug:** the row mapper `mapToRows` keeps only platform, roll_no, first_name, gender, type, round, questions_count, start_date_time, interview_status and `_id`. It drops `provisional` and `evaluation_error`. As a result, on this page the "Provisional" badge and "Re-score with AI" button never appear, and the Retry button has no tooltip.

#### 8.5.5 `/add-company-interview`: Add Company Interview
**Page title:** "Add Company Interview | Mpod". **Card title:** "Add Company Interview".

**Fields:**
0. College (platform only)
1. Select Platform (Web / MPOD)
2. Select Interview Type (Single / Bulk)
3. Student (searchable) **or** Upload File (`.csv,.xlsx`) with "Download Sample"
4. **Select Company**: multi, from `GET companies-list`
5. **Select Type**: multi, `service_based` "Service Based" / `product_based` "Product Based"
6. **Select Round**: multi, TR1, TR2, TR3, TR4, MR1, HR1
7. **Select Tag**: single, optional, from `GET tags-list`
8. **Start Date and Time**: no past dates
9. **No. of Questions**: number, min 1, max 30 (HTML only)
10. **Status**: `1` "Active" / `0` "not Active"

**Right panel "Available Questions: {count | -}"**:
- Re-fetched whenever company, type and round each have at least one value (and on tag change).
- Calls `POST available-company-questions {company:[ids], type:[…], round:[…], tag}` and reads `data.count`.
- Error toast fallback: "Failed to load available questions count."

**Validation** (warning toasts):
- "Select a college"
- "Please fill all required fields" (platform, interview type, company, type, round, start, count and status are required; tag is optional)
- "Please enter a Roll No"
- "Please upload a file"

**Submit:** **"Submit"** ("Processing...").

**Single:** `POST add-company-interview {platform, company[], roll_no (trimmed), type[], round[], tag, start_date_time, questions_count, status, created_by, tenant_id}`.
- Success toast: "Interview added successfully!"; then navigate.

**Bulk:** `POST bulk-add-company-interviews` as multipart:
- `file`, `platform`
- `company`, `type`, `round` as JSON strings
- `tag` (only if set)
- `start_date_time`, `questions_count`, `status`, `created_by`, `tenant_id`

The response is handled as follows:
- Success toast: "Bulk interviews: {success} of {total} scheduled", or "Bulk interviews added successfully!".
- If `failed > 0` or there are failed results: warning toast "{n} interview(s) could not be scheduled" and the "Failed Interview Creations" card ("No roll no" is shown when a row has none). The page stays open.
- Otherwise it navigates.

**Error fallback:** "Something went wrong. Please try again.".

#### 8.5.6 `/edit-company-interview/:id`
**Page title:** "Edit Company Interview | Mpod".

- **Load:** companies-list, then `GET get-company-interview-by-id/:id`.

**Fields:**
1. Select Platform
2. Enter Roll No (text)
3. Select Company (multi)
4. Select Type (multi)
5. Select Round (multi)
6. No. of Questions (max 30)
7. Start Date and Time (past allowed)

There is no tag or status field.

**Submit:** **"Update"** calls `PUT update-company-interview/:id {platform, company[], roll_no, round[], start_date_time ISO, type[], questions_count, created_by}`.
- Success toast: "Interview updated successfully!". Error fallback: "Failed to update interview. Please try again.".

#### 8.5.7 `/coding-interviews-list`: Coding Interviews List
**Page title:** "Coding Interviews List | Mpod". **Card title:** "{tenantName} - Coding Interviews List".

**Header:** College select, **"Download Excel"**, **"ADD CODING INTERVIEW"**. There are **no summary cards**.

**Data:** `GET get-all-coding-interview-details/{tenantId}`. This loads **all dates**.

**Filters** (all client-side):
- Search: "Search by platform, roll no, or name".
- Date: **empty by default**. It compares against `start_date_time_ist` (DD-MM-YYYY is parsed).
- Status select: same options as the AI list.

**Table:**
- Columns: Platform | Roll no | Name | Gender | Level | No of Questions | Start Date & Time | Status | Actions.
- Empty: "No coding interviews found" or "Select a college". Error fallback: "Failed to load coding interviews.".

**View** opens the `coding-report` page. **Retry:** `interview_type = "coding"`. **Delete:** `DELETE delete-coding-interview/:id`.

**Excel export:** `InterviewsList.xlsx` (same file name as the AI list), sheet "Interviews". Columns: Platform, Roll No, Name, Gender, Level, No of Questions, Start Date & Time, Status.

#### 8.5.8 `/add-coding-interview`
**Page title:** "Add Coding Interview | Mpod". **Card title:** "Add Coding Interview".

**Fields:**
0. College (platform only)
1. Select Platform
2. Select Interview Type
3. Student **or** Upload File with "Download Sample"
4. **Complexity**: easy / medium / hard / any
5. **Start Date and Time**: no past dates
6. **Status**: `1` "Active" / `0` "not Active"

There is no question-count input. **`questions_count` is always sent as 2.**

**Right panel "Available Questions":** "Easy: n", "Medium: n", "Hard: n" from `GET coding-questions-count` (error fallback "Failed to load available questions count.").

**Validation** (warning toasts, checked in this order):
1. "Select a college"
2. "Please select a platform."
3. "Please select interview type."
4. "Please select complexity level."
5. "Please select start date and time."
6. "Please select interview status."
7. "Please enter a Roll No"
8. "Please upload a file"

**Submit:** **"Submit"** ("Processing...").

**Single:** `POST add-coding-interview {platform, roll_no, start_date_time, level, questions_count:2, status, created_by, tenant_id}`.

**Bulk:** `POST add-bulk-coding-interview` as multipart with `file, platform, start_date_time, level, questions_count, status, created_by, tenant_id, type`.
- On a 207 with failed rows: toast "Some interviews failed to be scheduled." and the "Failed Interview Creations" card.

**Success toast:** "Interview added successfully!"; then navigate to /coding-interviews-list. **Error fallback:** "Failed to add coding interview.".

#### 8.5.9 `/edit-coding-interview/:id`
**Page title:** "Edit Coding Interview | Mpod".

- **Load:** `GET get-coding-interview-details-by-id/:id`.

**Fields:**
1. Select Platform
2. Enter Roll No
3. Complexity
4. **No. of Questions** (number, max 30). This is editable here, unlike on Add.
5. Start Date and Time (past allowed)

**Submit:** **"Update"** calls `PUT update-coding-interview/:id {platform, roll_no, start_date_time ISO, level, questions_count, created_by}`.
- Success toast: "Interview updated successfully!". Error fallback: "Failed to update interview.".

---

### 8.6 Notable quirks and inconsistencies
1. **Company Interviews List:** `mapToRows` drops `provisional` and `evaluation_error`, so the Provisional badge, "Re-score with AI" and the retry tooltip never appear on that page.
2. **Hidden delete buttons:** Technologies, Modules and Topics have their Delete buttons hidden with `d-none`. The confirm flow and API calls are wired up but cannot be reached.
3. **Edit Interview Question status toggle:** it is initialised from `previous_asked_status` but saved as `status`. Its required textareas are not enforced, because the button is `type="button"`.
4. **Category options differ:** Edit Technology offers an extra category, "Owl Ground" (`owlground`), that Add Technology does not.
5. **Question-count limits differ:**
   - AI interviews: limited to 10 in JS on Add only.
   - Company interviews: max 30 as an HTML attribute only.
   - Coding interviews: fixed at 2 on Add, but editable (max 30) on Edit.
6. **Roll-number entry on Edit pages:** all Edit interview pages use a free-text "Enter Roll No" instead of StudentSelect, and none of them let you change the college or status. Only Add AI Interview upper-cases the roll_no.
7. **Date handling differs across lists:** Coding Interviews List loads every date and filters client-side, with an empty default date. The AI and Company lists fetch per date from the server, defaulting to today in IST.
8. **Summary-card counting differs:** on the AI list the cards count search/status/technology-filtered rows; on the Company list they count all rows for the date.
9. **Unused code:** `getYesterdayDateString` in `interviewHelpers.js` is never used.
10. **Platform label:** the tenant Dashboard labels the `web` platform as **"Sky"**, while interview forms label it "Web".
11. **Same file name for two exports:** the AI and Coding Interview lists both export to `InterviewsList.xlsx`.
12. **No upload format given for content files:** Add Topic, Add Interview Question and Add Company Question have no `accept` filter and no sample template, so the expected file format for them is backend-defined and not visible in the client.

---

## 9. API reference

- **Base path:** `/backend/api`. All bodies are JSON unless the route is marked as a file upload (multipart).
- **Errors:** `{ message, code? }` with statuses 400 (validation), 401 (no or invalid session), 403 (role or college not allowed), 404, 409 (state conflict, e.g. already started), 413, 429 (rate limit or lockout) and 502 (AI preparation failed).
- **Access** describes who may call each route (section 3); "college-scoped" means college staff are limited to their own college.

### content routes

| Method | Path | Access | Handler |
|---|---|---|---|
| GET | `/backend/api/get-technologies` | Any staff | Technology.gettechnologies |
| GET | `/backend/api/get-technology-by-id/:id` | Any staff | Technology.getTechnologyById |
| POST | `/backend/api/add-technology` | Platform admin | Technology.addTechnology |
| POST | `/backend/api/update-technology/:id` | Platform admin | Technology.updateTechnology |
| DELETE | `/backend/api/delete-technology/:id` | Platform admin | Technology.deleteTechnology |
| GET | `/backend/api/get-modules` | Any staff | Module.getModules |
| GET | `/backend/api/get-module-by-id/:id` | Any staff | Module.getModuleById |
| POST | `/backend/api/get-modules-by-technology` | Any staff | Module.getModulesByTechnology |
| POST | `/backend/api/get-modules-by-technologies` | Any staff | Module.getModulesByTechnologies |
| POST | `/backend/api/add-module` | Platform admin | Module.addModule |
| POST | `/backend/api/update-module/:id` | Platform admin | Module.updateModule |
| DELETE | `/backend/api/delete-module/:id` | Platform admin | Module.deleteModule |
| GET | `/backend/api/get-topics` | Any staff | Topic.getTopics |
| GET | `/backend/api/get-topic-by-id/:id` | Any staff | Topic.getTopicById |
| POST | `/backend/api/get-topics-by-module` | Any staff | Topic.getTopicsByModule |
| POST | `/backend/api/get-topics-by-multi-modules` | Any staff | Topic.getTopicsByMultiModules |
| POST | `/backend/api/add-topic` | Platform admin | Topic.addTopic |
| POST | `/backend/api/update-topic/:id` | Platform admin | Topic.updateTopic |
| DELETE | `/backend/api/delete-topic/:id` | Platform admin | Topic.deleteTopic |
| GET | `/backend/api/companies-list` | Any staff | Company.getCompanies |
| GET | `/backend/api/get-company/:id` | Any staff | Company.getCompanyById |
| POST | `/backend/api/get-company-names` | Any staff | Company.getCompaniesNames |
| POST | `/backend/api/add-company` | Platform admin | Company.AddCompany |
| PUT | `/backend/api/update-company/:id` | Platform admin | Company.updateCompany |
| DELETE | `/backend/api/delete-company/:id` | Platform admin | Company.deleteCompany |
| GET | `/backend/api/tags-list` | Any staff | Tag.getTags |
| GET | `/backend/api/get-tag/:id` | Any staff | Tag.getTagById |
| POST | `/backend/api/add-tag` | Platform admin | Tag.AddTag |
| PUT | `/backend/api/update-tag/:id` | Platform admin | Tag.updateTag |
| DELETE | `/backend/api/delete-tag/:id` | Platform admin | Tag.deleteTag |
| GET | `/backend/api/get-company-questions` | Any staff | CompanyQuestion.getCompanyQuestions |
| GET | `/backend/api/get-company-question-by-id/:id` | Any staff | CompanyQuestion.getCompanyQuestionById |
| GET | `/backend/api/get-company-questions-by-tag-id/:tag_id` | Any staff | CompanyQuestion.getCompanyQuestionsByTag |
| POST | `/backend/api/add-company-question` | Platform admin | CompanyQuestion.addCompanyQuestion |
| PUT | `/backend/api/update-company-question/:id` | Platform admin | CompanyQuestion.updateCompanyQuestion |
| DELETE | `/backend/api/delete-company-question/:id` | Platform admin | CompanyQuestion.deleteCompanyQuestion |
| DELETE | `/backend/api/delete-comapny-question/:id` | Platform admin | CompanyQuestion.deleteCompanyQuestion |
| GET | `/backend/api/get-coding-questions` | Any staff | CodingQuestion.getCodingQuestions |
| GET | `/backend/api/get-coding-question-by-id/:id` | Any staff | CodingQuestion.getCodingQuestionById |
| GET | `/backend/api/coding-questions-count` | Any staff | CodingQuestion.codingQuestionsCount |
| POST | `/backend/api/add-coding-question` | Platform admin | CodingQuestion.addCodingQuestion |
| PUT | `/backend/api/update-coding-question/:id` | Platform admin | CodingQuestion.updateCodingQuestion |
| DELETE | `/backend/api/delete-coding-question/:id` | Platform admin | CodingQuestion.deleteCodingQuestion |
| GET | `/backend/api/get-interview-questions` | Any staff | Lite.getInterviewQuestions |
| GET | `/backend/api/get-interview-question-by-id/:id` | Any staff | Lite.getInterviewQuestionById |
| POST | `/backend/api/add-interview-questions` | Platform admin | Lite.addInterviewQuestions |
| POST | `/backend/api/update-interview-question` | Platform admin | Lite.updateInterviewQuestion |
| DELETE | `/backend/api/delete-interview-question/:id` | Platform admin | Lite.deleteInterviewQuestion |

### dashboard routes

| Method | Path | Access | Handler |
|---|---|---|---|
| GET | `/backend/api/get-users-stats/:tid` | Any staff (own college) | Dashboard.userStats |
| GET | `/backend/api/get-interview-stats/:tid` | Any staff (own college) | Dashboard.getInterviewStats |
| GET | `/backend/api/get-platform-stats/:tid` | Any staff (own college) | Dashboard.getPlatformStats |
| GET | `/backend/api/get-assigned-interview-stats/:tid` | Any staff (own college) | Dashboard.getAssignedInterviewStats |
| GET | `/backend/api/get-yesterday-assigned-interview-stats/:tid` | Any staff (own college) | Dashboard.getYesterdayAssignedInterviewStats |
| GET | `/backend/api/get-yesterday-attempted-interview-stats/:tid` | Any staff (own college) | Dashboard.getYesterdayAttemptedInterviewStats |
| GET | `/backend/api/get-yesterday-tech-stats/:tid` | Any staff (own college) | Dashboard.getYesterdayTechStats |
| GET | `/backend/api/get-yesterday-attempted-tech-stats/:tid` | Any staff (own college) | Dashboard.getYesterdayAttemptedTechStats |
| GET | `/backend/api/get-coding-questions-count` | Any staff (own college) | Dashboard.getCodingQuestionsCount |
| GET | `/backend/api/get-company-questions-count` | Any staff (own college) | Dashboard.getCompanyQuestionsCount |
| GET | `/backend/api/get-overall-yesterday-assigned-interview-stats` | Platform admin | Dashboard.getOverAllYesterdayAssignedInterviewStats |
| GET | `/backend/api/get-overall-yesterday-attempted-interview-stats` | Platform admin | Dashboard.getOverAllYesterdayAttemptedInterviewStats |
| GET | `/backend/api/get-all-tenants-yesterday-assigned-stats` | Platform admin | Dashboard.getAllTenantsYesterdayAssignedStats |
| GET | `/backend/api/get-overall-stats` | Platform admin | Dashboard.overallStats |
| GET | `/backend/api/get-current-stats` | Platform admin | Dashboard.currentStats |
| GET | `/backend/api/get-day-wise-stats` | Platform admin | Dashboard.getDaywiseStats |

### interview routes

| Method | Path | Access | Handler |
|---|---|---|---|
| POST | `/backend/api/add-interviewee-details` | Any staff | Tech.addInterviewDetails |
| POST | `/backend/api/add-bulk-interviewee-details` | Any staff, file upload | Tech.addBulkInterviewDetails |
| GET | `/backend/api/get-all-interviewee-details/:id` | Any staff, college-scoped | Tech.getAllInterviewDetails |
| GET | `/backend/api/get-interviewee-details/:id` | Any staff | Tech.getInterviewDetailsById |
| PUT | `/backend/api/edit-interviewee-details/:id` | Any staff | Tech.editInterviewDetails |
| DELETE | `/backend/api/delete-interviewee-details/:id` | Any staff | Tech.deleteInterviewDetails |
| GET | `/backend/api/get-question-details/:id/:interview_type/:roll_no` | Student (own) / staff (own college) / kiosk attempt token | Tech.getQuestionDetails |
| POST | `/backend/api/add-company-interview` | Any staff | Company.addInterviewDetails |
| POST | `/backend/api/bulk-add-company-interviews` | Any staff, file upload | Company.bulkAddInterviewDetails |
| GET | `/backend/api/get-company-interviews/:id` | Any staff, college-scoped | Company.getAllInterviewDetails |
| GET | `/backend/api/get-company-interview-by-id/:id` | Any staff | Company.getInterviewDetailsById |
| PUT | `/backend/api/update-company-interview/:id` | Any staff | Company.updateCompanyInterview |
| DELETE | `/backend/api/delete-company-interviewee-details/:id` | Any staff | Company.deleteCompanyInterviewDetails |
| POST | `/backend/api/available-company-questions` | Any staff | Company.availableCompanyQuestions |
| POST | `/backend/api/add-coding-interview` | Any staff | Coding.addInterviewDetails |
| POST | `/backend/api/add-bulk-coding-interview` | Any staff, file upload | Coding.addBulkInterviewDetails |
| GET | `/backend/api/get-all-coding-interview-details/:id` | Any staff, college-scoped | Coding.getAllCodingInterviewDetails |
| GET | `/backend/api/get-coding-interview-details-by-id/:id` | Any staff | Coding.getInterviewDetailsById |
| PUT | `/backend/api/update-coding-interview/:id` | Any staff | Coding.updateInterviewDetails |
| DELETE | `/backend/api/delete-coding-interview/:id` | Any staff | Coding.deleteCodingInterviewDetails |
| GET | `/backend/api/get-coding-report-details/:id/:interview_type/:roll_no` | Student (own) / staff (own college) / kiosk attempt token | Coding.getCodingReportDetails |

### practice routes

| Method | Path | Access | Handler |
|---|---|---|---|
| GET | `/backend/api/get-all-lite-interview-details/:roll_no` | Student | Lite.getAllLiteInterviewDetails |
| POST | `/backend/api/get-lite-interview-accuracy` | Student, rate-limited | Lite.getLiteInterviewAccuracy |
| GET | `/backend/api/get-technologies-with-questions` | Student | Lite.getTechnologiesWithQuestions |
| POST | `/backend/api/questions-by-technology` | Student | Lite.questionsByTechnology |
| POST | `/backend/api/add-favorite` | Student | Lite.addFaviorite |
| POST | `/backend/api/remove-favorite` | Student | Lite.removeFavorite |
| POST | `/backend/api/get-favorite-questions` | Student | Lite.getFavoriteQuestions |
| POST | `/backend/api/add-doubt` | Student | Lite.addDoubt |
| POST | `/backend/api/remove-doubt` | Student | Lite.removeDoubt |
| POST | `/backend/api/get-doubts` | Student | Lite.getDoubtsByTechnology |
| POST | `/backend/api/get-star-quesitons` | Student | Lite.getStarQuestions |

### session routes

| Method | Path | Access | Handler |
|---|---|---|---|
| POST | `/backend/api/interview-session/start` | Student, rate-limited | Session.start |
| POST | `/backend/api/interview-session/answer` | Attempt token (X-Attempt-Token header) | Session.answer |
| POST | `/backend/api/interview-session/analyze-idea` | Attempt token (X-Attempt-Token header), rate-limited | Session.analyzeIdea |
| POST | `/backend/api/interview-session/submit` | Attempt token (X-Attempt-Token header) | Session.submit |
| GET | `/backend/api/interview-session/status` | Attempt token (X-Attempt-Token header) | Session.status |
| POST | `/backend/api/interview-session/retry-evaluation` | Any staff | Session.retryEvaluation |
| GET | `/backend/api/system-status` | Any staff | async (req, res, next) => {
  try {
    const aiStatus = require("../services/aiStatus" |
| POST | `/backend/api/kiosk/register` | rate-limited | Kiosk.register |
| GET | `/backend/api/kiosk/me` | Registered kiosk | Kiosk.me |
| POST | `/backend/api/kiosk/unregister` | Registered kiosk | Kiosk.unregister |
| POST | `/backend/api/kiosk/interview` | Registered kiosk | Kiosk.lookup |
| POST | `/backend/api/kiosk/start` | Registered kiosk, rate-limited | Kiosk.start |
| GET | `/backend/api/kiosk/devices` | Platform admin, College admin | Kiosk.listDevices |
| PUT | `/backend/api/kiosk/devices/:id/revoke` | Platform admin, College admin | Kiosk.revokeDevice |

### tenant routes

| Method | Path | Access | Handler |
|---|---|---|---|
| GET | `/backend/api/get-tenants` | Platform admin | Tenant.getTenants |
| POST | `/backend/api/add-tenant` | Platform admin | Tenant.addTenant |
| GET | `/backend/api/get-tenant/:id` | Platform admin, College admin (own college) | Tenant.getTenantById |
| PUT | `/backend/api/update-tenant/:id` | Platform admin | Tenant.updateTenant |
| DELETE | `/backend/api/delete-tenant/:id` | Platform admin | Tenant.deleteTenant |
| POST | `/backend/api/tenants/:id/credits` | Platform admin | Credit.addCredits |
| GET | `/backend/api/tenants/:id/credit-transactions` | Platform admin, College admin (own college) | Credit.listTransactions |

### user routes

| Method | Path | Access | Handler |
|---|---|---|---|
| POST | `/backend/api/login` | rate-limited | Auth.login |
| POST | `/backend/api/admin-login` | rate-limited | Auth.adminLogin |
| POST | `/backend/api/logout` | Own session cookie (public) | Auth.logout |
| GET | `/backend/api/logout/:roll_no/:slug` | Own session cookie (public) | Auth.logout |
| POST | `/backend/api/send-otp` | rate-limited | Auth.sendOtp |
| POST | `/backend/api/check-otp` | rate-limited | Auth.checkOtp |
| POST | `/backend/api/reset-password` | rate-limited | Auth.resetPassword |
| GET | `/backend/api/get-currentUser` | Student | Auth.getCurrentUser |
| GET | `/backend/api/get-admin-current-user` | Any staff | Auth.getAdminCurrentUser |
| POST | `/backend/api/add-user` | Platform admin, College admin, file upload | User.addUser |
| POST | `/backend/api/upload-profile-pics` | Platform admin, College admin, file upload | User.uploadProfilePics |
| GET | `/backend/api/get-users/:id` | Platform admin, College admin | User.getUsers |
| GET | `/backend/api/get-students/:id` | Any staff | User.getStudents |
| GET | `/backend/api/get-user-by-id/:id` | Platform admin, College admin | User.getUserById |
| PUT | `/backend/api/update-user/:id` | Platform admin, College admin | User.updateUser |
| DELETE | `/backend/api/delete-user/:id` | Platform admin, College admin | User.deleteUser |
| GET | `/backend/api/get-assigned-interviews/:id` | Student | User.getAssignedInterviews |
| GET | `/backend/api/get-past-interviews/:id` | Student | User.getTraineePastInterviews |
| POST | `/backend/api/get-interview-details-by-id` | Student | User.getInterviewDetailsById |
| GET | `/backend/api/attempted-interviews-count/:id` | Student | User.attemptedInterviewsCount |
| GET | `/backend/api/platform-interviews-count/:id` | Student | User.platformInterviewsCount |
| GET | `/backend/api/overall-accuracy/:id` | Student | User.overallAccuracy |

---

## 10. Data model (collections and fields)

MongoDB collections (Mongoose models). Timestamps (`createdAt`, `updatedAt`) exist where noted by the schema.

#### `users` (model user)
- `first_name` String
- `roll_no` String (indexed)
- `mobile` Number
- `password` String (never returned by default)
- `email` String (unique)
- `gender` String
- `loginStatus` String
- `college` String (indexed)
- `branch` String (indexed)
- `passout_year` Number (indexed)
- `role` String
- `profile_pic` String
- `status` Number (default 1)
- `tenant_id` ObjectId (indexed, → tenant)
- `session_sid` String (never returned by default)
- `session_expires_at` Date (never returned by default)
- `admin_session_sid` String (never returned by default)
- `sessionToken` String (never returned by default)
- `otp` Number (never returned by default)
- `otp_hash` String (never returned by default)
- `otp_expires_at` Date (never returned by default)
- `otp_attempts` Number (never returned by default, default 0)
- `otp_last_sent_at` Date (never returned by default)
- `otp_window_start` Date (never returned by default)
- `otp_window_count` Number (never returned by default)
- `login_failures` Number (never returned by default, default 0)
- `lock_until` Date (never returned by default)
- `created_at` Date
- `updated_at` Date
- Indexes: {"roll_no":1}; {"email":1} unique; {"college":1}; {"branch":1}; {"passout_year":1}; {"tenant_id":1}

#### `tenants` (model tenant)
- `organization_name` String
- `contact_person` String
- `email` String (indexed)
- `active_credits` Number
- `assigned_credits` Array<Mixed>
- `status` Number (default 1)
- `interview_duration_minutes` Number (default 30)
- `organization_code` String (unique)
- `createdAt` Date
- `updatedAt` Date
- Indexes: {"email":1}; {"organization_code":1} unique

#### `kioskdevices` (model kioskDevice)
- `tenant_id` ObjectId (required, indexed, → tenant)
- `name` String (required)
- `status` String (one of: active | revoked, default "active")
- `registered_by` ObjectId (→ user)
- `revoked_by` ObjectId (→ user)
- `revoked_at` Date
- `last_seen_at` Date
- `createdAt` Date
- `updatedAt` Date
- Indexes: {"tenant_id":1}

#### `interviews` (model interview)
- `platform` String (required)
- `roll_no` String (required)
- `technology` ObjectId (→ technology)
- `module` Array<ObjectId> (→ module)
- `topic` Array<ObjectId> (→ topic)
- `start_date_time` Date (required)
- `level` String (required)
- `questions_count` String
- `question_details` Array<Mixed>
- `overall_analysis` Array<Mixed>
- `emotions.seen_left` String
- `emotions.seen_right` String
- `emotions.seen_center` String
- `emotions.blinks` String
- `emotions.time_straight` String
- `emotions.time_left` String
- `emotions.time_right` String
- `emotions.emotions.angry` Number
- `emotions.emotions.disgust` Number
- `emotions.emotions.fear` Number
- `emotions.emotions.happy` Number
- `emotions.emotions.sad` Number
- `emotions.emotions.surprise` Number
- `emotions.emotions.neutral` Number
- `created_by` String
- `status` Number
- `createdAt` Date
- `updatedAt` Date
- `tenant_id` ObjectId (→ tenant)
- `user_id` ObjectId (→ user)
- `attempt.started_at` Date
- `attempt.deadline_at` Date
- `attempt.token_hash` String (never returned by default)
- `attempt.device_id` ObjectId (→ kioskDevice)
- `attempt.platform` String
- `attempt.resumes` Number (default 0)
- `attempt.generation_failed_at` Date
- `issued_questions` Array<Mixed>
- `answers` Array<Mixed>
- `idea_checks` Array<Mixed>
- `submitted_at` Date
- `evaluation_status` String (one of: pending | processing | completed | failed, default null)
- `evaluation_lease_until` Date
- `evaluation_lease_id` String
- `evaluation_waiting_for_ai` Boolean (default false)
- `evaluation_mode` String (one of: ai | provisional, default null)
- `ai_rescore_pending` Boolean (default false)
- `rescore_next_at` Date
- `evaluation_outage_retries` Number (default 0)
- `evaluation_attempts` Number (default 0)
- `evaluation_error` String
- `evaluated_at` Date
- `credit_refunded` Boolean (default false)
- Indexes: {"roll_no":1,"start_date_time":-1}; {"tenant_id":1,"start_date_time":-1}; {"evaluation_status":1,"evaluation_lease_until":1}; {"status":1,"start_date_time":-1}

#### `codinginterviews` (model codingInterview)
- `platform` String (required)
- `roll_no` String (required)
- `start_date_time` Date (required)
- `level` String (required)
- `questions_count` String
- `question_details` Array<Mixed>
- `overall_analysis` Array<Mixed>
- `emotions.seen_left` String
- `emotions.seen_right` String
- `emotions.seen_center` String
- `emotions.blinks` String
- `emotions.time_straight` String
- `emotions.time_left` String
- `emotions.time_right` String
- `emotions.emotions.angry` Number
- `emotions.emotions.disgust` Number
- `emotions.emotions.fear` Number
- `emotions.emotions.happy` Number
- `emotions.emotions.sad` Number
- `emotions.emotions.surprise` Number
- `emotions.emotions.neutral` Number
- `created_by` String
- `status` Number
- `createdAt` Date
- `updatedAt` Date
- `tenant_id` ObjectId (→ tenant)
- `user_id` ObjectId (→ user)
- `attempt.started_at` Date
- `attempt.deadline_at` Date
- `attempt.token_hash` String (never returned by default)
- `attempt.device_id` ObjectId (→ kioskDevice)
- `attempt.platform` String
- `attempt.resumes` Number (default 0)
- `attempt.generation_failed_at` Date
- `issued_questions` Array<Mixed>
- `answers` Array<Mixed>
- `idea_checks` Array<Mixed>
- `submitted_at` Date
- `evaluation_status` String (one of: pending | processing | completed | failed, default null)
- `evaluation_lease_until` Date
- `evaluation_lease_id` String
- `evaluation_waiting_for_ai` Boolean (default false)
- `evaluation_mode` String (one of: ai | provisional, default null)
- `ai_rescore_pending` Boolean (default false)
- `rescore_next_at` Date
- `evaluation_outage_retries` Number (default 0)
- `evaluation_attempts` Number (default 0)
- `evaluation_error` String
- `evaluated_at` Date
- `credit_refunded` Boolean (default false)
- Indexes: {"roll_no":1,"start_date_time":-1}; {"tenant_id":1,"start_date_time":-1}; {"evaluation_status":1,"evaluation_lease_until":1}; {"status":1,"start_date_time":-1}

#### `companyinterviews` (model companyinterview)
- `platform` String (required)
- `company` Array<ObjectId>
- `roll_no` String (required)
- `tag` ObjectId
- `type` Array<String>
- `round` Array<String>
- `start_date_time` Date (required)
- `questions_count` String
- `question_details` Array<Mixed>
- `overall_analysis` Array<Mixed>
- `emotions.seen_left` String
- `emotions.seen_right` String
- `emotions.seen_center` String
- `emotions.blinks` String
- `emotions.time_straight` String
- `emotions.time_left` String
- `emotions.time_right` String
- `emotions.emotions.angry` Number
- `emotions.emotions.disgust` Number
- `emotions.emotions.fear` Number
- `emotions.emotions.happy` Number
- `emotions.emotions.sad` Number
- `emotions.emotions.surprise` Number
- `emotions.emotions.neutral` Number
- `created_by` String
- `status` Number
- `createdAt` Date
- `updatedAt` Date
- `tenant_id` ObjectId (→ tenant)
- `user_id` ObjectId (→ user)
- `attempt.started_at` Date
- `attempt.deadline_at` Date
- `attempt.token_hash` String (never returned by default)
- `attempt.device_id` ObjectId (→ kioskDevice)
- `attempt.platform` String
- `attempt.resumes` Number (default 0)
- `attempt.generation_failed_at` Date
- `issued_questions` Array<Mixed>
- `answers` Array<Mixed>
- `idea_checks` Array<Mixed>
- `submitted_at` Date
- `evaluation_status` String (one of: pending | processing | completed | failed, default null)
- `evaluation_lease_until` Date
- `evaluation_lease_id` String
- `evaluation_waiting_for_ai` Boolean (default false)
- `evaluation_mode` String (one of: ai | provisional, default null)
- `ai_rescore_pending` Boolean (default false)
- `rescore_next_at` Date
- `evaluation_outage_retries` Number (default 0)
- `evaluation_attempts` Number (default 0)
- `evaluation_error` String
- `evaluated_at` Date
- `credit_refunded` Boolean (default false)
- Indexes: {"company":1}; {"roll_no":1,"start_date_time":-1}; {"tenant_id":1,"start_date_time":-1}; {"evaluation_status":1,"evaluation_lease_until":1}; {"status":1,"start_date_time":-1}

#### `technologies` (model Technology)
- `technology_name` String
- `technology_category` String (required)
- `technology_icon` String
- `added_by` String
- `status` Number (default 1)
- `createdAt` Date
- `updatedAt` Date

#### `modules` (model Module)
- `technology` ObjectId (indexed, → technology)
- `module_name` String
- `module_icon` String
- `added_by` String
- `status` Number (default 1)
- `createdAt` Date
- `updatedAt` Date
- Indexes: {"technology":1}

#### `topics` (model Topic)
- `technology` ObjectId (indexed, → technology)
- `module` ObjectId (indexed, → module)
- `topic_name` String
- `added_by` String
- `status` Number (default 1)
- `createdAt` Date
- `updatedAt` Date
- Indexes: {"technology":1}; {"module":1}

#### `companies` (model Company)
- `company_name` String (required)
- `added_date` String (required)
- `update_date` String
- `added_by` String (required)
- `status` Number (required)

#### `credittransactions` (model creditTransaction)
- `tenant_id` ObjectId (required, → tenant)
- `type` String (required, one of: opening_balance | topup | adjust | consume | refund)
- `amount` Number (required)
- `balance_after` Number (required)
- `reason` String
- `interview_id` ObjectId
- `interview_type` String (one of: ai generated | company | coding)
- `roll_no` String
- `actor_id` ObjectId (→ user)
- `createdAt` Date
- Indexes: {"tenant_id":1,"createdAt":-1}; {"interview_id":1,"type":1} unique; {"tenant_id":1,"type":1} unique

#### `companyquestions` (model CompanyQuestion)
- `company` ObjectId (indexed, → company)
- `type` String
- `round` String
- `year` String
- `tag` ObjectId (→ tag)
- `question` String
- `added_by` String
- `status` Number (default 1)
- `createdAt` Date
- `updatedAt` Date
- Indexes: {"company":1}

#### `codingquestions` (model CodingQuestion)
- `company` ObjectId (indexed, → company)
- `problem_name` String
- `complexity` String
- `time` Number
- `description` String
- `input` String
- `output` String
- `constraints` String
- `added_by` String
- `status` Number (default 1)
- `createdAt` Date
- `updatedAt` Date
- Indexes: {"company":1}

#### `liteinterviewquestions` (model liteinterviewquestions)
- `technology` ObjectId (→ technology)
- `question` String
- `answer` String
- `company` Array<ObjectId>
- `previous_asked_status` Number
- `created_by` String
- `status` Number
- `createdAt` Date
- `updatedAt` Date

#### `tags` (model Tag)
- `tag_name` String (required)
- `createdAt` String (required)
- `updatedAt` String
- `added_by` String (required)
- `status` Number (required)

#### `liteinterviews` (model liteinterview)
- `roll_no` String (required)
- `technology` ObjectId (→ technology)
- `module` Array<ObjectId> (→ module)
- `topic` Array<ObjectId> (→ topic)
- `level` String (required)
- `questions_count` String
- `question_details` Array<Mixed>
- `overall_analysis` Array<Mixed>
- `created_by` String
- `status` Number
- `createdAt` Date
- `updatedAt` Date

#### `interviewquestioninteractions` (model interviewquestioninteractions)
- `roll_no` String (required)
- `technology` ObjectId (→ technology)
- `question_id` ObjectId (→ liteInterviewQuestion)
- `favorite` Number
- `doubt` Number
- `status` Number
- `createdAt` Date
- `updatedAt` Date


---

## 11. Business rules, limits and configuration

| Rule | Value | Where |
|---|---|---|
| Credit per scheduled interview | 1 (atomic, ledgered) | services/credits.js |
| Refund | Only if deleted before the attempt started; once per interview | services/scheduling.js |
| Start window | From 1 min before (`INTERVIEW_EARLY_START_MINUTES`) to 5 min after (`INTERVIEW_START_GRACE_MINUTES`) the start time | env / interviewSession |
| Retry window after failed question preparation | 15 min | interviewSession |
| Overall attempt time | max(college interview duration (default 30), 90 s × questions + 5 min, or the sum of the coding problems' minutes + 5) | interviewSession |
| Answer accepted after deadline | +30 s; auto-submit at deadline + 10 min (`INTERVIEW_SUBMIT_GRACE_MINUTES`) | interviewSession / queue |
| Voice question | 5 s countdown, then 60 s to answer; autosave every 15 s | frontend VoiceInterview |
| Idea check | ≥ 50% to proceed, max 5 per problem; skipped during an AI outage | backend + CodingInterview |
| Overlap rule | No two pending interviews for one student within ± the college's duration | scheduling |
| Questions per interview | Technology/company 1–30 (admin UI limits technology to 10); coding 1–10 | scheduling |
| Bulk scheduling | ≤ 2,000 rows per file | scheduling |
| User import | ≤ 5,000 rows; password ≥ 8; unique roll & email | UserController |
| Profile photo zip | ≤ 50 MB upload, ≤ 300 MB unpacked, ≤ 5,000 entries, ≤ 5 MB per image, PNG/JPEG only | UserController |
| Login lockout | 10 failures → 15 min lock | AuthController |
| OTP | 6 digits, 10 min, 5 attempts, ≥ 60 s between sends, ≤ 5 per hour | AuthController |
| Sessions | Student/staff 24 h (`SESSION_HOURS`); kiosk 365 days (`KIOSK_SESSION_DAYS`); one student session at a time | auth |
| Evaluation | 3 attempts for data errors; outage backoff 2, 5, 10, 20, 30 min up to 72 h; lease 5 min with 60 s heartbeat; concurrency 3; 4 parallel AI calls per interview | evaluationQueue |
| Provisional re-score | Every sweep when the AI is available; retry every 30 min | evaluationQueue |
| Practice scoring | ≤ 20 per student per day, ≤ 10 questions per call | LiteInterviewController |
| Kiosk report access | Attempt token, up to 2 h after submit | middlewares/auth |
| Time zone | All "day" logic uses Asia/Kolkata (IST) calendar days | lib/time.js |

**Backend environment variables** (`backend/.env`; `.env.development.local` overrides locally):

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | Database (replica set for transactions) |
| `JWT_SECRET` | Signs session tokens and the OTP HMAC (≥ 32 random characters recommended) |
| `AI_PROVIDER`, `AI_FALLBACK_PROVIDER` | `openai` or `ollama`; the fallback (or `none`) is used while the primary is unavailable |
| `OPENAI_API_KEY`, `OPENAI_BASE_URL` | OpenAI key (needs the `model.request` permission); optional OpenAI-compatible endpoint |
| `DGX_BASE_URL`, `DGX_API_KEY`, `DGX_PROTOCOL`, `DGX_*_MODEL`, `DGX_<TASK>_URL/_API_KEY/_PROTOCOL`, `DGX_MAX_CONCURRENCY`, `DGX_NUM_CTX`, `DGX_KEEP_ALIVE`, `DGX_THINK`, `DGX_REASONING_TOKENS`, `DGX_PRELOAD`, `DGX_TIMEOUT_MS`, `DGX_ALLOW_INSECURE` | DGX Spark models (see DEPLOYMENT.md) |
| `DGX_VISION_URL`, `DGX_VISION_API_KEY`, `DGX_VISION_INTERVAL_MS`, `DGX_VISION_TIMEOUT_MS` | Camera model on the DGX Spark (empty = browser model) |
| `HOST` | Listen interface (`127.0.0.1` behind a local nginx) |
| `OPENAI_SCORING_MODEL`, `OPENAI_GENERATION_MODEL`, `OPENAI_SUMMARY_MODEL`, `OPENAI_CODING_MODEL` | Model overrides |
| `EMAIL_USER`, `EMAIL_PASS` | SMTP (Gmail app password) |
| `PORT`, `NODE_ENV` | Server port; `production` enables Secure cookies and hides error details |
| `CORS_ORIGINS` | Allowed browser origins |
| `COOKIE_SECURE`, `TRUST_PROXY` | Cookie and proxy settings |
| `PUBLIC_BACKEND_URL` | Base URL for technology icon links |
| `SESSION_HOURS`, `KIOSK_SESSION_DAYS` | Session lifetimes |
| `INTERVIEW_START_GRACE_MINUTES`, `INTERVIEW_EARLY_START_MINUTES`, `INTERVIEW_SUBMIT_GRACE_MINUTES` | Interview timing |
| `EVALUATION_CONCURRENCY`, `LLM_PARALLEL_CALLS` | Throughput |

**Front-end variables** (optional; the default is same-origin `/backend`):
- `VITE_API_URL`, `VITE_BACKEND_URL` (both apps)
- `VITE_STUDENT_APP_URL` (admin: where report links point)
- `MPOD_BACKEND_URL` (dev proxy target)

---

## 12. Non-functional design

| Area | Current design |
|---|---|
| **Security** | Deny-by-default RBAC; college isolation on every query; httpOnly SameSite=Strict cookies; server-side session revocation; bcrypt passwords; HMAC'd OTPs with atomic attempt limits; atomic login lockout; rate limits; helmet; CORS allow-list; upload type and size limits with temp-file cleanup; zip-bomb protection; HTML sanitised with DOMPurify; ids cast against operator injection; AI prompt-injection fencing; secrets only in env files (git-ignored); no tokens in localStorage. |
| **Data integrity** | MongoDB transactions for credits + interview creation; unique ledger indexes; atomic claims for starting attempts, idea checks and evaluation leases; idempotent submit; final answers protected from late autosaves. |
| **Reliability** | In-process queue with leases, heartbeat and a sweeper (survives restarts); AI-outage fallbacks (bank/template questions, provisional scores, skipped idea check); retry with backoff; DB connection retry at startup; graceful shutdown. |
| **Performance** | Indexes on interviews (roll+time, tenant+time, status, evaluation state), the ledger and users; parallel AI calls; lazy-loaded front-end routes; face-api loaded on demand. |
| **Observability** | Console logs (startup, AI status, evaluation lifecycle, errors), `/health`, the `/system-status` AI banner. No metrics, tracing or alerting yet. |
| **Testing** | 191 backend tests (Jest + Supertest + in-memory replica set) cover access control for every route, college isolation, auth/OTP/lockout, credits under concurrency, scheduling rules, the session engine, kiosk, outage handling and provisional scoring. Browser smoke tests were run manually with Playwright; front-end unit tests don't exist yet. |
| **Accessibility & UX** | Labelled form fields, keyboard focus styles, typed fallback for voice, responsive layouts on the interview screens. The legacy report pages and template styles are only partly responsive. |
| **Scalability** | Single API process; in-memory rate limits and queue (a shared store like Redis is needed to run several instances); files on local disk (object storage needed for multiple servers). |

---

## 13. Known limitations and enhancement opportunities

These are factual gaps in the current implementation, useful as input for an enhancement roadmap.

**Product / features**
- No student UI for the **practice bank** (favourites, doubts, practice scoring); the backend exists.
- No **HR/behavioural** interview type, no adaptive follow-up questions, no interview templates or recurring schedules.
- Coding answers are **not executed** against test cases; correctness is judged by the AI only. There is no code editor (plain text area) and no language selection.
- No notifications beyond the schedule email (no reminders, results-ready or WhatsApp/SMS); no in-app notifications.
- Reports: no progress-over-time view, no topic-level weakness analysis, no shareable or verified report links, no cohort comparison.
- Analytics: counts only. There are no cohort, branch or batch readiness views, funnels, exports of results, scheduled digests, or trainer-level analytics.
- No batches/groups to schedule a whole class; bulk scheduling is by uploading roll numbers.
- No audit log UI (the ledger covers credits only); no admin activity history.
- Kiosk identifies students by roll number only (no PIN, OTP or face match), and there is no device health dashboard.
- Emotion and attention data is collected only for coding interviews and isn't used in scoring.
- No billing, invoices or self-service credit purchase; no subscription plans.
- No SSO (Google/Microsoft), MFA for admins, or SCIM provisioning.
- Single language (English) for the UI and interviews.

**Technical**
- Monolithic API process: the queue and rate limits are in memory, and files live on local disk.
- Interview data is split across three collections with similar schemas; a single interview collection with a type field would simplify the code.
- Users are keyed by `roll_no` (unique only by convention across colleges); profile photos are stored by roll number globally.
- Legacy admin pages use older libraries (reactstrap 9, mdbreact, availity validation, react-bootstrap-table); the report pages are large legacy components.
- OpenAI defaults are older models (configurable). Self-hosted models on the DGX Spark are supported, and `ai:calibrate` compares providers on a small built-in answer set. There's still no structured rubric per question, no large calibration set and no per-question reference answers except bank questions.
- No API documentation (OpenAPI), no metrics, tracing or alerting, no CI pipeline, no front-end tests.
- GDPR/DPDP features are missing: consent capture for camera/voice, data retention policies, data export/delete requests.
- Admin UI inconsistencies (question-count limits, edit pages without student search, the Company Interviews list not showing the Provisional badge, hidden delete buttons) are listed in section 8.6.
