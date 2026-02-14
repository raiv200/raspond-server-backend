const jwt = require('jsonwebtoken');
const { JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY } = require('../config/constants');

function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRY });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRY });
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

function generateTokenPair(user) {
  const payload = { userId: user.id, email: user.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, generateTokenPair };
