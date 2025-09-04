const jwt = require('jsonwebtoken');
const Token = require('../models/token');
const { Op } = require('sequelize');

const ACCESS_SECRET = process.env.ACCESS_SECRET || 'access_secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret';

function generateTokens(payload) {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken };
}

async function saveRefreshToken(userId, refreshToken, userAgent, ip) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней
  // const expiresAt = new Date(Date.now() + 10 * 1000); // 10 секунд
  return Token.create({
    user_id: userId,
    refresh_token: refreshToken,
    user_agent: userAgent,
    ip,
    expires_at: expiresAt
  });
}

async function removeRefreshToken(refreshToken) {
  return Token.destroy({ where: { refresh_token: refreshToken } });
}

async function findRefreshToken(refreshToken) {
  return Token.findOne({ where: { refresh_token: refreshToken, is_revoked: false, expires_at: { [Op.gt]: new Date() } } });
}

async function revokeAllUserTokens(userId) {
  return Token.update({ is_revoked: true }, { where: { user_id: userId } });
}

module.exports = {
  generateTokens,
  saveRefreshToken,
  removeRefreshToken,
  findRefreshToken,
  revokeAllUserTokens
}; 