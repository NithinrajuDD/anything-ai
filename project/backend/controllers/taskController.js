const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *                 format: date
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Validation error
 */
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate, tags } = req.body;
  const task = await Task.create({
    title, description, status, priority, dueDate, tags,
    owner: req.user._id,
  });
  return ApiResponse.created(res, { task }, 'Task created successfully');
});

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get all tasks for current user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in-progress, done]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tasks
 */
const getTasks = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 10, status, priority, search,
    sortBy = 'createdAt', order = 'desc',
  } = req.query;

  // Build filter
  const filter = { owner: req.user._id, isArchived: false };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('owner', 'name email'),
    Task.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, tasks, page, limit, total);
});

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a single task
 *     tags: [Tasks]
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
 *         description: Task found
 *       404:
 *         description: Task not found
 */
const getTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findOne({
    _id: req.params.id,
    owner: req.user._id,
  }).populate('owner', 'name email');

  if (!task) return next(new AppError('Task not found', 404));
  return ApiResponse.success(res, { task });
});

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
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
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated
 *       404:
 *         description: Task not found
 */
const updateTask = asyncHandler(async (req, res, next) => {
  const allowed = ['title', 'description', 'status', 'priority', 'dueDate', 'tags'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    updates,
    { new: true, runValidators: true }
  );

  if (!task) return next(new AppError('Task not found', 404));
  return ApiResponse.success(res, { task }, 'Task updated successfully');
});

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
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
 *         description: Task deleted
 *       404:
 *         description: Task not found
 */
const deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });
  if (!task) return next(new AppError('Task not found', 404));
  return ApiResponse.success(res, null, 'Task deleted successfully');
});

// Stats endpoint
const getTaskStats = asyncHandler(async (req, res) => {
  const stats = await Task.aggregate([
    { $match: { owner: req.user._id, isArchived: false } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const priorityStats = await Task.aggregate([
    { $match: { owner: req.user._id, isArchived: false } },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);

  const total = await Task.countDocuments({ owner: req.user._id });

  return ApiResponse.success(res, { total, byStatus: stats, byPriority: priorityStats });
});

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask, getTaskStats };
