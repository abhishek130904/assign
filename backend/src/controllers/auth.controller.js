const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const OtpToken = require('../models/OtpToken');
const RefreshToken = require('../models/RefreshToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const generateOtp = require('../utils/generateOtp');
const { generateAccessToken, generateRefreshToken, hashToken } = require('../utils/generateTokens');
const { sendOtpEmail, sendPasswordResetEmail } = require('../utils/sendEmail');

// Helper: send validation errors
const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      // Unverified: delete old OTPs and resend
      await OtpToken.deleteMany({ email, purpose: 'email_verification' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = existingUser || new User({ name, email, password: hashedPassword });
    if (!existingUser) await user.save();

    const otp = generateOtp();
    await OtpToken.create({
      userId: user._id,
      email,
      otp,
      purpose: 'email_verification',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    });

    await sendOtpEmail(email, otp);
    // NEVER return OTP in response
    res.status(201).json({ message: 'Registration successful. Check your email for OTP.' });
  } catch (err) { next(err); }
};

// POST /api/auth/verify-email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const otpDoc = await OtpToken.findOne({
      email: email.toLowerCase(),
      purpose: 'email_verification',
      expiresAt: { $gt: new Date() },
    });
    if (!otpDoc) return res.status(400).json({ error: 'Invalid or expired OTP' });
    if (otpDoc.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

    const user = await User.findOneAndUpdate({ email: email.toLowerCase() }, { isEmailVerified: true }, { new: true });
    await OtpToken.deleteMany({ email: email.toLowerCase(), purpose: 'email_verification' });

    const accessToken = generateAccessToken(user._id, user.role);
    const rawRefreshToken = generateRefreshToken();

    // Store hashed refresh token in DB (7-day expiry)
    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(rawRefreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({
      message: 'Email verified successfully',
      accessToken,
      refreshToken: rawRefreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified }
    });
  } catch (err) { next(err); }
};

// POST /api/auth/verify-login
exports.verifyLogin = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const otpDoc = await OtpToken.findOne({
      email: email.toLowerCase(),
      purpose: 'login_mfa',
      expiresAt: { $gt: new Date() },
    });
    if (!otpDoc) return res.status(400).json({ error: 'Invalid or expired OTP' });
    if (otpDoc.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.isActive) return res.status(401).json({ error: 'User not found or inactive' });

    await OtpToken.deleteMany({ email: email.toLowerCase(), purpose: 'login_mfa' });

    const accessToken = generateAccessToken(user._id, user.role);
    const rawRefreshToken = generateRefreshToken();

    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(rawRefreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({
      accessToken,
      refreshToken: rawRefreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified }
    });
  } catch (err) { next(err); }
};

// POST /api/auth/resend-otp
exports.resendOtp = async (req, res, next) => {
  try {
    const { email, purpose } = req.body;
    // Rate limit: max 3 OTPs per hour per email
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const count = await OtpToken.countDocuments({ email: email.toLowerCase(), purpose, createdAt: { $gt: oneHourAgo } });
    if (count >= 3) return res.status(429).json({ error: 'Too many OTP requests. Try again in an hour.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ message: 'OTP sent' }); // Don't reveal user existence

    await OtpToken.deleteMany({ email: email.toLowerCase(), purpose });
    const otp = generateOtp();
    await OtpToken.create({
      userId: user._id, email: email.toLowerCase(), otp, purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await sendOtpEmail(email, otp);
    res.json({ message: 'OTP sent' });
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.isEmailVerified) return res.status(403).json({ error: 'Please verify your email first' });
    if (!user.isActive) return res.status(403).json({ error: 'Account deactivated' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    // If it's the admin, bypass MFA OTP to keep admin panel integration simple
    if (user.role === 'admin') {
      const accessToken = generateAccessToken(user._id, user.role);
      const rawRefreshToken = generateRefreshToken();

      await RefreshToken.create({
        userId: user._id,
        tokenHash: hashToken(rawRefreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return res.json({
        accessToken,
        refreshToken: rawRefreshToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified },
      });
    }

    // Generate login OTP for regular users
    const otp = generateOtp();
    await OtpToken.deleteMany({ email: user.email.toLowerCase(), purpose: 'login_mfa' });
    await OtpToken.create({
      userId: user._id,
      email: user.email.toLowerCase(),
      otp,
      purpose: 'login_mfa',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    });

    await sendOtpEmail(user.email, otp);

    res.json({
      requiresOtp: true,
      email: user.email,
      message: 'OTP sent to your email. Please verify to complete login.'
    });
  } catch (err) { next(err); }
};

// POST /api/auth/refresh-token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    const tokenHash = hashToken(refreshToken);
    const tokenDoc = await RefreshToken.findOne({ tokenHash, isRevoked: false, expiresAt: { $gt: new Date() } });
    if (!tokenDoc) return res.status(401).json({ error: 'Invalid or expired refresh token' });

    const user = await User.findById(tokenDoc.userId);
    if (!user || !user.isActive) return res.status(401).json({ error: 'User not found or inactive' });

    // Token rotation: revoke old, issue new
    tokenDoc.isRevoked = true;
    await tokenDoc.save();

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRawRefreshToken = generateRefreshToken();
    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(newRawRefreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({ accessToken: newAccessToken, refreshToken: newRawRefreshToken });
  } catch (err) { next(err); }
};

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await RefreshToken.findOneAndUpdate({ tokenHash }, { isRevoked: true });
    }
    res.json({ message: 'Logged out' });
  } catch (err) { next(err); }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    // Always return 200 — don't reveal if email exists
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (user) {
      const rawToken = require('crypto').randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      await PasswordResetToken.create({
        userId: user._id, tokenHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });
      const deepLink = `yourapp://reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
      const webLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
      await sendPasswordResetEmail(email, deepLink, webLink);
    }
    res.json({ message: 'If this email is registered, you will receive a reset link.' });
  } catch (err) { next(err); }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const { email, token, newPassword } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });

    const tokenHash = hashToken(token);
    const resetDoc = await PasswordResetToken.findOne({
      userId: user._id, tokenHash, isUsed: false, expiresAt: { $gt: new Date() },
    });
    if (!resetDoc) return res.status(400).json({ error: 'Invalid or expired reset token' });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    resetDoc.isUsed = true;
    await resetDoc.save();

    // Revoke all refresh tokens for security
    await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });

    res.json({ message: 'Password reset successful' });
  } catch (err) { next(err); }
};
