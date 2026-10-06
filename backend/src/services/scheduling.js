const mongoose = require("mongoose");
const xlsx = require("xlsx");
const env = require("../config/env");
const Tenant = require("../models/tenant");
const User = require("../models/user");
const Technology = require("../models/technology");
const Module = require("../models/module");
const Topic = require("../models/topic");
const Company = require("../models/companies");
const credits = require("./credits");
const { sendMailInBackground } = require("./mailer");
const { withTransaction } = require("../lib/db");
const { isStaffRole } = require("../config/roles");
const { normaliseType, modelFor, labelFor, ALL_MODELS, assertInterviewAccess } = require("./interviewModels");
const { resolveTenantScope } = require("../middlewares/auth");
const { HttpError, badRequest, notFound, conflict, parseList, toInt, toDate, toObjectId, isObjectId } = require("../lib/http");

const PLATFORMS = ["web", "mpod"];
const MAX_BULK_ROWS = 2000;

const rollVariants = (r) => {
  const s = String(r || "").trim();
  return [...new Set([s, s.toUpperCase()])].filter(Boolean);
};

async function loadActiveTenant(tenantId) {
  const tenant = await Tenant.findById(tenantId).lean();
  if (!tenant) throw notFound("Tenant not found.");
  if (tenant.status === 0) throw badRequest("This college account is inactive.");
  return tenant;
}

async function findStudentInTenant(rollNo, tenantId) {
  const user = await User.findOne({ roll_no: { $in: rollVariants(rollNo) }, tenant_id: tenantId })
    .select("roll_no first_name email role status tenant_id")
    .lean();
  if (!user) throw badRequest(`Student ${rollNo} is not registered in this college.`);
  if (user.status === 0) throw badRequest(`Student ${rollNo} is deactivated.`);
  if (isStaffRole(user.role)) throw badRequest(`${rollNo} is a staff account, not a student.`);
  return user;
}

async function assertNoOverlap({ rollNo, start, durationMinutes, excludeId }) {
  const windowMs = durationMinutes * 60000;
  const query = {
    roll_no: rollNo,
    status: 1,
    start_date_time: { $gt: new Date(start.getTime() - windowMs), $lt: new Date(start.getTime() + windowMs) },
  };
  if (excludeId) query._id = { $ne: excludeId };
  const labels = ["Technology interview", "Company interview", "Coding interview"];
  for (let i = 0; i < ALL_MODELS.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    if (await ALL_MODELS[i].exists(query)) {
      throw badRequest(`${labels[i]} is already scheduled around this time. Please choose a different time.`, {
        code: "ALREADY_SCHEDULED",
      });
    }
  }
}

/**
 * Validates and normalises the type-specific fields of a schedule request.
 * Shared by single, bulk and edit.
 */
async function buildTypeFields(type, body, { partial = false } = {}) {
  const out = {};
  const has = (k) => body[k] !== undefined && body[k] !== null && body[k] !== "";

  if (!partial || has("platform")) {
    if (!PLATFORMS.includes(body.platform)) throw badRequest("platform must be 'web' or 'mpod'.");
    out.platform = body.platform;
  }
  if (!partial || has("questions_count")) {
    const max = type === "coding" ? 10 : 30;
    out.questions_count = String(toInt(body.questions_count, { min: 1, max, field: "questions_count" }));
  }

  if (type === "ai generated") {
    if (!partial || has("technology")) {
      const techId = toObjectId(body.technology, "technology");
      if (!(await Technology.exists({ _id: techId }))) throw badRequest("Technology not found.");
      out.technology = techId;
    }
    if (!partial || has("module")) {
      const mods = parseList(body.module).map((m) => toObjectId(m, "module"));
      if (!mods.length) throw badRequest("Select at least one module.");
      out.module = mods;
    }
    if (!partial || has("topic")) {
      out.topic = parseList(body.topic).map((t) => toObjectId(t, "topic"));
    }
    if (!partial || has("level")) {
      if (!body.level || String(body.level).length > 50) throw badRequest("level is required.");
      out.level = String(body.level);
    }
    // Modules must belong to the technology, topics to the modules.
    if (out.module || out.technology) {
      const techId = out.technology || body._existing?.technology;
      const mods = out.module || body._existing?.module || [];
      const okMods = await Module.countDocuments({ _id: { $in: mods }, technology: techId });
      if (okMods !== mods.length) throw badRequest("One or more modules do not belong to the selected technology.");
      const topics = out.topic || body._existing?.topic || [];
      if (topics.length) {
        const okTopics = await Topic.countDocuments({ _id: { $in: topics }, module: { $in: mods } });
        if (okTopics !== topics.length) throw badRequest("One or more topics do not belong to the selected modules.");
      }
    }
  } else if (type === "company") {
    if (!partial || has("company")) {
      const companies = parseList(body.company).map((c) => toObjectId(c, "company"));
      if (!companies.length) throw badRequest("Select at least one company.");
      if ((await Company.countDocuments({ _id: { $in: companies } })) !== companies.length) {
        throw badRequest("One or more companies were not found.");
      }
      out.company = companies;
    }
    if (!partial || has("type")) {
      const t = parseList(body.type).map(String);
      if (!t.length) throw badRequest("Select at least one question type.");
      out.type = t;
    }
    if (!partial || has("round")) {
      const r = parseList(body.round).map(String);
      if (!r.length) throw badRequest("Select at least one round.");
      out.round = r;
    }
    if (has("tag")) {
      out.tag = toObjectId(body.tag, "tag");
    }
  } else if (type === "coding") {
    if (!partial || has("level")) {
      if (!body.level || String(body.level).length > 50) throw badRequest("level is required.");
      out.level = String(body.level);
    }
  }
  return out;
}

