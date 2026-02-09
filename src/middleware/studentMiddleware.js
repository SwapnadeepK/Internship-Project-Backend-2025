const studentMiddleware = (req, res, next) => {
  if (req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Admins are not allowed to access student routes"
    });
  }
  next();
};

module.exports = studentMiddleware;
