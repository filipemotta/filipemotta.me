// Daily digest of new ebook sign-ups, sent to the author. Scheduled in netlify.toml
// (10:00 UTC = 07:00 in Brasília). Nothing is sent when there are no new sign-ups.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const OWNER_EMAIL = process.env.EBOOK_DIGEST_TO || 'filipemotta@gmail.com';
const FROM = process.env.EBOOK_FROM || 'Filipe Motta <contato@mail.devops-ai.com.br>';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function origin(r) {
  if (r.utm_source) return r.utm_source;
  if (!r.referrer) return 'direto';
  if (r.referrer.includes('linkedin')) return 'LinkedIn';
  if (r.referrer.includes('medium') || r.referrer.includes('itnext')) return 'Medium';
  if (r.referrer.includes('google')) return 'Google';
  try { return new URL(r.referrer).hostname; } catch { return r.referrer; }
}

export const handler = async () => {
  if (!RESEND_API_KEY) return { statusCode: 500, body: 'RESEND_API_KEY missing' };

  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const [{ data: rows, error }, { count: total }] = await Promise.all([
    supabase.from('ebook_downloads')
      .select('created_at, book, email, name, role, country, referrer, utm_source, marketing_consent')
      .gte('created_at', since).neq('email', OWNER_EMAIL).order('created_at'),
    supabase.from('ebook_downloads').select('id', { count: 'exact', head: true }).neq('email', OWNER_EMAIL),
  ]);
  if (error) {
    console.error('ebook-leads-digest:', error);
    return { statusCode: 500, body: 'could not read ebook_downloads' };
  }
  if (!rows.length) return { statusCode: 200, body: 'no new sign-ups' };

  const lines = rows.map(r => `<tr>
      <td style="padding:6px 8px">${esc(r.name)}<br><span style="color:#666">${esc(r.email)}</span></td>
      <td style="padding:6px 8px">${esc(r.book)}</td>
      <td style="padding:6px 8px">${esc(r.country || '?')}</td>
      <td style="padding:6px 8px">${esc(r.role || '-')}</td>
      <td style="padding:6px 8px">${esc(origin(r))}</td>
      <td style="padding:6px 8px">${r.marketing_consent ? 'sim' : 'não'}</td>
    </tr>`).join('');

  const html = `<div style="font-family:system-ui,sans-serif;font-size:14px;color:#111">
    <p><strong>${rows.length}</strong> cadastro(s) novo(s) nos ebooks do filipemotta.me nas últimas 24h. Total até agora: <strong>${total}</strong>.</p>
    <table style="border-collapse:collapse" border="1" cellspacing="0">
      <tr style="background:#f3f3f3"><th style="padding:6px 8px">Nome</th><th style="padding:6px 8px">Ebook</th><th style="padding:6px 8px">País</th><th style="padding:6px 8px">Cargo</th><th style="padding:6px 8px">Origem</th><th style="padding:6px 8px">Novidades</th></tr>
      ${lines}
    </table>
  </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: OWNER_EMAIL, subject: `Ebooks: ${rows.length} cadastro(s) novo(s) (total ${total})`, html }),
  });
  if (!res.ok) {
    console.error('ebook-leads-digest: Resend', res.status, await res.text());
    return { statusCode: 502, body: 'send failed' };
  }
  return { statusCode: 200, body: `sent: ${rows.length}` };
};