const formatIST = (d) =>
  new Date(d).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

function notifyScheduled(user, type, start, platform) {
  if (!user.email) return;
  const where = platform === "mpod" ? "at the mPod kiosk in your college" : "on the mPod website";
  sendMailInBackground({
    to: user.email,
    subject: "Interview Schedule",
    text: `Hello ${user.first_name || ""},

Your ${labelFor(type)} is scheduled on ${formatIST(start)} (IST), ${where}.

Please make sure to log in at least 5 minutes before the scheduled time.

You will have a ${env.startGraceMinutes}-minute grace period to begin the interview after the scheduled start time. If you do not start within this period, the interview will expire and cannot be attempted.

All the best!

Thank you!`,
  });
}

/**
 * Schedules one interview for one student: validates, checks overlap, deducts a
 * credit and creates the interview atomically. Returns the saved document.
 */
async function scheduleOne({ type, tenant, rollNo, start, fields, actor }) {
  const student = await findStudentInTenant(rollNo, tenant._id);
  const duration = tenant.interview_duration_minutes || 30;
  await assertNoOverlap({ rollNo: student.roll_no, start, durationMinutes: duration });

  const Model = modelFor(type);
  await credits.ensureOpeningBalance(tenant._id);
  let created = null;
  const saved = await withTransaction(async (session) => {
    const doc = new Model({
      ...fields,
      roll_no: student.roll_no,
      start_date_time: start,
      created_by: actor.roll_no,
      tenant_id: tenant._id,
      user_id: student._id,
      status: 1,
    });
    await doc.save(session ? { session } : {});
    created = doc;
    await credits.consumeForInterview(
      { tenantId: tenant._id, interviewId: doc._id, interviewType: type, rollNo: student.roll_no, actorId: actor._id },
      session
    );
    return doc;
  }).catch(async (err) => {
    // Without transactions the interview may already be saved; remove it if charging failed.
    // (With transactions it was rolled back and this is a no-op.)
    if (created) await Model.deleteOne({ _id: created._id }).catch(() => {});
    throw err;
  });

  notifyScheduled(student, type, start, fields.platform);
  return saved;
}

const validateStart = (value) => {
  const start = toDate(value, "start_date_time");
  if (start.getTime() < Date.now() - env.startGraceMinutes * 60000) {
    throw badRequest("The start time is in the past.");
  }
  if (start.getTime() > Date.now() + 366 * 24 * 3600 * 1000) throw badRequest("The start time is too far in the future.");
  return start;
};

/** POST single schedule. */
async function scheduleSingle(req, rawType) {
  const type = normaliseType(rawType);
  const tenantId = resolveTenantScope(req, req.body.tenant_id);
  const tenant = await loadActiveTenant(tenantId);
  if (!req.body.roll_no) throw badRequest("roll_no is required.");
  const start = validateStart(req.body.start_date_time);
  const fields = await buildTypeFields(type, req.body);
  return scheduleOne({ type, tenant, rollNo: req.body.roll_no, start, fields, actor: req.auth.user });
}

