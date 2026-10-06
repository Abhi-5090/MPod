const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const unzipper = require("unzipper");
const mongoose = require("mongoose");
const User = require("../models/user");
const Interview = require("../models/interview");
const CodingInterview = require("../models/codingInterview");
const CompanyInterview = require("../models/companyInterview");
const { PROFILE_PICS_DIR } = require("../config/paths");
const { ASSIGNABLE_ROLES, STAFF_ROLES, PLATFORM_ROLES } = require("../config/roles");
const { readSheetRows } = require("../services/scheduling");
const { resolveTenantScope } = require("../middlewares/auth");
const { asyncHandler, badRequest, forbidden, notFound, conflict, toObjectId } = require("../lib/http");
const { MIN_PASSWORD } = require("./AuthController");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLL_RE = /^[A-Za-z0-9_-]{1,40}$/;
const MAX_IMPORT_ROWS = 5000;

/**
 * Student self-service endpoints historically take the roll number in the URL/body.
 * It must be the logged-in student's own roll number.
 */
function ownRollNo(req, requested) {
  const own = req.auth.user.roll_no;
  if (requested != null && requested !== "" && String(requested) !== own) throw forbidden();
  return own;
}

const assignableRolesFor = (actorRole) =>
  PLATFORM_ROLES.includes(actorRole) ? ASSIGNABLE_ROLES.platform : ASSIGNABLE_ROLES.tenantadmin;

const isBcryptHash = (s) => typeof s === "string" && /^\$2[aby]\$\d{2}\$.{53}$/.test(s);

// ------------------------------------------------------------ import

/** POST /add-user (multipart: file, tenant_id) — bulk import from Excel/CSV. */
const addUser = asyncHandler(async (req, res) => {
  if (!req.file) throw badRequest("No file uploaded.");
  const tenantId = resolveTenantScope(req, req.body.tenant_id);
  const status = req.body.status === "0" || req.body.status === 0 ? 0 : 1;
  const allowedRoles = assignableRolesFor(req.auth.role);

  const rows = readSheetRows(req.file.path);
  if (!rows.length) throw badRequest("The file has no rows.");
  if (rows.length > MAX_IMPORT_ROWS) throw badRequest(`A file can have at most ${MAX_IMPORT_ROWS} rows.`);

  const rejected = [];
  const candidates = [];
  const seenRolls = new Set();
  const seenEmails = new Set();

  rows.forEach((row, i) => {
    const rowNo = i + 2; // header is row 1
    const roll = String(row.roll_no ?? "").trim().toUpperCase();
    const reject = (reason) => rejected.push({ row: rowNo, roll_no: roll || null, reason });
    if (!roll || !ROLL_RE.test(roll)) return reject("Missing or invalid roll_no");
    if (seenRolls.has(roll)) return reject("Duplicate roll_no in file");
    const email = String(row.email ?? "").trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) return reject("Missing or invalid email");
    if (seenEmails.has(email)) return reject("Duplicate email in file");
    const role = String(row.role ?? "").trim().toLowerCase() || "student";
    if (!allowedRoles.includes(role)) return reject(`Role '${role}' cannot be assigned by you`);
    const password = String(row.password ?? "");
    if (!isBcryptHash(password) && password.length < MIN_PASSWORD) {
      return reject(`Password must be at least ${MIN_PASSWORD} characters`);
    }
    const mobile = String(row.mobile ?? "").replace(/\D/g, "");
    const year = row.passout_year ? Number(row.passout_year) : undefined;
    seenRolls.add(roll);
    seenEmails.add(email);
    candidates.push({
      rowNo,
      doc: {
        first_name: String(row.first_name ?? "").trim().slice(0, 100),
        roll_no: roll,
        mobile: mobile ? Number(mobile) : undefined,
        email,
        gender: String(row.gender ?? "").trim().toLowerCase().slice(0, 20),
        college: String(row.college ?? "").trim().slice(0, 200),
        branch: String(row.branch ?? "").trim().slice(0, 100),
        passout_year: Number.isInteger(year) ? year : undefined,
        role,
        tenant_id: tenantId,
        status,
      },
      password,
    });
  });

  // Roll numbers and emails must be unique across the whole platform.
  const [existingRolls, existingEmails] = await Promise.all([
    User.find({ roll_no: { $in: candidates.map((c) => c.doc.roll_no) } }).select("roll_no").lean(),
    User.find({ email: { $in: candidates.map((c) => c.doc.email) } }).select("email").lean(),
  ]);
  const rollTaken = new Set(existingRolls.map((u) => String(u.roll_no).toUpperCase()));
  const emailTaken = new Set(existingEmails.map((u) => u.email));
  const existingRollNos = [];
  const toInsert = [];
  for (const c of candidates) {
    if (rollTaken.has(c.doc.roll_no)) {
      existingRollNos.push(c.doc.roll_no);
      continue;
    }
    if (emailTaken.has(c.doc.email)) {
      rejected.push({ row: c.rowNo, roll_no: c.doc.roll_no, reason: "Email already registered" });
      continue;
    }
    // eslint-disable-next-line no-await-in-loop
    c.doc.password = isBcryptHash(c.password) ? c.password : await bcrypt.hash(c.password, 10);
    toInsert.push(c.doc);
  }

  let inserted = 0;
  if (toInsert.length) {
    try {
      const r = await User.insertMany(toInsert, { ordered: false });
      inserted = r.length;
    } catch (err) {
      // Duplicate keys raced in by another import: report what failed.
      inserted = err.insertedDocs ? err.insertedDocs.length : (err.result?.insertedCount || 0);
      (err.writeErrors || []).forEach((we) => {
        const d = toInsert[we.index];
        rejected.push({ row: null, roll_no: d && d.roll_no, reason: "Already exists" });
      });
    }
  }

  return res.status(200).json({
    message: `Inserted ${inserted} new user(s). ${existingRollNos.length} user(s) already exist. ${rejected.length} row(s) rejected.`,
    inserted,
    existingRollNos,
    rejected,
  });
});

