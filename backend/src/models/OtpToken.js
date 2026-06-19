const mongoose = require('mongoose');

const otpTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, required: true, lowercase: true },
  // NOTE: In production, OTP should also be hashed (bcrypt/SHA-256) before storing
  otp: { type: String, required: true },
  purpose: { type: String, enum: ['email_verification', 'password_reset'], required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// TTL index: MongoDB auto-deletes expired OTPs
otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpTokenSchema.index({ email: 1, purpose: 1 });

module.exports = mongoose.model('OtpToken', otpTokenSchema);
