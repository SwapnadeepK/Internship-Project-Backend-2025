const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// 👨‍🎓 Student & Fee Admin Controllers
const {
  getAllStudents,
  createFee,
  markFeePaid,
  getStudentByUSN,
  releaseSemesterFee,
  getAllFees
} = require("../controllers/adminController");

// 🎓 Academic Program Admin Controller ✅
const {
  createProgram,
  getAllPrograms,
  updateProgram,
  deleteProgram
} = require("../controllers/adminAcademicProgramController");

// 🔐 Protect all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// 👨‍🎓 Students
router.get("/students", getAllStudents);
router.get("/student/:usn", getStudentByUSN);

// 💰 Fees
router.post("/fees", createFee);
router.patch("/fees/:feeId/pay", markFeePaid);
router.post("/release-fee", releaseSemesterFee);
// backend route
router.get("/fees", getAllFees); // implement getAllFees controller


// 🎓 Academic Programs (ADMIN ONLY)
router.post("/programs", createProgram);
router.get("/programs", getAllPrograms);
router.put("/programs/:degreeId", updateProgram);
router.delete("/programs/:degreeId", deleteProgram);

module.exports = router;