// ------------------------------------------------------------ profile pictures

const IMAGE_EXTS = [".png", ".jpg", ".jpeg"];
const MAX_ENTRIES = 5000;
const MAX_ENTRY_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_BYTES = 300 * 1024 * 1024;

/**
 * POST /upload-profile-pics (multipart: profile_pics_zip). Each file must be named
 * <roll_no>.png|jpg|jpeg and belong to a student the caller manages.
 */
const uploadProfilePics = asyncHandler(async (req, res) => {
  if (!req.file) throw badRequest("No file uploaded");
  const scope = resolveTenantScope(req, req.body.tenant_id, { allowAll: true });

  let directory;
  try {
    directory = await unzipper.Open.file(req.file.path);
  } catch (_) {
    throw badRequest("Could not read the zip file.");
  }
  const files = directory.files.filter((f) => f.type === "File" && !f.path.endsWith("/"));
  if (files.length > MAX_ENTRIES) throw badRequest(`The zip can contain at most ${MAX_ENTRIES} images.`);
  const total = files.reduce((s, f) => s + (f.uncompressedSize || 0), 0);
  if (total > MAX_TOTAL_BYTES) throw badRequest("The zip is too large when extracted.");

  const parsed = files.map((f) => {
    const base = path.basename(f.path);
    const ext = path.extname(base).toLowerCase();
    const roll = path.basename(base, path.extname(base)).toUpperCase();
    return { f, ext, roll };
  });
  const rolls = [...new Set(parsed.map((p) => p.roll).filter((r) => ROLL_RE.test(r)))];
  const userFilter = { roll_no: { $in: rolls } };
  if (scope) userFilter.tenant_id = scope;
  const known = new Set((await User.find(userFilter).select("roll_no").lean()).map((u) => String(u.roll_no).toUpperCase()));

  await fs.promises.mkdir(PROFILE_PICS_DIR, { recursive: true });
  const saved = [];
  const skipped = [];
  for (const { f, ext, roll } of parsed) {
    if (base_ignored(f.path)) continue;
    if (!IMAGE_EXTS.includes(ext)) {
      skipped.push({ file: path.basename(f.path), reason: "Not a png/jpg image" });
      continue;
    }
    if (!ROLL_RE.test(roll) || !known.has(roll)) {
      skipped.push({ file: path.basename(f.path), reason: "No matching student in your college" });
      continue;
    }
    if ((f.uncompressedSize || 0) > MAX_ENTRY_BYTES) {
      skipped.push({ file: path.basename(f.path), reason: "Image larger than 5 MB" });
      continue;
    }
    // Always stored as <ROLL>.png so the apps can find it; browsers sniff the real type.
    const dest = path.join(PROFILE_PICS_DIR, `${roll}.png`);
    // eslint-disable-next-line no-await-in-loop
    const buf = await f.buffer();
    if (buf.length > MAX_ENTRY_BYTES) {
      skipped.push({ file: path.basename(f.path), reason: "Image larger than 5 MB" });
      continue;
    }
    if (!looksLikeImage(buf)) {
      skipped.push({ file: path.basename(f.path), reason: "File content is not an image" });
      continue;
    }
    // eslint-disable-next-line no-await-in-loop
    await fs.promises.writeFile(dest, buf);
    saved.push(roll);
  }
  return res.status(200).json({ message: `Uploaded ${saved.length} profile picture(s).`, saved, skipped });
});

