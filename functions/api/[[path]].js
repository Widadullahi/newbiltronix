const API_ORIGIN = 'https://biltronix.onrender.com';

export async function onRequest({ request }) {
  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(incomingUrl.pathname + incomingUrl.search, API_ORIGIN);
  const headers = new Headers(request.headers);

  // The browser calls this function on the same origin. Do not forward its
  // Origin header to the existing API, which only allows its previous hosts.
  headers.delete('origin');
  headers.delete('referer');
  headers.delete('host');

  const upstreamRequest = new Request(upstreamUrl, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'follow',
  });

  return fetch(upstreamRequest);
}
