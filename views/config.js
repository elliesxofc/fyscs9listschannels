// Public base URL of the fysca server (no trailing slash). The pages fetch
// channel data from its keyless /public/s9_data endpoint, so this site can be
// hosted as plain static files (GitHub Pages) on its own domain.
window.FYSC_API_BASE = 'https://privatedatafyscs9-2341.lilianax.lol';
window.FYSC_DATA_URL = window.FYSC_API_BASE + '/public/s9_data';

// Season 1 status check through the season1-status Cloudflare Worker
// (workers/season1-status), e.g. 'https://season1-status.<you>.workers.dev/s1-status'.
// Leave blank to check the Season 1 server directly.
window.FYSC_S1_STATUS_URL = '';
