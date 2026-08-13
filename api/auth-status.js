const redis = require('./_lib/redis');
const { getCookie, SESSION_COOKIE } = require('./_lib/cookies');

module.exports = async (req, res) => {
  const sessionToken = getCookie(req, SESSION_COOKIE);
  if (!sessionToken) {
    res.status(200).json({ loggedIn: false });
    return;
  }
  const email = await redis.get(`session:${sessionToken}`);
  if (!email) {
    res.status(200).json({ loggedIn: false });
    return;
  }
  res.status(200).json({ loggedIn: true, email });
};
