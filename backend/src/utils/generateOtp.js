const crypto = require('crypto');

// Returns a 6-digit OTP string
const generateOtp = () => crypto.randomInt(100000, 999999).toString();

module.exports = generateOtp;
