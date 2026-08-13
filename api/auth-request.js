const crypto = require('crypto');
const { Resend } = require('resend');
const redis = require('./_lib/redis');

const ALLOWED_REDIRECTS = new Set(['checkout.html', 'cart.html']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  const redirect = ALLOWED_REDIRECTS.has(body.redirect) ? body.redirect : 'checkout.html';

  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  const throttleKey = `throttle:${email}`;
  const alreadySent = await redis.get(throttleKey);
  if (alreadySent) {
    res.status(200).json({ ok: true, message: 'A sign-in link was already sent — check your inbox (and spam folder).' });
    return;
  }

  const token = crypto.randomBytes(24).toString('hex');
  await redis.set(`login:${token}`, { email, redirect }, { ex: 900 }); // 15 minutes
  await redis.set(throttleKey, '1', { ex: 60 });

  const link = `https://www.drgail.co.za/api/auth-verify?token=${token}`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'GGM Coaching Website <no-reply@email.drgail.co.za>',
      to: email,
      subject: 'Your GGM Coaching sign-in link',
      text: [
        'Click the link below to sign in and continue to checkout:',
        '',
        link,
        '',
        "This link expires in 15 minutes. If you didn't request this, you can ignore this email.",
      ].join('\n'),
    });
  } catch (err) {
    console.error('Failed to send magic link email', err);
    res.status(500).json({ error: 'Could not send the sign-in email. Please try again shortly.' });
    return;
  }

  res.status(200).json({ ok: true, message: 'Check your email for a sign-in link.' });
};
