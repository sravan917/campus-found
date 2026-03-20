const User = require('../models/User');

/**
 * POST /api/auth/register
 * Register or update a user from Firebase token payload.
 */
exports.registerOrLogin = async (req, res, next) => {
  try {
    const { uid, email } = req.user;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    let user = await User.findOne({ userId: uid });

    if (user) {
      // Update name if changed
      user.name = name;
      await user.save();
    } else {
      user = await User.create({
        userId: uid,
        name,
        email,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/profile
 * Return current user profile.
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.user.uid });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
