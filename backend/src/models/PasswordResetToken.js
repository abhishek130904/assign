const mongoose = require('mongoose');

const passwordResetTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tokenHash: { type: String, required: true }, // SHA-256 hash of raw reset token
  expiresAt: { type: Date, required: true },
  isUsed: { type: Boolean, default: false },
});

passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
passwordResetTokenSchema.index({ userId: 1 });

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
