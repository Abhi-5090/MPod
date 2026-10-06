const Tag = require('../models/tags');

const AddTag = async (req, res, next) => {
    const { tag_name, createdAt, updatedAt, added_by, status } = req.body;
    let tag;
    try {
        tag = new Tag({
            tag_name,
            createdAt,
            updatedAt,
            added_by,
            status,
        });
        await tag.save().then(() => {
            return res.status(201).json(tag)
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: "Failed to add Tag...!!!"
        });
    }
    if (!tag) {
        return res.status(500).json({ message: "Tag adding failed" })
    }
}

const getTags = async (req, res, next) => {
    let tags;
    try {
        tags = await Tag.find({})
    } catch (err) {
        console.log(err)
    }
    if (!tags) {
        return res.status(500).json({ message: "No tag found" })
    }
    return res.status(200).json({ tags })
}

const getTagById = async (req, res, next) => {
    const id = req.params.id;
    let tag;
    try {
        tag = await Tag.findById(id);
        return res.status(200).json(tag)
    } catch (err) {
        console.log(err)
    }
}

const updateTag = async (req, res, next) => {

    const id = req.params.id;
    let { tag_name, createdAt, updatedAt, added_by, status } = req.body;
    let tag;
    try {
        tag = await Tag.findByIdAndUpdate(id, { tag_name, createdAt, updatedAt, added_by, status });
        tag = await tag.save()
        return res.status(200).json({ message: "Tag updated successfully" })
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: "Tag not updated" })

    }
}
const deleteTag = async (req, res, next) => {
    const id = req.params.id;

    try {
        await Tag.findByIdAndRemove(id)
        return res.status(200).json({ message: "Tag Deleted" })

    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: "Tag not Deleted" })
    }
}


exports.AddTag = AddTag;
exports.getTags = getTags;
exports.deleteTag = deleteTag;
exports.updateTag = updateTag;
exports.getTagById = getTagById;