/** POST bulk schedule from an Excel/CSV file with a roll_no column. */
async function scheduleBulk(req, rawType) {
  const type = normaliseType(rawType);
  if (!req.file) throw badRequest("Upload an Excel or CSV file with a roll_no column.");
  const tenantId = resolveTenantScope(req, req.body.tenant_id);
  const tenant = await loadActiveTenant(tenantId);
  const start = validateStart(req.body.start_date_time);
  const fields = await buildTypeFields(type, req.body);

  const rows = readSheetRows(req.file.path);
  if (!rows.length) throw badRequest("The file has no rows.");
  if (rows.length > MAX_BULK_ROWS) throw badRequest(`A file can have at most ${MAX_BULK_ROWS} rows.`);

  const results = [];
  const alreadyScheduled = [];
  const seen = new Set();
  for (const row of rows) {
    const rollNo = String(row.roll_no ?? row.Roll_No ?? row["Roll No"] ?? row.ROLL_NO ?? "").trim();
    if (!rollNo) {
      results.push({ roll_no: null, status: "failed", reason: "Missing roll number", message: "Missing roll number" });
      continue;
    }
    if (seen.has(rollNo.toUpperCase())) {
      results.push({ roll_no: rollNo, status: "failed", reason: "Duplicate row in file", message: "Duplicate row in file" });
      continue;
    }
    seen.add(rollNo.toUpperCase());
    try {
      // eslint-disable-next-line no-await-in-loop
      await scheduleOne({ type, tenant, rollNo, start, fields, actor: req.auth.user });
      results.push({ roll_no: rollNo, status: "success", message: "Interview scheduled" });
    } catch (err) {
      const msg = err instanceof HttpError ? err.message : "Could not schedule this interview";
      if (!(err instanceof HttpError)) console.error("[bulk schedule]", rollNo, err);
      if (err.extra && err.extra.code === "ALREADY_SCHEDULED") alreadyScheduled.push(rollNo);
      results.push({ roll_no: rollNo, status: "failed", reason: msg, message: msg });
    }
  }
  return {
    message: "Bulk processing completed",
    total: rows.length,
    success: results.filter((r) => r.status === "success").length,
    failed: results.filter((r) => r.status === "failed").length,
    already_scheduled: alreadyScheduled,
    results,
  };
}

function readSheetRows(filePath) {
  let wb;
  try {
    wb = xlsx.readFile(filePath, { dense: true });
  } catch (_) {
    throw badRequest("Could not read the file. Upload a valid .xlsx or .csv file.");
  }
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return [];
  return xlsx.utils.sheet_to_json(sheet, { defval: "" });
}

/** PUT edit of a scheduled interview that has not started. */
async function updateScheduled(req, rawType, id) {
  const type = normaliseType(rawType);
  if (!isObjectId(String(id))) throw badRequest("Invalid interview ID.");
  const Model = modelFor(type);
  const doc = await Model.findById(id);
  await assertInterviewAccess(req, doc);
  if (doc.status !== 1 || doc.attempt?.started_at || (doc.question_details && doc.question_details.length)) {
    throw conflict("This interview has already been started and can no longer be edited.");
  }

  const tenantId = doc.tenant_id || (await User.findOne({ roll_no: doc.roll_no }).select("tenant_id").lean())?.tenant_id;
  const tenant = await loadActiveTenant(tenantId);

  const fields = await buildTypeFields(type, { ...req.body, _existing: doc.toObject() }, { partial: true });
  const update = { ...fields };

  let rollNo = doc.roll_no;
  if (req.body.roll_no && String(req.body.roll_no).trim() !== doc.roll_no) {
    const student = await findStudentInTenant(req.body.roll_no, tenant._id);
    rollNo = student.roll_no;
    update.roll_no = student.roll_no;
    update.user_id = student._id;
  }
  let start = doc.start_date_time;
  if (req.body.start_date_time) {
    start = validateStart(req.body.start_date_time);
    update.start_date_time = start;
  }
  if (update.roll_no || update.start_date_time) {
    await assertNoOverlap({ rollNo, start, durationMinutes: tenant.interview_duration_minutes || 30, excludeId: doc._id });
  }
  if (!doc.tenant_id) update.tenant_id = tenant._id;

  const updated = await Model.findOneAndUpdate(
    { _id: doc._id, status: 1, "attempt.started_at": { $exists: false } },
    { $set: update },
    { new: true, runValidators: true }
  );
  if (!updated) throw conflict("This interview has already been started and can no longer be edited.");
  return updated;
}

/** DELETE: removes an interview; refunds the credit only if it was never started. */
async function deleteScheduled(req, rawType, id) {
  const type = normaliseType(rawType);
  if (!isObjectId(String(id))) throw badRequest("Invalid interview ID.");
  const Model = modelFor(type);
  const doc = await Model.findById(id);
  await assertInterviewAccess(req, doc);

  const neverStarted =
    doc.status === 1 && !doc.attempt?.started_at && !(doc.question_details && doc.question_details.length);
  const tenantId = doc.tenant_id || (await User.findOne({ roll_no: doc.roll_no }).select("tenant_id").lean())?.tenant_id;

  if (tenantId) await credits.ensureOpeningBalance(tenantId);
  let refunded = false;
  await withTransaction(async (session) => {
    const del = await Model.deleteOne({ _id: doc._id }, session ? { session } : {});
    if (!del.deletedCount) throw notFound("Interview not found.");
    if (neverStarted && tenantId) {
      refunded = await credits.refundForInterview(
        { tenantId, interviewId: doc._id, interviewType: type, rollNo: doc.roll_no, actorId: req.auth.user._id },
        session
      );
    }
  });
  return { refunded, data: doc };
}

module.exports = {
  scheduleSingle,
  scheduleBulk,
  updateScheduled,
  deleteScheduled,
  readSheetRows,
  findStudentInTenant,
  loadActiveTenant,
  rollVariants,
};