// macOS zips include __MACOSX/ and ._ files
const base_ignored = (p) => p.startsWith("__MACOSX/") || path.basename(p).startsWith("._") || path.basename(p) === ".DS_Store";

const looksLikeImage = (buf) =>
  (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) || // PNG
  (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff); // JPEG

/** GET /backend/profile-pics/:file — only for people allowed to see that student. */
const serveProfilePic = asyncHandler(async (req, res) => {
  const name = String(req.params.file || "");
  const m = name.match(/^([A-Za-z0-9_-]{1,40})\.(png|jpg|jpeg)$/i);
  if (!m) throw notFound();
  const roll = m[1];
  const a = req.auth;
  const isDefault = ["default", "logo_header"].includes(roll);
  if (!isDefault) {
    if (a.kind === "student") {
      if (roll.toUpperCase() !== String(a.user.roll_no).toUpperCase()) throw notFound();
    } else if (!(a.kind === "staff" && a.isPlatform)) {
      const ok = await User.exists({ roll_no: { $in: [roll, roll.toUpperCase()] }, tenant_id: a.tenantId });
      if (!ok) throw notFound();
    }
  }
  const candidates = [`${roll}.png`, `${roll.toUpperCase()}.png`, `${roll}.${m[2].toLowerCase()}`, `${roll}.jpg`, `${roll}.jpeg`];
  for (const c of candidates) {
    const full = path.join(PROFILE_PICS_DIR, c);
    // eslint-disable-next-line no-await-in-loop
    if (await fs.promises.access(full).then(() => true, () => false)) {
      res.set("Cache-Control", "private, max-age=3600");
      return res.sendFile(full);
    }
  }
  return res.sendFile(path.join(PROFILE_PICS_DIR, "default.png"));
});

// ------------------------------------------------------------ user management

const SAFE_USER_FIELDS = "first_name roll_no mobile email gender college branch passout_year role status tenant_id profile_pic created_at updated_at";

/** GET /get-users/:id (tenant id) */
const getUsers = asyncHandler(async (req, res) => {
  const tenantId = resolveTenantScope(req, req.params.id);
  const users = await User.find({ tenant_id: tenantId }).select(SAFE_USER_FIELDS).sort({ roll_no: 1 }).lean();
  return res.status(200).json(users);
});

