const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', isActive = '' } = req.query;
    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    if (role) query.role = role;
    if (isActive !== '') query.isActive = isActive === 'true';

    const [users, total] = await Promise.all([
      User.find(query)
        .select('name email role isEmailVerified isActive createdAt')
        .skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);
    res.json({ users, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/admin/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const activeTokenCount = await RefreshToken.countDocuments({ userId: user._id, isRevoked: false, expiresAt: { $gt: new Date() } });
    res.json({ ...user.toJSON(), activeRefreshTokens: activeTokenCount });
  } catch (err) { next(err); }
};

// PATCH /api/admin/users/:id/toggle-active
exports.toggleActive = async (req, res, next) => {
  try {
    if (req.params.id === req.user.userId) return res.status(400).json({ error: 'Cannot deactivate yourself' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    // Revoke all sessions on deactivation
    if (!user.isActive) {
      await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });
    }
    res.json(user);
  } catch (err) { next(err); }
};

// PATCH /api/admin/users/:id/change-role
exports.changeRole = async (req, res, next) => {
  try {
    if (req.params.id === req.user.userId) return res.status(400).json({ error: 'Cannot change your own role' });
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

// GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const last7 = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const last30 = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, verifiedUsers, activeUsers, adminCount, newLast7, newLast30, activeTokens] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isEmailVerified: true }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ createdAt: { $gt: last7 } }),
      User.countDocuments({ createdAt: { $gt: last30 } }),
      RefreshToken.countDocuments({ isRevoked: false, expiresAt: { $gt: now } }),
    ]);

    res.json({ totalUsers, verifiedUsers, activeUsers, adminCount, newUsersLast7Days: newLast7, newUsersLast30Days: newLast30, totalActiveRefreshTokens: activeTokens });
  } catch (err) { next(err); }
};
