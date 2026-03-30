const express = require('express');
const router = express.Router();
const { register, login, refreshToken, getMe } = require('../../controllers/authController');
const { protect } = require('../../middleware/authMiddleware');
const { registerValidator, loginValidator } = require('../../middleware/validators');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration and login
 */

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);

module.exports = router;
