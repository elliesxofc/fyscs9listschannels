// Cloudflare Worker that checks the Season 1 data API for the status page,
// so the page never has to know (or reveal) Season 1's real domain.
//
// GET /s1-status -> { "ok": true, "channels": 123 }
//                or { "ok": false, "error": "HTTP 502" } with a 502 status
//
// SEASON1_API_BASE (e.g. "https://your-season1-host", no trailing slash) is
// a Worker secret set with `wrangler secret put SEASON1_API_BASE` -- never
// put it in this file or wrangler.toml, since this repo is public.
// Only the channel count goes back to the browser, not the channel list,
// and the upstream error text is dropped so it can't echo the domain.

const ALLOWED_ORIGINS = ['https://lilianax.lol', 'https://www.lilianax.lol'];
const TIMEOUT_MS = 8000;
// Every status page visitor polls every 30s; caching the result at the
// edge for that long means Season 1 sees about one request per 30s per
// Cloudflare location, however many people have the page open.
const CACHE_SECONDS = 30;

function corsHeaders(request) {
  const origin = request.headers.get('Origin');
  return ALLOWED_ORIGINS.includes(origin)
    ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' }
    : { Vary: 'Origin' };
}

function json(body, status, request, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request), ...extraHeaders },
  });
}

async function checkSeason1(env) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(env.SEASON1_API_BASE + '/public/s1_data', { signal: controller.signal });
    if (!res.ok) return { ok: false, error: 'HTTP ' + res.status };
    const data = await res.json();
    if (!Array.isArray(data)) return { ok: false, error: 'Unexpected response shape' };
    return { ok: true, channels: data.length };
  } catch (err) {
    return { ok: false, error: err.name === 'AbortError' ? 'Timed out' : 'Unreachable' };
  } finally {
    clearTimeout(timer);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: { ...corsHeaders(request), 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Max-Age': '86400' },
      });
    }

    if (request.method !== 'GET' || url.pathname !== '/s1-status') {
      return json({ ok: false, error: 'Not found' }, 404, request);
    }

    if (!env.SEASON1_API_BASE) {
      return json({ ok: false, error: 'Not configured' }, 500, request);
    }

    // Cache by path only, so the cached body is shared across origins;
    // CORS headers are added per request below.
    const cache = caches.default;
    const cacheKey = new Request(url.origin + '/s1-status');
    let result;
    const cached = await cache.match(cacheKey);
    if (cached) {
      result = await cached.json();
    } else {
      result = await checkSeason1(env);
      ctx.waitUntil(cache.put(cacheKey, new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=' + CACHE_SECONDS },
      })));
    }

    return json(result, result.ok ? 200 : 502, request, { 'Cache-Control': 'no-store' });
  },
};
