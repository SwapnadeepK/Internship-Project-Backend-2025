const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const studentMiddleware = require("../middleware/studentMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validateStudentProfileUpdate =
  require("../middleware/validateStudentProfileUpdate");

// Controllers
const {
  getMyFees,
  getMyFeeSummary,
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile
} = require("../controllers/studentController");

const { payFee } = require("../controllers/studentPaymentController");
const { getPaymentHistory } = require("../controllers/studentPaymentHistoryController");

// 🔐 Protect all student routes
router.use(authMiddleware);
router.use(studentMiddleware);

/* ================= 👤 Student Profile ================= */

// Create profile (photo allowed)
router.post(
  "/profile",
  upload.single("photo"),
  createStudentProfile
);

// Get profile
router.get("/profile", getStudentProfile);

// Update profile (photo allowed + validation)
router.put(
  "/profile",
  upload.single("photo"),
  validateStudentProfileUpdate,
  updateStudentProfile
);

/* ================= 💰 Student Fees ================= */

router.get("/fees", getMyFees);
router.get("/fees/summary", getMyFeeSummary);

/* ================= 💸 Fee Payments ================= */

router.post("/fees/pay", payFee);
router.get("/payments/history", getPaymentHistory);

module.exports = router;
