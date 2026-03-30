const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword } = require('../../controllers/userController');
const { protect } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management
 */

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
