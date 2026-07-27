const { Resend } = require('resend');

const ALLOWED_REDIRECTS = [
  'index.html?submitted=1',
  'about.html?submitted=1',
  'coaching.html?submitted=1',
  'books.html?submitted=1',
  'speaking.html?submitted=1',
  'speaking.html?submitted=1#booking-form',
  'contact.html?submitted=1',
  'cart.html?submitted=1',
  'checkout.html?submitted=1',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(302, { Location: '/contact.html' });
    res.end();
    return;
  }

  const body = req.body || {};

  // Honeypot: bots often fill hidden fields.
  if (body.website) {
    res.status(204).end();
    return;
  }

  const formType = String(body.form_type || 'GGM Coaching website enquiry').trim();
  let redirect = String(body.redirect || 'contact.html?submitted=1').trim();
  if (!ALLOWED_REDIRECTS.includes(redirect)) {
    redirect = 'contact.html?submitted=1';
  }

  const fields = [];
  let replyTo = '';
  for (const [key, value] of Object.entries(body)) {
    if (key === 'website' || key === 'form_type' || key === 'redirect') continue;
    const label = key.replace(/[^a-zA-Z0-9 _&+-]/g, '') || 'Field';
    const clean = Array.isArray(value) ? value.map(String).join(', ') : String(value).trim();
    fields.push(`${label}:\n${clean}`);
    if (label.toLowerCase() === 'email' && EMAIL_RE.test(clean)) {
      replyTo = clean;
    }
  }

  const subject = formType.replace(/[\r\n]+/g, ' ');
  const text = `A new enquiry was submitted through Drgail.co.za.\n\n${fields.join('\n\n')}`;

  let status = 'sent';
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: 'GGM Coaching Website <no-reply@drgail.co.za>',
      to: process.env.NOTIFY_EMAIL,
      subject,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    });
    if (result.error) {
      console.error('Resend rejected the enquiry email', result.error);
      status = 'failed';
    }
  } catch (err) {
    console.error('Failed to send enquiry email', err);
    status = 'failed';
  }

  const hashIndex = redirect.indexOf('#');
  const path = hashIndex === -1 ? redirect : redirect.slice(0, hashIndex);
  const fragment = hashIndex === -1 ? '' : redirect.slice(hashIndex);
  const separator = path.includes('?') ? '&' : '?';
  res.writeHead(302, { Location: `/${path}${separator}status=${status}${fragment}` });
  res.end();
};
