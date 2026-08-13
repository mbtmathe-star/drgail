const crypto = require('crypto');
const { Resend } = require('resend');

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

module.exports.config = { api: { bodyParser: false } };

function phpUrlEncode(str) {
  return encodeURIComponent(str)
    .replace(/%20/g, '+')
    .replace(/[!'()*~]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const rawBody = await readRawBody(req);
  const params = new URLSearchParams(rawBody);
  const received = Object.fromEntries(params.entries());
  const receivedSignature = received.signature;
  delete received.signature;

  const passphrase = process.env.PAYFAST_PASSPHRASE || '';
  const pairs = Object.entries(received)
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    .map(([k, v]) => `${k}=${phpUrlEncode(String(v).trim())}`);
  let str = pairs.join('&');
  if (passphrase) str += `&passphrase=${phpUrlEncode(passphrase)}`;
  const expectedSignature = crypto.createHash('md5').update(str).digest('hex');

  const validSignature = receivedSignature
    && receivedSignature.length === expectedSignature.length
    && crypto.timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(expectedSignature));

  if (!validSignature) {
    console.error('PayFast ITN signature mismatch', { received, receivedSignature, expectedSignature });
    res.status(400).end('Invalid signature');
    return;
  }

  if (received.payment_status === 'COMPLETE') {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'GGM Coaching Website <no-reply@email.drgail.co.za>',
        to: process.env.NOTIFY_EMAIL,
        subject: `PayFast payment received — R${received.amount_gross || received.amount || ''}`,
        text: [
          'A PayFast payment has been completed.',
          '',
          `Amount: R${received.amount_gross || received.amount || '(unknown)'}`,
          `Order reference: ${received.m_payment_id || '(none)'}`,
          `PayFast payment ID: ${received.pf_payment_id || '(unknown)'}`,
          `Name: ${[received.name_first, received.name_last].filter(Boolean).join(' ') || '(not provided)'}`,
          `Email: ${received.email_address || '(not provided)'}`,
          `Phone: ${received.custom_str4 || '(not provided)'}`,
          `Delivery preference: ${received.custom_str1 || '(not applicable)'}`,
          `Nearest PEP Store: ${received.custom_str2 || '(not provided)'}`,
          `Delivery/notes: ${received.custom_str3 || '(not provided)'}`,
        ].join('\n'),
      });
    } catch (err) {
      console.error('Failed to send PayFast payment notification email', err);
    }
  }

  res.status(200).end('OK');
};
