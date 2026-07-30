const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const ApiError = require('../utils/ApiError');
const {
  signAccessToken,
  generateRefreshToken,
  hashToken,
  refreshExpiryDate,
} = require('../utils/tokens');

const REFRESH_COOKIE = 'refreshToken';

function refreshCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    // The frontend proxies /api/* through its own domain (see frontend/vercel.json)
    // rather than calling Render directly, so this cookie is always same-site from
    // the browser's point of view - Lax is enough, and avoids SameSite=None cookies
    // getting silently dropped by third-party-cookie blocking (e.g. Incognito).
    sameSite: 'lax',
    path: '/api/auth',
    expires: refreshExpiryDate(),
  };
}

function clearRefreshCookie(res) {
  const opts = refreshCookieOptions();
  delete opts.expires;
  res.clearCookie(REFRESH_COOKIE, opts);
}

async function issueTokenPair(res, user) {
  const accessToken = signAccessToken(user);
  const refreshToken = generateRefreshToken();
  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: refreshExpiryDate(),
  });
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  return accessToken;
}

async function register(req, res) {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('Email is already registered');

  const user = await User.create({ name, email, password, role: 'member' });
  const accessToken = await issueTokenPair(res, user);
  res.status(201).json({ user: user.toSafeJSON(), accessToken });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  const accessToken = await issueTokenPair(res, user);
  res.json({ user: user.toSafeJSON(), accessToken });
}

async function refresh(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw ApiError.unauthorized('Missing refresh token');

  const tokenHash = hashToken(token);
  const stored = await RefreshToken.findOne({ tokenHash });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    if (stored) {
      // Reuse of a revoked/expired token - revoke the whole chain for safety.
      await RefreshToken.updateMany({ user: stored.user, revoked: false }, { revoked: true });
    }
    clearRefreshCookie(res);
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(stored.user);
  if (!user) throw ApiError.unauthorized('User no longer exists');

  const newRefreshToken = generateRefreshToken();
  stored.revoked = true;
  stored.replacedByHash = hashToken(newRefreshToken);
  await stored.save();

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: refreshExpiryDate(),
  });
  res.cookie(REFRESH_COOKIE, newRefreshToken, refreshCookieOptions());

  const accessToken = signAccessToken(user);
  res.json({ accessToken });
}

async function logout(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    await RefreshToken.updateOne({ tokenHash: hashToken(token) }, { revoked: true });
  }
  clearRefreshCookie(res);
  res.status(204).send();
}

async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.notFound('User not found');
  res.json({ user: user.toSafeJSON() });
}

module.exports = { register, login, refresh, logout, me };
