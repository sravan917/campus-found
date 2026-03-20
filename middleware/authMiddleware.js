const getAdmin = require('../config/firebase');
const User = require('../models/User');

/**
 * Verify Firebase ID token from the Authorization header.
 * Attaches req.user = { uid, email, role } on success.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized — no token provided',
      });
    }

    const token = authHeader.split(' ')[1];
    const admin = getAdmin();
    const decoded = await admin.auth().verifyIdToken(token);

    // Look up the user's role from our DB
    const user = await User.findOne({ userId: decoded.uid });

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: user ? user.role : 'user',
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized — invalid token',
    });
  }
};

module.exports = authMiddleware;
