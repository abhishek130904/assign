const User = require('../models/User');

// GET /api/user/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user); // password stripped by toJSON()
  } catch (err) { next(err); }
};
