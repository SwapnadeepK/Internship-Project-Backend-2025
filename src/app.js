const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ FIX: Serve uploads folder correctly
// app.use(
//   "/uploads",
//   express.static(path.join(__dirname, "..", "uploads"))
// );

// ✅ CORRECT static path
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "College Fees Management API is running"
  });
});

// Routes
app.use("/api/auth", authRoutes);

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user
  });
});

app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);

module.exports = app;
