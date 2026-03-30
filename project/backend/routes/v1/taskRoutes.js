const express = require('express');
const router = express.Router();
const {
  createTask, getTasks, getTask, updateTask, deleteTask, getTaskStats
} = require('../../controllers/taskController');
const { protect } = require('../../middleware/authMiddleware');
const { taskCreateValidator, taskUpdateValidator, idValidator } = require('../../middleware/validators');

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management (CRUD)
 */

router.use(protect); // all task routes require auth

router.route('/')
  .get(getTasks)
  .post(taskCreateValidator, createTask);

router.get('/stats', getTaskStats);

router.route('/:id')
  .get(idValidator, getTask)
  .put(idValidator, taskUpdateValidator, updateTask)
  .delete(idValidator, deleteTask);

module.exports = router;
