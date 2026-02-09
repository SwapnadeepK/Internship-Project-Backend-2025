const db = require("../config/db");
const Fee = require("../models/feeModel");
const StudentProfile = require("../models/studentProfileModel");
const { generateSemesterFee } = require("../utils/semesterFeeGenerator");

/**
 * @desc    Get all students
 * @route   GET /api/admin/students
 * @access  Admin
 */
const getAllStudents = async (req, res) => {
  try {
    const [students] = await db.execute(`
      SELECT S.usn, S.first_name, S.last_name, U.email, S.degreeId
      FROM users AS U
      JOIN student_profiles AS S ON U.userId = S.userId
      WHERE U.isAdmin = FALSE
    `);

    res.json({
      success: true,
      data: students
    });

  } catch (error) {
    console.error("DB ERROR:", error); // <-- log actual error for debugging
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/**
 * @desc    Create fee record for student
 * @route   POST /api/admin/fees
 * @access  Admin
 */
const createFee = async (req, res) => {
  try {
    const { userId, amount, semester, due_date } = req.body;

    if (!userId || !amount || !semester || !due_date) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    await Fee.create({ userId, amount, semester, due_date });

    res.status(201).json({
      success: true,
      message: "Fee record created"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Mark fee as paid
 * @route   PATCH /api/admin/fees/:feeId/pay
 * @access  Admin
 */
const markFeePaid = async (req, res) => {
  try {
    const { feeId } = req.params;

    await Fee.markAsPaid(feeId);

    res.json({
      success: true,
      message: "Fee marked as paid"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Get student profile by USN
 * @route   GET /api/admin/student/:usn
 * @access  Admin only
 */
// const getStudentByUSN = async (req, res) => {
//   try {
//     const { usn } = req.params;

//     const sql = `
//       SELECT *
//       FROM student_profiles
//       WHERE usn = ?
//       LIMIT 1
//     `;
//     const [rows] = await StudentProfile.executeRaw(sql, [usn]);
//     const profile = rows[0];

//     if (!profile) {
//       return res.status(404).json({
//         success: false,
//         message: "Student not found"
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: profile
//     });

//   } catch (error) {
//     console.error("Admin getStudentByUSN Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error"
//     });
//   }
// };

const getStudentByUSN = async (req, res) => {
  try {
    const { usn } = req.params;
    const student = await StudentProfile.findByUSN(usn); // ✅ Use the new method

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, student });
  } catch (error) {
    console.error("Admin getStudentByUSN Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


/**
 * @desc    Release next semester fee
 * @route   POST /api/admin/release-fee
 * @access  Admin only
 */
const releaseSemesterFee = async (req, res) => {
  const { userId, semester, amount } = req.body;

  if (!userId || !semester || !amount) {
    return res.status(400).json({
      success: false,
      message: "All fields required"
    });
  }

  await generateSemesterFee({ userId, semester, amount });

  res.json({
    success: true,
    message: "Semester fee released successfully"
  });
};

const getAllFees = async (req, res) => {
  try {
    const fees = await Fee.findAll();
    res.status(200).json({ data: fees });
  } catch (err) {
    console.error("Error fetching fees:", err);
    res.status(500).json({ message: "Failed to fetch fees" });
  }
};


module.exports = {
  getAllStudents,
  createFee,
  markFeePaid,
  getStudentByUSN,
  releaseSemesterFee,
  getAllFees
};
