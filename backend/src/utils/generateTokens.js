const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Access token: short-lived (15 min), contains userId + role
const generateAccessToken = (userId, role) =>
  jwt.sign({ userId, role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

// Refresh token: random 64-byte hex string (stored as hash in DB)
const generateRefreshToken = () => crypto.randomBytes(64).toString('hex');

// Hash any raw token with SHA-256 before storing in DB
const hashToken = (rawToken) =>
  crypto.createHash('sha256').update(rawToken).digest('hex');

module.exports = { generateAccessToken, generateRefreshToken, hashToken };
