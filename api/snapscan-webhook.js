const crypto = require('crypto');
const { Resend } = require('resend');

// SnapScan signs the raw POST body, so we must read it ourselves before any
// JSON/form parsing — the default Vercel body parser would only give us the
// already-parsed (and therefore un-verifiable) body.
module.exports.config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function isValidSignature(rawBody, authHeader, secret) {
  const prefix = 'SnapScan signature=';
  if (!authHeader || !authHeader.startsWith(prefix) || !secret) return false;

  const provided = Buffer.from(authHeader.slice(prefix.length), 'utf8');
  const expected = Buffer.from(
    crypto.createHmac('sha256', secret).update(rawBody).digest('hex'),
    'utf8'
  );
  return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const rawBody = await readRawBody(req);

  if (!isValidSignature(rawBody, req.headers['authorization'], process.env.SNAPSCAN_WEBHOOK_KEY)) {
    res.status(401).end('Invalid signature');
    return;
  }

  let payment;
  try {
    const params = new URLSearchParams(rawBody);
    payment = JSON.parse(params.get('payload'));
  } catch (err) {
    res.status(400).end('Bad payload');
    return;
  }

  if (payment && payment.status === 'completed') {
    const amount = (Number(payment.totalAmount || 0) / 100).toFixed(2);
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'GGM Coaching Website <no-reply@email.drgail.co.za>',
        to: process.env.NOTIFY_EMAIL,
        subject: `SnapScan payment received — R${amount}`,
        text: [
          'A SnapScan payment has been completed.',
          '',
          `Amount: R${amount}`,
          `Order reference: ${payment.merchantReference || '(none)'}`,
          `SnapScan payment ID: ${payment.id || '(unknown)'}`,
        ].join('\n'),
      });
    } catch (err) {
      console.error('Failed to send SnapScan payment notification email', err);
    }
  }

  // SnapScan requires a 200 response or it will retry for up to 3 minutes.
  res.status(200).end('OK');
};
