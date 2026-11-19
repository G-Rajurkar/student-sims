require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// Allow only the Vercel frontend (comma-separate several origins if needed).
// Trailing slashes are stripped because browsers send origins without them.
const allowed = (process.env.FRONTEND_URL || "")
  .split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean);
app.use(cors({
  origin: (origin, cb) =>
    !origin || allowed.includes(origin) ? cb(null, true) : cb(new Error("Not allowed by CORS")),
}));

app.get("/", (_req, res) => res.json({ status: "Student API running" }));
app.use("/api/students", require("./routes/studentRoutes"));

const uri = process.env.MONGODB_URI;
if (!uri) { console.error("MONGODB_URI is not set"); process.exit(1); }

mongoose
  .connect(uri, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () => console.log("Server listening"));
  })
  .catch((err) => { console.error("MongoDB connection failed:", err.message); process.exit(1); });
