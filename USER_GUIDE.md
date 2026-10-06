# mPod user guide

This guide explains how to use mPod: who does what, and every screen in the admin portal, the student website and the campus kiosk. To install and run the apps, see [README.md](README.md).

**Contents**

1. [How mPod works](#1-how-mpod-works)
2. [Roles and what each can do](#2-roles-and-what-each-can-do)
3. [First-time setup of a new college (platform admin)](#3-first-time-setup-of-a-new-college-platform-admin)
4. [Building the content (platform admin)](#4-building-the-content-platform-admin)
5. [Running a college (college admin, trainer, placement admin)](#5-running-a-college)
6. [Students: taking interviews on the website](#6-students-taking-interviews-on-the-website)
7. [The mPod kiosk](#7-the-mpod-kiosk)
8. [Reports](#8-reports)
9. [Credits](#9-credits)
10. [Accounts, passwords and sessions](#10-accounts-passwords-and-sessions)
11. [Rules the system enforces](#11-rules-the-system-enforces)
12. [Common questions](#12-common-questions)

---

## 1. How mPod works

```
Platform admin                 College staff                  Student
──────────────                 ─────────────                  ───────
Create college (tenant)  ──►   Import students
Give it credits                Schedule interviews  ──────►   Gets an email
Build syllabus & questions     (1 credit each)                Takes the interview
                               Register campus kiosks         (website or kiosk)
                                                               │
                               See dashboards & reports ◄──── AI scores answers
```

There are three interview types:

| Type | What the student does | Where questions come from |
|---|---|---|
| **Technology** (shown as "ai generated") | Hears each question read aloud and answers by voice (or types) | The AI writes fresh questions from the chosen technology → modules → topics |
| **Company** | The same voice format | Picked from the company question bank (company, round, type, tag) |
| **Coding** | For each problem: explains an approach (idea), writes the code, then optimises it | Picked from the coding problem bank by difficulty |

Each interview is set to **web** (taken on the student website) or **mpod** (taken at a registered campus kiosk).

---

## 2. Roles and what each can do

| Role | Where they sign in | Can do |
|---|---|---|
| **Super admin / Admin** (platform, e.g. Technical Hub) | Admin portal | Everything, for all colleges: colleges, credits, syllabus, question banks, users, interviews, kiosks, platform dashboard |
| **College admin** (`tenantadmin`) | Admin portal | Their own college only: dashboard, students, interviews, kiosks, credit history (read-only) |
| **Placement admin / Trainer** | Admin portal | Their own college only: dashboard, schedule and manage interviews |
| **Student** | Student website or kiosk | Their own dashboard, interviews and reports |

The server enforces these rules. Hiding a menu item is only cosmetic: even typing a page's address won't give access to another college's data.

---

## 3. First-time setup of a new college (platform admin)

Sign in at **Admin portal → /admin/login** with a platform admin account.

### 3.1 Create the college
1. **Tenants → Add Tenant**.
2. Fill in:
   - **Organization name**, **Organization code** (short and unique, e.g. `AEC`), contact person and email
   - **Initial credits**: how many interviews the college can schedule
   - **Interview duration (minutes)**: the time per interview, also used to stop two interviews overlapping for one student
3. Save. The initial credits are recorded in the college's credit history.

### 3.2 Create the college's admin
1. **Users → Add Users** and choose the college.
2. Upload an Excel file with one row: `role` = `tenantadmin`, plus a user id (`roll_no`), name, email and an initial password of at least 8 characters.
3. Give the college admin their user id and password. They can change the password later with **Forgot password**.

### 3.3 Add credits later
**Tenants List → Credits** on the college's row → **Add credits**. Choose **Top-up** (positive) or **Adjust** (a correction, can be negative), and enter the amount and a **reason** (required, e.g. "Invoice 2026-14"). Every change is logged with who made it.

---

## 4. Building the content (platform admin)

The content is shared by all colleges.

### 4.1 Syllabus for technology interviews
Technology → Module → Topic. For example: Java → OOP → Inheritance.

1. **Technologies → Add**: give a name and a category. You can upload an icon later via Edit.
2. **Modules → Add**: choose the technology and a module name, and optionally an icon.
3. **Topics → Add**: choose the technology and module, then upload an Excel file with **one topic per row in the first column**.

You can't delete a technology that still has modules, or a module that still has topics; delete the children first.

### 4.2 Companies and tags
- **Companies → Add**: e.g. "TCS".
- **Tags → Add**: labels that group questions, e.g. "Freshers 2026".

### 4.3 Company question bank
**Questions → Company Questions → Add**:
1. Choose the company, type (e.g. Technical, HR), round (e.g. TR1, HR1), year and tag.
2. Upload an Excel file with **one question per row in the first column**.

When a company interview starts, mPod randomly picks the requested number of questions that match its company, round, type and tag. Before scheduling, the scheduling screen shows how many questions are available.

### 4.4 Coding problem bank
**Questions → Coding Questions → Add**: problem name, difficulty (easy / medium / hard), time in minutes, description (rich text, images allowed), input, output and constraints.

### 4.5 Practice question bank (Interview Questions)
**Questions → Interview Questions → Add**: choose a technology (and optionally companies) and upload an Excel file with the columns `question`, `answer` and optionally `star_status` (1 means "previously asked in interviews").

---

## 5. Running a college

Sign in to the Admin portal with your college account. The menu shows only what your role allows.

### 5.1 Dashboard
Shows your college's students (male/female), assigned versus attempted interviews by type, kiosk versus website usage, question bank sizes, and yesterday's activity. Platform admins see the platform-wide dashboard instead.

### 5.2 Import students (college admin)
1. **Users → Add Users**. Click **Download sample** to get the exact columns:

   | Column | Required | Notes |
   |---|---|---|
   | `roll_no` | yes | The student's login id. Must be unique across mPod. |
   | `email` | yes | Unique; used for OTPs and schedule emails |
   | `password` | yes | Initial password, at least 8 characters. It is stored encrypted. |
   | `first_name`, `mobile`, `gender`, `college`, `branch`, `passout_year` | no | `gender`: male or female |
   | `role` | no | Leave empty for students |

2. Upload the file. The result lists how many were added, which roll numbers already exist, and every **rejected row with the reason**, such as a bad email, a short password or a duplicate.
3. **Users List**: search, edit details, reset a password (Edit → new password), or **Deactivate** a student. Deactivating blocks login and keeps their history.
4. **Update Profile pics**: upload a **zip** of photos named by roll number (e.g. `21A91A0501.png`). Photos appear on the student dashboard, the kiosk and reports.

### 5.3 Schedule interviews (college admin, trainer, placement admin)
Go to **Interviews**, then the list for the interview type, then **Add**:

| Type | You choose |
|---|---|
| Technology | Technology, modules, topics, level, number of questions |
| Company | Companies, type (Service Based / Product Based), rounds, tag (optional), number of questions. **Available Questions** shows how many bank questions match; it must be at least the number you ask for. |
| Coding | Level and number of problems |

For every type, you also choose:
- **Platform**: **web** (student website) or **mpod** (campus kiosk)
- **Single**: pick the student from the dropdown, which lists your college's active students (type a roll number or name to search). **Bulk**: upload an Excel file with a `roll_no` column; **Download sample** gives the template.
- **Start date & time**: pick a day in the calendar, then set the hour, minutes and AM/PM. Past days can't be selected. Times are in your local time (IST).

What happens when you schedule:
- **One credit** is used per interview. If the college runs out, scheduling stops and the remaining rows report "Your credits are not enough".
- The student must belong to your college.
- The same student can't have two interviews overlapping within the college's interview duration.
- Bulk upload shows per-row results: scheduled, already scheduled, not found or out of credits.
- The student gets an email with the date and time.

### 5.4 Interview lists
Each list shows one day at a time (pick the date) with status:

| Status | Meaning |
|---|---|
| **Upcoming** | It hasn't started yet. Edit and Delete are available. |
| **Attempted** | The student finished. Click to open the report. |
| **Expired** | The student didn't start within the allowed window. |

You can export the list to Excel, filter by technology and search by name or roll number.

- **Edit** works only before the student starts.
- **Delete** refunds the credit **only if the student never started**. The message tells you whether it was refunded.

### 5.5 Kiosk devices (college admin)
- Kiosks register themselves (see [section 7](#7-the-mpod-kiosk)).
- **Kiosk Devices** lists your college's kiosks, with name, who registered it, and when it was last seen.
- **Revoke** a lost, moved or retired kiosk. It stops working immediately.

### 5.6 Credit history (college admin)
**Credits → Credit History** shows your balance and every change: top-ups by the platform, one row per scheduled interview, and refunds.

---

## 6. Students: taking interviews on the website

1. Open the student website and sign in with your roll number and password.
   - If you are already signed in somewhere else, you'll be asked whether to sign out there and continue here.
2. The **dashboard** shows your profile, your overall accuracy by interview type, your counts, **Upcoming interviews** and **My Interviews** (past).
3. For a **web** interview, the **Attempt** button appears at the start time and stays for **5 minutes**.
   - Before that you see a countdown.
   - If you closed the page mid-interview, the button says **Resume**.
   - Kiosk interviews show "Take this at the mPod kiosk".
4. **Instructions**: read them. The interview starts after 15 seconds, or click **Start now**.

### Technology and company interviews
- Each question is **read aloud**. After a 5-second countdown, answer **by speaking** while your words appear on screen.
- You have **60 seconds** per question. Click **Next question** to move on early.
- No microphone, or a browser without voice support? Click **Type instead** and type your answer. Voice needs **Google Chrome**.
- Your answer is saved when you move on, and every 15 seconds while you answer.

### Coding interviews
For each problem:
1. **Explain your approach** and click **Check idea**. You need at least 50% to continue, and you get up to 5 checks. If you use them all, you can still write code.
2. **Write your code** and click **Done, optimise**.
3. **Optimise your code** and click **Next problem** (or **Submit interview** on the last one).

Each problem has its own timer, and the camera must stay on. Copy and paste are disabled in the answer boxes.

### After submitting
"Evaluating your answers…" usually takes less than a minute, then your **report** opens. It also stays available under **My Interviews → View**.

If the page closes or the network drops, sign in again and click **Resume** before the time runs out; your saved answers are kept. If the time runs out, whatever you saved is evaluated automatically.

---

## 7. The mPod kiosk

### One-time registration (college admin, on the kiosk)
1. On the kiosk computer, open `<student website>/kiosk-setup`, e.g. `https://mpod.ai/kiosk-setup`.
2. Enter a **kiosk name** (e.g. "CSE Block Lab 2") and sign in with **your college admin account**. Platform admins also enter the college id.
3. The kiosk is now registered to your college, for a year or until revoked. Your password is not stored on the kiosk.

### Students at the kiosk
1. The kiosk shows `<student website>/home-2`, with your college and kiosk name and **ENTER YOUR ROLL NUMBER**.
2. The student enters their roll number. If they have a **kiosk (mpod)** interview starting now, the instructions appear and the interview runs as on the website.
3. After the evaluation, the **report** is shown on the kiosk. **Done – next student** clears it for the next person.

A kiosk only accepts students of its own college, and only for interviews scheduled on the **mpod** platform.

---

## 8. Reports

| Who | How to open it |
|---|---|
| Student | **My Interviews → View** on the dashboard |
| College staff | The interview list → an **Attempted** row |
| Kiosk | Shown automatically after the interview (for 2 hours, then the student uses their account) |

**Technology and company report**
- overall accuracy and confidence
- **strengths** and **areas of improvement**
- for each question: the question, the student's answer, an accuracy score, the analysis, improvement tips and the time taken
- a **PDF download**

**Coding report**
- for each problem: the idea and its score, the code, the optimised code, correctness, time and space complexity, code-quality notes, and optimisation %
- attention data from the camera: looking left, centre or right, and blinks

---

## 9. Credits

- One interview costs **one credit**, charged when it is **scheduled**.
- **Refund**: only when an interview is **deleted before the student started it**, and only once. Interviews that expire or have been attempted are not refunded.
- Only platform admins add or adjust credits, with a required reason. College admins see the full history.
- The balance can never go below zero.

---

## 10. Accounts, passwords and sessions

- **Forgot password** (student site or admin portal): enter your user id. An OTP is emailed to the address on file.
  - The OTP is valid for **10 minutes**, allows **5 attempts**, and you can request at most **5 OTPs per hour**.
  - The new password must be at least **8 characters**. Resetting it signs you out everywhere.
- **Lockout**: **10 wrong passwords** lock the account for **15 minutes**. Use Forgot password to get in sooner.
- **Sessions** last 24 hours. A student can be signed in in only one place at a time; signing in elsewhere asks first.
- **Deactivated** students and colleges can't sign in.

---

## 11. Rules the system enforces

| Rule | Value |
|---|---|
| Start window for an interview | From 1 minute before to **5 minutes after** the scheduled time |
| Time per voice question | 60 seconds |
| Overall interview time | The college's interview duration, or longer if the questions need it |
| Idea checks per coding problem | 5 |
| Overlap between one student's interviews | Not allowed within the college's interview duration |
| Questions per interview | Technology/company: 1–30. Coding: 1–10. |
| Practice scoring per student | 20 evaluations per day |
| Uploads | Spreadsheets up to 5 MB, photo zips up to 50 MB (each photo up to 5 MB, PNG or JPG) |

---

## 12. Common questions

**A student says the Attempt button isn't there.**
Check the interview's platform. **mpod** interviews are taken at the kiosk, not on the website. Also check the time: the button shows only from the start time to 5 minutes after.

**A student's interview shows "Expired".**
They didn't start within 5 minutes of the start time. Schedule a new one. Deleting the expired one does not refund its credit.

**"Could not prepare your questions."**
The AI service didn't answer. The student can click **Try again**, even shortly after the 5-minute window. If it keeps failing, check the backend's OpenAI key.

**The evaluation shows "failed".**
The answers are saved. The system retries automatically, up to 3 times. If it still fails (usually an AI service or key problem), fix the cause, then a staff member can re-queue it with the API call `POST /backend/api/interview-session/retry-evaluation {interview_id, interview_type}`. There is no button for this in the admin portal yet.

**Microphone or camera problems.**
Use Chrome, allow the microphone and camera for the site, and reload. For voice questions, the student can always click **Type instead**.

**A kiosk shows "This kiosk is not registered".**
A college admin must register it at `/kiosk-setup`. If it was revoked, register it again.