async function loadManagedUser(req, id) {
  const user = await User.findById(toObjectId(id, "user id"));
  if (!user) throw notFound("User not found");
  if (!req.auth.isPlatform) {
    if (String(user.tenant_id) !== String(req.auth.tenantId)) throw notFound("User not found");
    // College admins manage students only.
    if (STAFF_ROLES.includes(user.role)) throw forbidden();
  } else if (PLATFORM_ROLES.includes(user.role) && String(user._id) !== String(req.auth.user._id) && req.auth.role !== "superadmin") {
    throw forbidden("Only a super admin can manage platform admin accounts.");
  }
  return user;
}

const getUserById = asyncHandler(async (req, res) => {
  const user = await loadManagedUser(req, req.params.id);
  const out = user.toObject();
  User.SECRET_FIELDS.forEach((f) => delete out[f]);
  return res.status(200).json(out);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await loadManagedUser(req, req.params.id);
  const b = req.body || {};
  const set = {};
  const str = (v, max) => String(v).trim().slice(0, max);

  if (b.first_name !== undefined) set.first_name = str(b.first_name, 100);
  if (b.gender !== undefined) set.gender = str(b.gender, 20).toLowerCase();
  if (b.college !== undefined) set.college = str(b.college, 200);
  if (b.branch !== undefined) set.branch = str(b.branch, 100);
  if (b.mobile !== undefined && b.mobile !== "") {
    const digits = String(b.mobile).replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) throw badRequest("Invalid mobile number.");
    set.mobile = Number(digits);
  }
  if (b.passout_year !== undefined && b.passout_year !== "") {
    const y = Number(b.passout_year);
    if (!Number.isInteger(y) || y < 1990 || y > 2100) throw badRequest("Invalid passout year.");
    set.passout_year = y;
  }
  if (b.email !== undefined) {
    const email = str(b.email, 200).toLowerCase();
    if (!EMAIL_RE.test(email)) throw badRequest("Invalid email.");
    if (email !== user.email && (await User.exists({ email, _id: { $ne: user._id } }))) throw conflict("Email already registered.");
    set.email = email;
  }
  if (b.role !== undefined && b.role !== user.role) {
    const role = str(b.role, 30).toLowerCase();
    if (!assignableRolesFor(req.auth.role).includes(role)) throw forbidden(`You cannot assign the role '${role}'.`);
    set.role = role;
  }
  const unset = {};
  if (b.status !== undefined && b.status !== "") {
    const s = Number(b.status);
    if (![0, 1].includes(s)) throw badRequest("status must be 0 or 1.");
    set.status = s;
  }
  if (b.password) {
    if (typeof b.password !== "string" || b.password.length < MIN_PASSWORD || b.password.length > 128) {
      throw badRequest(`Password must be ${MIN_PASSWORD} to 128 characters long.`);
    }
    set.password = await bcrypt.hash(b.password, 10);
  }
  // Role, status or password changes end the user's sessions.
  if (set.role || set.status === 0 || set.password) {
    Object.assign(unset, { session_sid: "", session_expires_at: "", admin_session_sid: "" });
  }
  set.updated_at = new Date();
  await User.updateOne({ _id: user._id }, { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) });
  const updated = await User.findById(user._id).select(SAFE_USER_FIELDS).lean();
  return res.status(200).json({ message: "User updated successfully", data: updated });
});

/** DELETE /delete-user/:id — deactivates (keeps interview history) and ends sessions. */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await loadManagedUser(req, req.params.id);
  if (String(user._id) === String(req.auth.user._id)) throw badRequest("You cannot deactivate your own account.");
  await User.updateOne(
    { _id: user._id },
    { $set: { status: 0, updated_at: new Date() }, $unset: { session_sid: "", session_expires_at: "", admin_session_sid: "" } }
  );
  return res.status(200).json({ message: "User deactivated" });
});

