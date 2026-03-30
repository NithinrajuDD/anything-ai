const User = require('../models/User');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Admin access required
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, users, page, limit, total);
});

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   patch:
 *     summary: Update user role or status (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated
 */
const updateUser = asyncHandler(async (req, res, next) => {
  // Prevent admin from demoting themselves
  if (req.params.id === req.user._id.toString()) {
    return next(new AppError("You cannot modify your own admin account.", 400));
  }

  const allowed = ['role', 'isActive'];
  const updates = {};
  allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true, runValidators: true,
  });
  if (!user) return next(new AppError('User not found', 404));
  return ApiResponse.success(res, { user }, 'User updated');
});

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
const deleteUser = asyncHandler(async (req, res, next) => {
  if (req.params.id === req.user._id.toString()) {
    return next(new AppError("You cannot delete your own account.", 400));
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError('User not found', 404));
  // Also delete their tasks
  await Task.deleteMany({ owner: req.params.id });
  return ApiResponse.success(res, null, 'User and their tasks deleted');
});

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get platform statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform statistics
 */
const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalTasks, tasksByStatus, recentUsers] = await Promise.all([
    User.countDocuments(),
    Task.countDocuments(),
    Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
  ]);

  return ApiResponse.success(res, {
    totalUsers,
    totalTasks,
    tasksByStatus,
    recentUsers,
  });
});

module.exports = { getAllUsers, updateUser, deleteUser, getStats };
