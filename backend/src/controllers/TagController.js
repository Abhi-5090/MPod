const Tag = require("../models/tags");
const { asyncHandler, badRequest, notFound, conflict, toObjectId, escapeRegex } = require("../lib/http");

const cleanName = (v) => {
  const name = String(v ?? "").trim();
  if (name.length < 2 || name.length > 50) throw badRequest("Tag name must be 2 to 50 characters.");
  return name;
};

const AddTag = asyncHandler(async (req, res) => {
  const tag_name = cleanName(req.body?.tag_name);
  if (await Tag.exists({ tag_name: new RegExp(`^${escapeRegex(tag_name)}$`, "i") })) {
    throw conflict("A tag with this name already exists.");
  }
  const now = new Date().toISOString();
  const tag = await Tag.create({
    tag_name,
    createdAt: now,
    updatedAt: now,
    added_by: String(req.auth.user.roll_no || "admin").slice(0, 20),
    status: Number(req.body?.status) === 0 ? 0 : 1,
  });
  return res.status(201).json(tag);
});

const getTags = asyncHandler(async (req, res) => {
  const tags = await Tag.find({}).sort({ tag_name: 1 }).lean();
  return res.status(200).json({ tags });
});

const getTagById = asyncHandler(async (req, res) => {
  const tag = await Tag.findById(toObjectId(req.params.id, "tag id")).lean();
  if (!tag) throw notFound("Tag not found.");
  return res.status(200).json(tag);
});

const updateTag = asyncHandler(async (req, res) => {
  const id = toObjectId(req.params.id, "tag id");
  const set = { updatedAt: new Date().toISOString() };
  if (req.body?.tag_name !== undefined) set.tag_name = cleanName(req.body.tag_name);
  if (req.body?.status !== undefined && req.body.status !== "") set.status = Number(req.body.status) === 0 ? 0 : 1;
  const tag = await Tag.findByIdAndUpdate(id, { $set: set }, { new: true, runValidators: true });
  if (!tag) throw notFound("Tag not found.");
  return res.status(200).json({ message: "Tag updated successfully" });
});

const deleteTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findByIdAndDelete(toObjectId(req.params.id, "tag id"));
  if (!tag) throw notFound("Tag not found.");
  return res.status(200).json({ message: "Tag Deleted" });
});

module.exports = { AddTag, getTags, getTagById, updateTag, deleteTag };
