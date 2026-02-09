module.exports = (req, res, next) => {
  const forbiddenFields = [
    "degree",
    "degreeId",
    "department",
    "batch_year",
    "email"
  ];

  const sentFields = Object.keys(req.body);

  const invalid = sentFields.filter(f => forbiddenFields.includes(f));

  if (invalid.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Forbidden fields in update: ${invalid.join(", ")}`
    });
  }

  next();
};
