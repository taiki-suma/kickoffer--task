// Cloudflare Pages Function — Notion API Proxy
// /api/notion/* → https://api.notion.com/v1/*

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization,Content-Type,Notion-Version',
};

export async function onRequest(context) {
  const { request } = context;

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }

  const url = new URL(request.url);
  const notionPath = url.pathname.replace('/api/notion', '') || '/';
  const notionUrl  = `https://api.notion.com/v1${notionPath}${url.search}`;

  const body = ['POST', 'PATCH', 'PUT'].includes(request.method)
    ? await request.text()
    : undefined;

  const response = await fetch(notionUrl, {
    method:  request.method,
    headers: {
      'Authorization':  request.headers.get('Authorization')  || '',
      'Notion-Version': request.headers.get('Notion-Version') || '2022-06-28',
      'Content-Type':   'application/json',
    },
    body,
  });

  return new Response(await response.text(), {
    status:  response.status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}
