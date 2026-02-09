const StudentProfile = require("../models/studentProfileModel");
const AcademicProgram = require("../models/academicProgramModel");
const Fee = require("../models/feeModel");
const { calculateAge } = require("../utils/ageCalculator");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

//Helper function to delete old photos and update it with new photo
const deleteOldPhotoAsync = (photoUrl) => {
  if (!photoUrl) return;
  if (photoUrl.includes("default-profile")) return;

  const filename = photoUrl.split("/uploads/")[1];
  if (!filename) return;

  const filePath = path.join(__dirname, "..", "uploads", filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("⚠️ Failed to delete old photo:", err.message);
    } else {
      console.log("🗑️ Old photo deleted:", filename);
    }
  });
};


/**
 * @desc    Create student profile with automatic semester fees
 * @route   POST /api/student/profile
 * @access  Student only
 */
const createStudentProfile = async (req, res) => {
  try {
    console.log("FILE RECEIVED:", req.file); //Check
    if (req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admins cannot create student profiles"
      });
    }

    const userId = req.user.userId;

    // Prevent duplicate profile
    const existingProfile = await StudentProfile.findByUserId(userId);
    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Student profile already exists"
      });
    }

    const {
      first_name, last_name, dob, usn, aadhaar,
      address, phone, guardian_first_name, guardian_last_name,
      guardian_address, guardian_phone, reservation,
      degreeId
    } = req.body;

    // Validate required fields
    if (
      !first_name || !last_name || !dob || !usn || !aadhaar ||
      !address || !phone || !guardian_first_name || !guardian_last_name ||
      !guardian_address || !guardian_phone || !reservation || !degreeId
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // Validate Academic Program
    const program = await AcademicProgram.findByDegreeId(degreeId);
    if (!program) {
      return res.status(400).json({
        success: false,
        message: "Invalid academic program selected"
      });
    }

    const age = calculateAge(dob);

    // ✅ FIX: Full URL for image
    const photo_url = req.file
      ? `${BASE_URL}/uploads/${req.file.filename}`
      : null;

    await StudentProfile.create({
      userId,
      first_name,
      last_name,
      dob,
      age,
      usn,
      aadhaar,
      photo_url,
      address,
      phone,
      guardian_first_name,
      guardian_last_name,
      guardian_address,
      guardian_phone,
      reservation,
      degreeId
    });

    // Auto-create initial semester fees
    await Fee.createInitialFees({ userId, program });

    return res.status(201).json({
      success: true,
      message: "Student profile created successfully"
    });

  } catch (error) {
    console.error("Create Student Profile Error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      let message = "Student profile already exists";
      if (error.message.includes("usn")) message = "USN already registered";
      if (error.message.includes("aadhaar")) message = "Aadhaar already registered";

      return res.status(409).json({ success: false, message });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


/**
 * @desc    Get logged-in student's profile
 * @route   GET /api/student/profile
 * @access  Student only
 */
const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await StudentProfile.findByUserId(userId);

    if (!profile) return res.status(404).json({ success: false, message: "Student profile not found" });

    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error("Get Student Profile Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};



/**
 * @desc    Update logged-in student's profile
 * @route   PUT /api/student/profile
 * @access  Student only
 */
const updateStudentProfile = async (req, res) => {
  try {
    console.log("FILE RECEIVED:", req.file);   //Check
    console.log("BODY RECEIVED:", req.body);   //Check

    if (req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admins cannot update student profiles"
      });
    }

    const userId = req.user.userId;

    const existingProfile = await StudentProfile.findByUserId(userId);
    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found"
      });
    }

    const {
      first_name, last_name, dob, usn, aadhaar,
      address, phone, guardian_first_name, guardian_last_name,
      guardian_address, guardian_phone, reservation
    } = req.body;

    const age = dob ? calculateAge(dob) : existingProfile.age;

    // 🔥 PHOTO HANDLING (ASYNC DELETE)
    let photo_url = existingProfile.photo_url || null;

    if (req.file) {
      // delete old image async (non-blocking)
      deleteOldPhotoAsync(existingProfile.photo_url);

      // set new image url
      photo_url = `${BASE_URL}/uploads/${req.file.filename}`;
    }

    await StudentProfile.updateByUserId(userId, {
      first_name,
      last_name,
      dob,
      age,
      usn,
      aadhaar,
      photo_url,
      address,
      phone,
      guardian_first_name,
      guardian_last_name,
      guardian_address,
      guardian_phone,
      reservation
    });

    const updatedProfile = await StudentProfile.findByUserId(userId);

    return res.status(200).json({
      success: true,
      message: "Student profile updated successfully",
      data: updatedProfile
    });

  } catch (error) {
    console.error("Update Student Profile Error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      let message = "Duplicate data detected";
      if (error.message.includes("usn")) message = "USN already registered";
      if (error.message.includes("aadhaar")) message = "Aadhaar already registered";
      return res.status(409).json({ success: false, message });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


/**
 * @desc    Get all fees for logged-in student
 * @route   GET /api/student/fees
 * @access  Student
 */
const getMyFees = async (req, res) => {
  try {
    const userId = req.user.userId;

    const fees = await Fee.findByUser(userId);

    return res.status(200).json({
      success: true,
      data: fees
    });
  } catch (error) {
    console.error("Student Fees Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch fees"
    });
  }
};

/**
 * @desc    Get fee payment summary
 * @route   GET /api/student/fees/summary
 * @access  Student
 */
const getMyFeeSummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    const fees = await Fee.findByUser(userId);

    const summary = fees.reduce(
      (acc, fee) => {
        acc.total += Number(fee.amount);
        if (fee.status === "PAID") acc.paid += Number(fee.amount);
        else if (fee.status === "PARTIAL") acc.partiallyPaid += Number(fee.amount);
        else acc.pending += Number(fee.amount);
        return acc;
      },
      { total: 0, paid: 0, partiallyPaid: 0, pending: 0 }
    );

    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error("Fee Summary Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch fee summary"
    });
  }
};

module.exports = {
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile,
  getMyFees,
  getMyFeeSummary
};
