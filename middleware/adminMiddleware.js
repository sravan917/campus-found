/**
 * Restrict route to admin users only.
 * Must be used AFTER authMiddleware.
 */
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Forbidden — admin access required',
  });
};

module.exports = adminMiddleware;
