const crypto = require('crypto');

// PayFast's signature uses PHP's urlencode() convention: spaces become '+',
// and !'()* are percent-encoded (encodeURIComponent leaves those alone).
function phpUrlEncode(str) {
  return encodeURIComponent(str)
    .replace(/%20/g, '+')
    .replace(/[!'()*~]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function buildSignature(fields, passphrase) {
  const pairs = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    .map(([k, v]) => `${k}=${phpUrlEncode(String(v).trim())}`);
  let str = pairs.join('&');
  if (passphrase) str += `&passphrase=${phpUrlEncode(passphrase)}`;
  return crypto.createHash('md5').update(str).digest('hex');
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

module.exports = async (req, res) => {
  const amountNum = Number(req.query.amount);
  if (!amountNum || amountNum <= 0) {
    res.status(400).end('Invalid amount');
    return;
  }
  const itemName = String(req.query.item || 'GGM Coaching order').slice(0, 100);
  const ref = String(req.query.ref || `GGM-${Date.now()}`).slice(0, 100);

  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passphrase = process.env.PAYFAST_PASSPHRASE || '';
  const sandbox = process.env.PAYFAST_MODE === 'sandbox';

  if (!merchantId || !merchantKey) {
    res.status(500).end('PayFast is not configured yet');
    return;
  }

  const fields = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: 'https://www.drgail.co.za/checkout.html?payfast=success',
    cancel_url: 'https://www.drgail.co.za/checkout.html?payfast=cancelled',
    notify_url: 'https://www.drgail.co.za/api/payfast-itn',
    m_payment_id: ref,
    amount: amountNum.toFixed(2),
    item_name: itemName,
  };

  const signature = buildSignature(fields, passphrase);
  const processUrl = sandbox
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';

  const inputs = Object.entries(fields)
    .map(([k, v]) => `<input type="hidden" name="${escapeHtml(k)}" value="${escapeHtml(v)}">`)
    .join('');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.status(200).end(`<!doctype html>
<html><head><meta charset="utf-8"><title>Redirecting to PayFast…</title></head>
<body onload="document.getElementById('pf').submit()">
<p>Redirecting you to PayFast to complete your payment… If nothing happens, <button type="submit" form="pf" style="border:0;background:none;color:blue;text-decoration:underline;cursor:pointer;padding:0;font:inherit">click here</button>.</p>
<form id="pf" action="${processUrl}" method="post">
${inputs}
<input type="hidden" name="signature" value="${escapeHtml(signature)}">
</form>
</body></html>`);
};
