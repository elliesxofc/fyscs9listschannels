# season1-status Worker

A small Cloudflare Worker that checks the Season 1 data API for the status
page (`views/status.html`), so the page calls this Worker instead of the
Season 1 server and the real Season 1 domain never reaches the browser.

`GET /s1-status` returns `{ "ok": true, "channels": 123 }`, or
`{ "ok": false, "error": "..." }` with HTTP 502 when Season 1 is down. Only
the channel count is returned, and only lilianax.lol may call it from a
browser (CORS). Results are cached for 30 seconds.

## Deploy

Needs Node.js 18+ and a free Cloudflare account.

1. In this folder, log in to Cloudflare:

   ```
   npx wrangler login
   ```

2. Store the Season 1 address as a secret (paste it when asked, e.g.
   `https://your-season1-host`, no trailing slash). It's saved in
   Cloudflare, not in this repo:

   ```
   npx wrangler secret put SEASON1_API_BASE
   ```

3. Deploy:

   ```
   npx wrangler deploy
   ```

   Wrangler prints the Worker's address, like
   `https://season1-status.<your-subdomain>.workers.dev`. Open
   `<that address>/s1-status` to check it returns a channel count.

4. Point the status page at it: set `window.FYSC_S1_STATUS_URL` in
   `views/config.js` to `<that address>/s1-status`.

## Keeping the domain secret

The current Season 1 domain is already in this repo's history and in other
public repos, so anyone can still find that one. To make it actually
secret, move Season 1 to a new domain and only ever give the new one to
`wrangler secret put` — never commit it.
