function getCookie(req, name) {
  const header = req.headers.cookie || '';
  const match = header.split(';').map((s) => s.trim()).find((s) => s.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

const SESSION_COOKIE = 'ggm_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function sessionCookieHeader(token) {
  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
}

function clearSessionCookieHeader() {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

module.exports = { getCookie, SESSION_COOKIE, SESSION_TTL_SECONDS, sessionCookieHeader, clearSessionCookieHeader };
