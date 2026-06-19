const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth.controller');
const { registerValidator, loginValidator, resetPasswordValidator } = require('../validators/auth.validator');

router.post('/register', registerValidator, ctrl.register);
router.post('/verify-email', ctrl.verifyEmail);
router.post('/resend-otp', ctrl.resendOtp);
router.post('/login', loginValidator, ctrl.login);
router.post('/refresh-token', ctrl.refreshToken);
router.post('/logout', ctrl.logout);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', resetPasswordValidator, ctrl.resetPassword);

module.exports = router;
