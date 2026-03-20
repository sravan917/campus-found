const User = require('../models/User');

/**
 * POST /api/users/block/:uid
 * Block a user so they cannot interact with your posts
 */
exports.blockUser = async (req, res, next) => {
  try {
    const { uidToBlock } = req.params;
    
    // Prevent blocking yourself
    if (uidToBlock === req.user.uid) {
      return res.status(400).json({ success: false, message: 'You cannot block yourself' });
    }

    const currentUser = await User.findOne({ userId: req.user.uid });
    
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'Current user profile not found' });
    }

    // Add to array if not already there
    if (!currentUser.blockedUsers.includes(uidToBlock)) {
      currentUser.blockedUsers.push(uidToBlock);
      await currentUser.save();
    }

    res.status(200).json({
      success: true,
      message: 'User successfully blocked',
    });
  } catch (error) {
    next(error);
  }
};
