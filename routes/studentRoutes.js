const express = require("express");
const Student = require("../models/Student");
const router = express.Router();

const fail = (res, err) => {
  if (err.code === 11000)
    return res.status(409).json({ success: false, message: "Student ID already exists" });
  if (err.name === "ValidationError")
    return res.status(400).json({ success: false, message: err.message });
  console.error(err);
  res.status(500).json({ success: false, message: "Server error" });
};

// Read all (optional ?q= search on name / studentId / department)
router.get("/", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const filter = q
      ? {
          $or: ["name", "studentId", "department"].map((f) => ({
            [f]: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" },
          })),
        }
      : {};
    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: students });
  } catch (err) { fail(res, err); }
});

// Read one by studentId
router.get("/:id", async (req, res) => {
  try {
    const s = await Student.findOne({ studentId: req.params.id });
    if (!s) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, data: s });
  } catch (err) { fail(res, err); }
});

// Create
router.post("/", async (req, res) => {
  try {
    const s = await Student.create(req.body);
    res.status(201).json({ success: true, message: "Student added successfully", data: s });
  } catch (err) { fail(res, err); }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const s = await Student.findOneAndUpdate({ studentId: req.params.id }, req.body, {
      new: true, runValidators: true,
    });
    if (!s) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, message: "Student updated successfully", data: s });
  } catch (err) { fail(res, err); }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const s = await Student.findOneAndDelete({ studentId: req.params.id });
    if (!s) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, message: "Student deleted successfully" });
  } catch (err) { fail(res, err); }
});

module.exports = router;