// ------------------------------------------------------------ student dashboard
const getAssignedInterviews = async (req, res, next) => {
  const roll_no = ownRollNo(req, req.params.id);
  const nowUTC = new Date();
  const pastTimeUTC = new Date(nowUTC.getTime() - 5 * 60000);

  try {
    const commonPipeline = [
      {
        $match: {
          roll_no: roll_no,
          $or: [{ tenant_id: req.auth.tenantId }, { tenant_id: { $exists: false } }],
          status: 1,
          evaluation_status: null,
        }
      },
      {
        // Not yet past the start window, or started and still within its time limit (resumable).
        $match: {
          $or: [
            { start_date_time: { $gte: pastTimeUTC } },
            { "attempt.deadline_at": { $gt: nowUTC } }
          ]
        }
      },
      {
        $project: {
          _id: 1,
          start_date_time: 1,
          platform: 1,
          interview_type: 1,
          in_progress: { $cond: [{ $ifNull: ["$attempt.started_at", false] }, true, false] },
        }
      }
    ];

    const interviews = await Interview.aggregate([
      ...commonPipeline,
      {
        $addFields: {
          interview_type: "ai generated",
          startDate: "$start_date_time",
          start_date_time: {
            $dateToString: {
              format: "%d-%m-%Y %H:%M",
              date: "$start_date_time",
              timezone: "Asia/Kolkata"
            }
          }
        }
      }
    ]);

    const companyInterviews = await CompanyInterview.aggregate([
      ...commonPipeline,
      {
        $addFields: {
          interview_type: "company",
          startDate: "$start_date_time",
          start_date_time: {
            $dateToString: {
              format: "%d-%m-%Y %H:%M",
              date: "$start_date_time",
              timezone: "Asia/Kolkata"
            }
          }
        }
      }
    ]);

    const codingInterviews = await CodingInterview.aggregate([
      ...commonPipeline,
      {
        $addFields: {
          interview_type: "coding",
          startDate: "$start_date_time",
          start_date_time: {
            $dateToString: {
              format: "%d-%m-%Y %H:%M",
              date: "$start_date_time",
              timezone: "Asia/Kolkata"
            }
          },
        }
      }
    ]);
    let finalInterviewsList = [
      ...interviews,
      ...codingInterviews,
      ...companyInterviews
    ].filter(Boolean);
    return res.status(200).json(finalInterviewsList);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getTraineePastInterviews = async (req, res, next) => {
  const roll_no = ownRollNo(req, req.params.id);
    const nowUTC = new Date();
  const pastTimeUTC = new Date(nowUTC.getTime() - 5 * 60000);
  try {
    const commonPipeline = [
      {
        $match: {
          roll_no: roll_no,
          $or: [{ tenant_id: req.auth.tenantId }, { tenant_id: { $exists: false } }],
          start_date_time: { $lte: pastTimeUTC }
        }
      },
      {
        $project: {
          _id: 1,
          start_date_time: 1,
          platform: 1,
          interview_type: 1,
          status: 1,
          question_details: 1,
          evaluation_status: 1,
          started: { $cond: [{ $ifNull: ["$attempt.started_at", false] }, true, false] },
          is_question_empty: {
            $or: [
              { $eq: ["$question_details", null] },
              { $eq: [{ $size: "$question_details" }, 0] }
            ]
          }
        }
      }
    ];

    const interviews = await Interview.aggregate([
      ...commonPipeline,
      {
        $addFields: {
          interview_type: "ai generated",
          interview_status: {
            $cond: {
              if: {
                $and: [
                  { $eq: ["$is_question_empty", true] },
                  { $eq: ["$status", 1] }
                ]
              },
              then: "expired",
              else: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$is_question_empty", false] },
                      { $eq: ["$status", 0] }
                    ]
                  },
                  then: "attended",
                  else: null
                }
              }
            }
          },
          start_date_time: {
            $dateToString: {
              format: "%d-%m-%Y %H:%M",
              date: "$start_date_time",
              timezone: "Asia/Kolkata"
            }
          }
        }
      }
    ]);


    const companyInterviews = await CompanyInterview.aggregate([
      ...commonPipeline,
      {
        $addFields: {
          interview_type: "company",
          interview_status: {
            $cond: {
              if: {
                $and: [
                  { $eq: ["$is_question_empty", true] },
                  { $eq: ["$status", 1] }
                ]
              },
              then: "expired",
              else: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$is_question_empty", false] },
                      { $eq: ["$status", 0] }
                    ]
                  },
                  then: "attended",
                  else: null
                }
              }
            }
          },
          start_date_time: {
            $dateToString: {
              format: "%d-%m-%Y %H:%M",
              date: "$start_date_time",
              timezone: "Asia/Kolkata" // Convert to IST for response
            }
          }
        }
      }
    ]);
    const codingInterviews = await CodingInterview.aggregate([
      ...commonPipeline,
      {
        $addFields: {
          interview_type: "coding",
          interview_status: {
            $cond: {
              if: {
                $and: [
                  { $eq: ["$is_question_empty", true] },
                  { $eq: ["$status", 1] }
                ]
              },
              then: "expired",
              else: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$is_question_empty", false] },
                      { $eq: ["$status", 0] }
                    ]
                  },
                  then: "attended",
                  else: null
                }
              }
            }
          },
          start_date_time: {
            $dateToString: {
              format: "%d-%m-%Y %H:%M",
              date: "$start_date_time",
              timezone: "Asia/Kolkata" 
            }
          }
        }
      }
    ]);

    let finalInterviewsList = [
      ...interviews,
      ...codingInterviews,
      ...companyInterviews
    ].filter(Boolean);
    finalInterviewsList.forEach((it) => {
      if (it.evaluation_status === "pending" || it.evaluation_status === "processing") it.interview_status = "evaluating";
      else if (it.evaluation_status === "failed") it.interview_status = "evaluation failed";
      else if (it.status === 1 && it.started) it.interview_status = "in progress";
      delete it.started;
    });
    finalInterviewsList.sort((a, b) => {
      const dateA = a.start_date_time.split(" ")[0].split("-").reverse().join("-") + " " + a.start_date_time.split(" ")[1];
      const dateB = b.start_date_time.split(" ")[0].split("-").reverse().join("-") + " " + b.start_date_time.split(" ")[1];
    
      return new Date(dateB) - new Date(dateA); 
    });
    
    return res.status(200).json(finalInterviewsList);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getInterviewDetailsById = async (req, res, next) => {
  const { id, platform, type } = req.body || {};
  const roll_no = ownRollNo(req, req.body && req.body.roll_no);
  if (!mongoose.Types.ObjectId.isValid(String(id))) return res.status(400).json({ message: "Invalid interview ID" });
  try {
    if (type == "ai generated") {
      const result = await Interview.aggregate([
        {
          $addFields: {
            dateOnly: { $substr: ["$start_date_time", 0, 10] },
            interview_type: "ai generated"
          },
        },
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
            platform: platform,
            roll_no: roll_no
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "roll_no",
            foreignField: "roll_no",
            as: "userDetails",
          },
        },
        {
          $addFields: {
            first_name: { $arrayElemAt: ["$userDetails.first_name", 0] },
            gender: { $arrayElemAt: ["$userDetails.gender", 0] },
          },
        },
        {
          $lookup: {
            from: "technologies",
            localField: "technology",
            foreignField: "_id",
            as: "technologyDetails",
          },
        },
        {
          $addFields: {
            technology_name: { $arrayElemAt: ["$technologyDetails.technology_name", 0] },
          },
        },
        {
          $lookup: {
            from: "modules",
            localField: "module",
            foreignField: "_id",
            as: "moduleDetails",
          },
        },
        {
          $lookup: {
            from: "topics",
            localField: "topic",
            foreignField: "_id",
            as: "topicDetails",
          },
        },
        {
          $addFields: {
            module_details: {
              $map: {
                input: "$moduleDetails",
                as: "module",
                in: {
                  _id: "$$module._id",
                  module_name: "$$module.module_name",
                  topic_names: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$topicDetails",
                          as: "topic",
                          cond: { $eq: ["$$topic.module", "$$module._id"] },
                        },
                      },
                      as: "topic",
                      in: "$$topic.topic_name",
                    },
                  },
                },
              },
            },
          },
        },
        {
          $unset: ["userDetails", "technologyDetails", "moduleDetails", "topicDetails", "attempt.token_hash", "issued_questions", "answers", "idea_checks"],
        },
      ])
      if (result && result[0]) {
        return res.status(200).json(result[0])
      } else {
        return res.status(404).json({ message: "Interview not found" })
      }
    } else if (type == "company") {
      const result = await CompanyInterview.aggregate([
        {
          $addFields: {
            dateOnly: { $substr: ["$start_date_time", 0, 10] },
            interview_type: "company"
          },
        },
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
            platform: platform,
            roll_no: roll_no
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "roll_no",
            foreignField: "roll_no",
            as: "userDetails",
          },
        },
        {
          $addFields: {
            first_name: { $arrayElemAt: ["$userDetails.first_name", 0] },
            gender: { $arrayElemAt: ["$userDetails.gender", 0] },
          },
        },
        {
          $lookup: {
            from: "companies",
            localField: "company",
            foreignField: "_id",
            as: "companyDetails",
          },
        },
        {
          $addFields: {
            company_details: {
              $map: {
                input: "$companyDetails",
                as: "company",
                in: {
                  _id: "$$company._id",
                  company_name: "$$company.company_name",
                  
                },
              },
            },
          },
        },
        {
          $unset: ["userDetails", "companyDetails", "attempt.token_hash", "issued_questions", "answers", "idea_checks"],
        },
      ])
      console.log(result)
      if (result && result[0]) {
        return res.status(200).json(result[0])
      } else {
        return res.status(404).json({ message: "Interview not found" })
      }
    } else if (type == "coding") {
      const result = await CodingInterview.aggregate([
        {
          $addFields: {
            dateOnly: { $substr: ["$start_date_time", 0, 10] },
            interview_type: "coding"
          },
        },
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
            platform: platform,
            roll_no: roll_no
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "roll_no",
            foreignField: "roll_no",
            as: "userDetails",
          },
        },
        {
          $addFields: {
            first_name: { $arrayElemAt: ["$userDetails.first_name", 0] },
            gender: { $arrayElemAt: ["$userDetails.gender", 0] },
          },
        },
        {
          $unset: ["userDetails", "attempt.token_hash", "issued_questions", "answers", "idea_checks"],
        },
      ])
      if (result && result[0]) {
        return res.status(200).json(result[0])
      } else {
        return res.status(404).json({ message: "Interview not found" })
      }
    }
    return res.status(400).json({ message: "Invalid interview type" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" })
  }
}
const attemptedInterviewsCount = async (req, res, next) => {
  const roll_no = ownRollNo(req, req.params.id);
  try {
    const interviewCounts = await Interview.aggregate([
      {
        $match: {
          roll_no: roll_no,
          question_details: {
            $ne: null,
            $not: { $size: 0 }
          }
        }
      },
      {
        $count: "count"
      }
    ]);
    const codingCounts = await CodingInterview.aggregate([
      {
        $match: {
          roll_no: roll_no,
          question_details: {
            $ne: null,
            $not: { $size: 0 }
          }
        }
      },
      {
        $count: "count"
      }
    ])
    const companyCounts = await CompanyInterview.aggregate([
      {
        $match: {
          roll_no: roll_no,
          question_details: {
            $ne: null,
            $not: { $size: 0 }
          }
        }
      },
      {
        $count: "count"
      }
    ])
    const count = interviewCounts.length > 0 ? interviewCounts[0].count : 0;
    const codingCount = codingCounts.length > 0 ? codingCounts[0].count : 0;
    const companyCount = companyCounts.length > 0 ? companyCounts[0].count : 0
    return res.status(200).json({ aiCount: count, codingCount: codingCount, companyCount: companyCount });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
const platformInterviewsCount = async (req, res, next) => {
  const roll_no = ownRollNo(req, req.params.id);
  try {
    const getPlatformCounts = async (Model) => {
      const result = await Model.aggregate([
        {
          $match: {
            roll_no: roll_no,
            question_details: { $ne: null },
            $expr: { $gt: [{ $size: "$question_details" }, 0] } // Ensure not empty
          }
        },
        {
          $group: {
            _id: "$platform",
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            platform: "$_id",
            count: 1
          }
        }
      ]);

      return {
        web: result.find((item) => item.platform === "web")?.count || 0,
        mpod: result.find((item) => item.platform === "mpod")?.count || 0
      };
    };

    const aiCount = await getPlatformCounts(Interview);
    const codingCount = await getPlatformCounts(CodingInterview);
    const companyCount = await getPlatformCounts(CompanyInterview);
    const mpodCount = aiCount.mpod + codingCount.mpod + companyCount.mpod;
    const webCount = aiCount.web + codingCount.web + companyCount.web;
    return res.status(200).json({
      mpodCount,
      webCount,

    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const overallAccuracy = async (req, res, next) => {
  const roll_no = ownRollNo(req, req.params.id);

  try {
    const getAccuracies = async (model) => {
      const accuracy = await model.aggregate([
        {
          $match: { roll_no: roll_no, status: 0 }
        },
        {
          $addFields: {
            question_details: {
              $ifNull: ["$question_details", []]
            }
          }
        },
        {
          $unwind: {
            path: "$question_details",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: "$_id", // Group by interview
            avgAccuracyPerInterview: {
              $avg: {
                $convert: {
                  input: "$question_details.accuracy",
                  to: "double",
                  onError: 0,
                  onNull: 0
                }
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            overallAvgAccuracy: { $avg: "$avgAccuracyPerInterview" }
          }
        }
      ]);
      

      return accuracy.length > 0 ? Math.ceil(accuracy[0].overallAvgAccuracy) : 0;
    };

    const [technologyAvg, codingAvg, companyAvg] = await Promise.all([
      getAccuracies(Interview),
      getAccuracies(CodingInterview),
      getAccuracies(CompanyInterview)
    ]);

    const overallAvgAccuracy = Math.ceil(
      (technologyAvg + codingAvg + companyAvg) / 3
    );

    const accuracyData = [
      { label: "Technology", value: technologyAvg, color: "#4caf50" },
      { label: "Company", value: companyAvg, color: "#ff9800" },
      { label: "Coding", value: codingAvg, color: "#2196f3" }
    ];

    return res.json({
      accuracyData: accuracyData,
      overall: overallAvgAccuracy
    });
  } catch (error) {
    console.error("Error in overallAccuracy:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  addUser,
  uploadProfilePics,
  serveProfilePic,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAssignedInterviews: asyncHandler(getAssignedInterviews),
  getTraineePastInterviews: asyncHandler(getTraineePastInterviews),
  getInterviewDetailsById: asyncHandler(getInterviewDetailsById),
  attemptedInterviewsCount: asyncHandler(attemptedInterviewsCount),
  platformInterviewsCount: asyncHandler(platformInterviewsCount),
  overallAccuracy: asyncHandler(overallAccuracy),
  ownRollNo,
};
