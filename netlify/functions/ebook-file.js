// Delivers an ebook file: checks the sign-up, counts the download and redirects to a
// signed Supabase Storage URL that is valid for 10 minutes.
// Old links keep serving the edition the person signed up for.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PAGES = { 'istio-hands-on': '/istio/' };
const EXT = { screen: 'pdf', epub: 'epub' };

const back = book => ({ statusCode: 302, headers: { Location: `${PAGES[book] || '/'}?expired=1` }, body: '' });

export const handler = async event => {
  const { id, f } = event.queryStringParameters || {};
  if (!id || !UUID.test(id) || !EXT[f]) return back();

  const { data: row } = await supabase.from('ebook_downloads').select('id, book, edition').eq('id', id).maybeSingle();
  if (!row) return back();

  // Same file name pattern the ebooks build uses: <slug>-<version>.<ext>.
  const name = `${row.book}-${row.edition}.${EXT[f]}`;
  const objectPath = `${row.book}/${row.edition}/${name}`;
  const { data: signed, error } = await supabase.storage.from('ebooks').createSignedUrl(objectPath, 600, { download: name });
  if (error || !signed) {
    console.error('ebook-file:', objectPath, error);
    return back(row.book);
  }

  await supabase.rpc('ebook_download_hit', { p_id: id, p_format: f });
  return { statusCode: 302, headers: { Location: signed.signedUrl, 'Cache-Control': 'no-store' }, body: '' };
};
