// Public base URL the pages talk to (no trailing slash): the grind proxy in
// front of the fysca server, so the server's own address never reaches the
// browser. The proxy only forwards an allowlist of read-only and logged-in
// routes -- none of the count-changing admin or Nightbot routes. The pages
// fetch channel data from its keyless /public/s9_data endpoint, so this site
// can be hosted as plain static files (GitHub Pages) on its own domain.
window.FYSC_API_BASE = 'https://grindapi.lilianax.lol';
window.FYSC_DATA_URL = window.FYSC_API_BASE + '/public/s9_data';

// Season 1 status check through the season1-status Cloudflare Worker
// (workers/season1-status), e.g. 'https://season1-status.<you>.workers.dev/s1-status'.
// Leave blank to check the Season 1 server directly.
window.FYSC_S1_STATUS_URL = '';
