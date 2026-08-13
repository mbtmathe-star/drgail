const redis = require('./_lib/redis');
const { getCookie, SESSION_COOKIE, clearSessionCookieHeader } = require('./_lib/cookies');

module.exports = async (req, res) => {
  const sessionToken = getCookie(req, SESSION_COOKIE);
  if (sessionToken) {
    await redis.del(`session:${sessionToken}`);
  }
  res.setHeader('Set-Cookie', clearSessionCookieHeader());
  res.status(200).json({ ok: true });
};
