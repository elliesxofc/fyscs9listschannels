const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

// No dotenv dependency available in this environment, so .env is parsed by hand.
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(path.join(__dirname, '.env'));

const PORT = process.env.PORT || 4000;
const DATA_API_URL = process.env.DATA_API_URL || 'http://127.0.0.1:5213/top50_youtube_hexzd/live';
const AKEY = process.env.AKEY;
const SKEY = process.env.SKEY;
const VIEWS_DIR = path.join(__dirname, 'views');

// When a channel joined FYSC. The upstream top50_youtube_hexzd feed has no
// such field -- it's recorded by fysca_devasset's !add2 chat command into its
// own channelJoinLog.json (keyed by cid, `{ cid, cname, joinedAt }`), so that
// file is read directly rather than duplicating the data here.
const JOINED_DATES_PATH = path.join(__dirname, '..', 'fysca_devasset', 'channelJoinLog.json');
function loadJoinedDates() {
  try {
    return JSON.parse(fs.readFileSync(JOINED_DATES_PATH, 'utf8'));
  } catch {
    return {};
  }
}

const app = express();
app.use(cors());
app.use('/themes', express.static(path.join(VIEWS_DIR, 'themes')));

// The pages now fetch from fysca's public /public/s9_data (base URL set in
// config.js) so they also work as a static GitHub Pages site. This server is
// kept as a self-hosted fallback and still serves /s9_data below.
app.get('/config.js', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'config.js'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'index.html'));
});

app.get('/select', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'index.html'));
});

app.get('/season9/fyscchannels', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'season9', 'fyscchannels.html'));
});

app.get('/season9/subs', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'season9', 'subs.html'));
});

app.get('/socials', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'socials.html'));
});

app.get('/status', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'status.html'));
});

// Field names on the upstream top50_youtube_hexzd feed aren't confirmed yet,
// so a few common aliases are accepted until the real shape is verified.
function normalizeChannel(raw) {
  return {
    cname: raw.cname ?? raw.channelName ?? raw.name ?? raw.title ?? 'Unknown channel',
    cid: raw.cid ?? raw.channelId ?? raw.id ?? '',
    subscriberCountRealAPI: Number(
      raw.subscriberCountRealAPI ?? raw.subscriberCount ?? raw.subscribers ?? raw.subCount ?? 0
    ),
    cimage: raw.cimage ?? raw.channelImage ?? raw.avatar ?? raw.image ?? raw.thumbnail ?? null,
  };
}

app.get('/s9_data', async (req, res) => {
  try {
    const response = await axios.get(DATA_API_URL, {
      params: { akey: AKEY, skey: SKEY },
    });

    const rawChannels = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.channels)
        ? response.data.channels
        : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

    const joinedDates = loadJoinedDates();
    res.json(rawChannels.map(normalizeChannel).map(channel => ({
      ...channel,
      joinedFysc: joinedDates[channel.cid]?.joinedAt ?? null,
    })));
  } catch (err) {
    console.error('Failed to fetch /s9_data from upstream:', err.message);
    res.status(502).json({ error: 'Failed to reach the channel data source.' });
  }
});

app.listen(PORT, () => {
  console.log(`fyscs9listchannels server running at http://localhost:${PORT}`);
});
