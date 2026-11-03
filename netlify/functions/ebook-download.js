// Sign-up for a free ebook. Stores the request in public.ebook_downloads (Supabase)
// and sends the download links by email only, so a fake address never gets the book.
// Based on the free-book flow of devops-ai.tech, in its own table.

import crypto from 'node:crypto';
import { promises as dns } from 'node:dns';
import { createClient } from '@supabase/supabase-js';
import istioHandsOn from './ebooks/istio-hands-on.json' with { type: 'json' };

// Static imports so the bundler ships each manifest with the function.
const EBOOKS = {
  'istio-hands-on': {
    edition: istioHandsOn,
    page: 'https://filipemotta.me/istio/',
    blurb: 'Six chapters on running Istio in production, from the first route to GKE and EKS in one mesh, each proved in a lab you can run.',
  },
};

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EBOOK_FROM || 'Filipe Motta <contato@mail.devops-ai.com.br>';

const ROLES = ['devops-sre', 'platform', 'dev', 'cloud-architect', 'security', 'manager', 'student', 'other'];
const MAX_PER_IP_PER_HOUR = 5;
const EMAIL_COOLDOWN_MIN = 10;

const headers = {
  'Access-Control-Allow-Origin': 'https://filipemotta.me',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};
const reply = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });

// Same mailbox, same key: no +tag and, on Gmail, no dots.
function emailKey(email) {
  let [local, domain] = email.split('@');
  local = local.split('+')[0];
  if (domain === 'googlemail.com') domain = 'gmail.com';
  if (domain === 'gmail.com') local = local.replace(/\./g, '');
  return `${local}@${domain}`;
}

// The name only goes into the email when it looks like a name: letters, spaces, hyphen, apostrophe.
function safeName(name) {
  const n = (name || '').normalize('NFC').trim().slice(0, 40);
  return /^[\p{L}][\p{L} '\-]*$/u.test(n) ? n : '';
}
const clip = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : null) || null;

// A domain without MX (or A, the implicit MX) does not receive email. DNS errors other
// than "does not exist" let the request through, so real people are not blocked.
async function domainReceivesMail(email) {
  const domain = email.split('@')[1];
  const gone = e => ['ENOTFOUND', 'ENODATA', 'ESERVFAIL'].includes(e.code);
  try {
    const mx = await dns.resolveMx(domain);
    return mx.some(r => r.exchange && r.exchange !== '.');
  } catch (e) {
    if (!gone(e)) return true;
  }
  try { return (await dns.resolve4(domain)).length > 0; } catch (e) { return !gone(e); }
}

const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function emailHtml(book, name, links) {
  const v = book.edition.version.replace('v', '');
  const label = { screen: `PDF (${book.edition.files.screen.pages} pages)`, epub: 'EPUB (Kindle, Kobo, Apple Books)' };
  const items = ['screen', 'epub'].filter(f => links[f])
    .map(f => `<tr><td style="padding:10px 0;border-top:1px solid #e5e7eb;"><a href="${links[f]}" style="color:#0284c7;font-weight:600;text-decoration:none;">${label[f]}</a></td></tr>`)
    .join('');
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;color:#0a0a0a;padding:36px 28px;border:1px solid #e5e7eb;border-radius:12px;">
    <p style="font:600 12px ui-monospace,Menlo,monospace;letter-spacing:.1em;text-transform:uppercase;color:#0284c7;margin:0 0 14px;">Free ebook</p>
    <h1 style="font-size:22px;margin:0 0 12px;">Hi${name ? ' ' + escapeHtml(name) : ''}!</h1>
    <p style="font-size:16px;line-height:1.6;color:#374151;margin:0 0 18px;">Here is <strong>${escapeHtml(book.edition.title)}</strong>, edition ${v}. ${book.blurb} The links keep working, so feel free to keep this email.</p>
    <table style="width:100%;border-collapse:collapse;font-size:16px;margin:0 0 24px;">${items}</table>
    <p style="font-size:15px;line-height:1.6;color:#374151;margin:0 0 8px;">Every chapter points to its companion repository. Run the lab before you change a production mesh.</p>
    <p style="font-size:12px;line-height:1.5;color:#6b7280;margin:28px 0 0;">You received this email because you requested the ebook at <a href="${book.page}" style="color:#6b7280;">${book.page.replace('https://', '')}</a>.</p>
  </div>`;
}

export const handler = async event => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return reply(405, { error: 'Method not allowed' });

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return reply(400, { error: 'Bad request' }); }
  const book = EBOOKS[body.book];
  if (!book) return reply(400, { error: 'Unknown ebook.' });

  // Hidden field: bots fill it in, people do not.
  if (body.website) return reply(200, { ok: true });

  const email = clip(body.email, 254)?.toLowerCase();
  const name = clip(body.name, 120);
  if (!email || !name) return reply(400, { error: 'Please fill in your name and email.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(400, { error: 'Invalid email.' });
  if (!(await domainReceivesMail(email))) return reply(400, { error: 'That domain does not receive email. Check the address: the links only arrive by email.' });

  const h = event.headers || {};
  // Only the header Netlify sets; x-forwarded-for can be forged by the client.
  const ip = (h['x-nf-client-connection-ip'] || '').trim();
  const row = {
    book: body.book,
    edition: book.edition.version,
    email,
    email_key: emailKey(email),
    name,
    role: ROLES.includes(body.role) ? body.role : null,
    source: clip(body.source, 80),
    utm_source: clip(body.utm_source, 120),
    utm_medium: clip(body.utm_medium, 120),
    utm_campaign: clip(body.utm_campaign, 120),
    referrer: clip(body.referrer, 500),
    country: clip(h['x-country'], 8),
    user_agent: clip(h['user-agent'], 400),
    ip_hash: ip ? crypto.createHash('sha256').update(ip + (process.env.SUPABASE_URL || '')).digest('hex') : null,
    marketing_consent: body.marketing_consent === true,
  };

  try {
    // Rate limits and the insert run together in the database, with no race between requests.
    const { data: reg, error } = await supabase.rpc('ebook_download_register', {
      p_row: row, p_max_per_ip_hour: MAX_PER_IP_PER_HOUR, p_email_cooldown_min: EMAIL_COOLDOWN_MIN,
    }).single();
    if (error) throw error;
    if (reg.limited) return reply(429, { error: 'Too many requests. Please try again later.' });

    // One email per address every EMAIL_COOLDOWN_MIN minutes; inside that window the page
    // only asks to check the inbox, because the previous email is already on its way.
    if (reg.send_email) {
      if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY missing');
      const base = 'https://filipemotta.me/.netlify/functions/ebook-file';
      const links = Object.fromEntries(Object.keys(book.edition.files).map(f => [f, `${base}?id=${reg.id}&f=${f}`]));
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM,
          to: email,
          subject: `Your ebook: ${book.edition.title} (edition ${book.edition.version.replace('v', '')})`,
          html: emailHtml(book, safeName(name), links),
        }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
    }
    return reply(200, { ok: true });
  } catch (e) {
    console.error('ebook-download:', e);
    return reply(500, { error: 'We could not complete your request. Please try again.' });
  }
};
