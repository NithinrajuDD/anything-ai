const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser, deleteUser, getStats } = require('../../controllers/adminController');
const { protect, restrictTo } = require('../../middleware/authMiddleware');
const { idValidator } = require('../../middleware/validators');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints
 */

router.use(protect, restrictTo('admin')); // all admin routes require admin role

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.patch('/users/:id', idValidator, updateUser);
router.delete('/users/:id', idValidator, deleteUser);

module.exports = router;
