const StudentProfile = require("../models/studentProfileModel");

const lockDegreeForStudents = async (req, res, next) => {
  if (req.user.isAdmin) {
    return next(); // ✅ Admin allowed
  }

  const userId = req.user.userId;
  const profile = await StudentProfile.findByUserId(userId);

  if (profile && profile.degreeId) {
    return res.status(403).json({
      success: false,
      message: "Degree change is restricted to admin only"
    });
  }

  next();
};

module.exports = lockDegreeForStudents;
