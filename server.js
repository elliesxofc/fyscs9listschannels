const path = require('path');
const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 4000;
const VIEWS_DIR = path.join(__dirname, 'views');

const app = express();
app.use(cors());
app.use('/themes', express.static(path.join(VIEWS_DIR, 'themes')));

// The FYSC channel list, live subcount, and grinding pages now live at
// fysc.lilianax.lol (separate repo: fyscchannels) since GitHub Pages only
// supports one custom domain per repo. This server only serves the main
// site's own pages now.
app.get('/config.js', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'config.js'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'index.html'));
});

app.get('/socials', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'socials.html'));
});

app.get('/status', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'status.html'));
});

app.listen(PORT, () => {
  console.log(`fyscs9listchannels server running at http://localhost:${PORT}`);
});
