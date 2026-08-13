const crypto = require('crypto');
const redis = require('./_lib/redis');
const { sessionCookieHeader, SESSION_TTL_SECONDS } = require('./_lib/cookies');

const ALLOWED_REDIRECTS = new Set(['checkout.html', 'cart.html']);

module.exports = async (req, res) => {
  const token = String(req.query.token || '');
  if (!token) {
    res.writeHead(302, { Location: '/login.html?error=missing_token' });
    res.end();
    return;
  }

  const data = await redis.get(`login:${token}`);
  if (!data) {
    res.writeHead(302, { Location: '/login.html?error=expired' });
    res.end();
    return;
  }

  await redis.del(`login:${token}`); // one-time use

  const { email, redirect } = data;
  const sessionToken = crypto.randomBytes(24).toString('hex');
  await redis.set(`session:${sessionToken}`, email, { ex: SESSION_TTL_SECONDS });

  const safeRedirect = ALLOWED_REDIRECTS.has(redirect) ? redirect : 'checkout.html';
  res.setHeader('Set-Cookie', sessionCookieHeader(sessionToken));
  res.writeHead(302, { Location: `/${safeRedirect}?loggedin=1` });
  res.end();
};
