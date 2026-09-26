// Public base URL of the fysca_devasset server (no trailing slash).
window.FYSC_API_BASE = 'https://datafyscs9.lilianax.lol';

// Pages read channel data from the server's live endpoint. These keys are
// visible to anyone who opens the site, so they must be keys you are fine
// exposing (rotate them if they leak). Once the hosting server has
// /public/s9_data, switch this to FYSC_API_BASE + '/public/s9_data' and
// delete the keys.
window.FYSC_DATA_URL = window.FYSC_API_BASE + '/top50_youtube_hexzd/live?akey=API-_key-8UCD7P7h0IjG3rF9dfJ7ahY6pnVJOhnTFaAqogmKg&skey=KarFC9A5zo8LMBDyiCgzEJQMG3X5ermp43o4cjHwarAn50';
