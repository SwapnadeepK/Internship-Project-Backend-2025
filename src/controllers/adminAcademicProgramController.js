const AcademicProgram = require("../models/academicProgramModel");
const StudentProfile = require("../models/studentProfileModel");

/**
 * @desc    Create academic program
 * @route   POST /api/admin/programs
 * @access  Admin only
 */
const createProgram = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Admin access only" });
    }

    const {
      degreeId,
      degree_name,
      department_name,
      batch_year,
      base_fees,
      total_semesters,
    } = req.body;

    if (
      !degreeId ||
      !degree_name ||
      !department_name ||
      !batch_year ||
      !base_fees ||
      !total_semesters
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const existing = await AcademicProgram.findByDegreeId(degreeId);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Program already exists",
      });
    }

    // ✅ Calculate semester fee
    const semester_fee = (Number(base_fees) / Number(total_semesters)).toFixed(2);

    await AcademicProgram.create({
      degreeId,
      degree_name,
      department_name,
      batch_year,
      base_fees,
      total_semesters,
      semester_fee,
    });

    return res.status(201).json({
      success: true,
      message: "Academic program created successfully",
    });
  } catch (error) {
    console.error("Create Program Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


/**
 * @desc    Get all academic programs
 * @route   GET /api/admin/programs
 * @access  Admin only
 */
const getAllPrograms = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Admin access only" });
    }

    const programs = await AcademicProgram.findAll();

    return res.status(200).json({
      success: true,
      data: programs
    });

  } catch (error) {
    console.error("Get Programs Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @desc    Update academic program safely
 * @route   PUT /api/admin/programs/:degreeId
 * @access  Admin only
 */
const updateProgram = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Admin access only" });
    }

    const { degreeId } = req.params;

    const program = await AcademicProgram.findByDegreeId(degreeId);
    if (!program) {
      return res.status(404).json({ success: false, message: "Program not found" });
    }

    // 🚫 Check if students exist
    const studentCount = await StudentProfile.countByDegreeId(degreeId);

    if (studentCount > 0) {
      const restrictedFields = ["total_semesters", "semester_fee"];
      for (const field of restrictedFields) {
        if (req.body[field] !== undefined) {
          return res.status(400).json({
            success: false,
            message: `Cannot modify ${field} after students are enrolled`
          });
        }
      }
    }

    await AcademicProgram.updateByDegreeId(degreeId, req.body);

    return res.status(200).json({
      success: true,
      message: "Academic program updated successfully"
    });

  } catch (error) {
    console.error("Update Program Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @desc    Delete academic program (safe)
 * @route   DELETE /api/admin/programs/:degreeId
 * @access  Admin only
 */
const deleteProgram = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Admin access only" });
    }

    const { degreeId } = req.params;

    const studentCount = await StudentProfile.countByDegreeId(degreeId);
    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete program with enrolled students"
      });
    }

    await AcademicProgram.deleteByDegreeId(degreeId);

    return res.status(200).json({
      success: true,
      message: "Academic program deleted successfully"
    });

  } catch (error) {
    console.error("Delete Program Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};



module.exports = {
  createProgram,
  getAllPrograms,
  updateProgram,
  deleteProgram
};
