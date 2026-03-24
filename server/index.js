const express = require('express');
const companion = require('@uppy/companion');
const bodyParser = require('body-parser');
const session = require('express-session');
const ImageKit = require('@imagekit/nodejs').default;
const path = require('path');
require('dotenv').config();

// ---------------------------------------------------------------------------
// Environment validation
// ---------------------------------------------------------------------------
const REQUIRED_ENV_VARS = [
  'IMAGEKIT_PUBLIC_KEY',
  'IMAGEKIT_PRIVATE_KEY',
  'IMAGEKIT_URL_ENDPOINT',
  'SERVER_BASE_URL',
];

const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.log(
    'The .env file is not configured. Follow the instructions in the README to configure the .env file.\n' +
    'https://github.com/imagekit-samples/uppy-uploader\n'
  );
  missing.forEach((key) => console.log(`  Add ${key} to your .env file.`));
  process.exit(1);
}

// ---------------------------------------------------------------------------
// ImageKit SDK initialisation
// ---------------------------------------------------------------------------
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// ---------------------------------------------------------------------------
// Express app setup
// ---------------------------------------------------------------------------
const app = express();

app.use(express.static(path.join(__dirname, '..', 'client')));
app.use(bodyParser.json());
app.use(
  session({
    secret: 'some-secret',
    resave: true,
    saveUninitialized: true,
  })
);
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Authorization, Origin, Content-Type, Accept'
  );
  next();
});

// ---------------------------------------------------------------------------
// Configuration endpoint - returns environment variables to client
// ---------------------------------------------------------------------------
app.get('/config', (req, res) => {
  res.json({
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
    IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
    SERVER_BASE_URL: process.env.SERVER_BASE_URL,
  });
});

// ---------------------------------------------------------------------------
// Authentication endpoint for client-side uploads
// ---------------------------------------------------------------------------
// Returns a one-time { token, signature, expire, publicKey } payload.
// The client-side @imagekit/javascript `upload()` function requires all four
// fields. `token` is single-use — a fresh set must be fetched before every
// upload attempt (including retries).
app.get('/auth', (req, res) => {
  try {
    const authParams = imagekit.helper.getAuthenticationParameters();
    res.json({
      ...authParams,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    });
  } catch (error) {
    console.error('Error generating authentication parameters:', error);
    res.status(500).json({ message: 'Failed to generate authentication parameters' });
  }
});

// ---------------------------------------------------------------------------
// Uppy Companion — provides Google Drive, Dropbox, Facebook integrations
// ---------------------------------------------------------------------------


const uppyOptions = {
  providerOptions: {
    facebook: {
      key: process.env.FACEBOOK_KEY,
      secret: process.env.FACEBOOK_SECRET,
    },
    drive: {
      key: process.env.DRIVE_KEY,
      secret: process.env.DRIVE_SECRET,
    },
    dropbox: {
      key: process.env.DROPBOX_KEY,
      secret: process.env.DROPBOX_SECRET,
    },
  },
  server: {
    host: new URL(process.env.SERVER_BASE_URL).host, // the host including port e.g. localhost:3020
    protocol: new URL(process.env.SERVER_BASE_URL).protocol.replace(":","") // it should be http or https
  },
  filePath: '/tmp',
  secret: 'some-secret',
  debug: true,
  enableUrlEndpoint: true,
};

app.use(companion.app(uppyOptions));

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

// handle 404
app.use((req, res, next) => {
  return res.status(404).json({ message: 'Not Found' });
});

// handle server errors
app.use((err, req, res, next) => {
  console.error('\x1b[31m', err.stack, '\x1b[0m');
  res.status(err.status || 500).json({ message: err.message, error: err });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
companion.socket(app.listen(3020), uppyOptions);

console.log(`Listening on ${process.env.SERVER_BASE_URL}`);
