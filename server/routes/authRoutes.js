const express = require('express');
const router = express.Router();
const { signup, verifyOtp } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);

module.exports = router;
