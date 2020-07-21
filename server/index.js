const express = require('express')
const companion = require('@uppy/companion')
const bodyParser = require('body-parser')
const session = require('express-session')
const ImageKit = require("imagekit");
const path = require('path');
require('dotenv').config()

var imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const app = express()

app.use("/dist", express.static(path.join(__dirname, '..', 'dist')));
app.use(bodyParser.json())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Origin, Content-Type, Accept, *');
  next()
})

app.get("/auth", (req, res, next) => {
  res.send(imagekit.getAuthenticationParameters());
})

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "index.html"));
})

// initialize uppy
const uppyOptions = {
  providerOptions: {
    facebook: {
      key: process.env.FACEBOOK_KEY,
      secret: process.env.FACEBOOK_SECRET
    },
    drive: {
      key: process.env.DRIVE_KEY,
      secret: process.env.DRIVE_SECRET,
    },
    dropbox: {
      key: process.env.DROPBOX_KEY,
      secret: process.env.DROPBOX_SECRET
    }
  },
  server: {
    host: 'localhost:3020',
    protocol: 'https'
  },
  filePath: '/tmp',
  secret: 'some-secret',
  debug: true
}

app.use(companion.app(uppyOptions))

// handle 404
app.use((req, res, next) => {
  return res.status(404).json({ message: 'Not Found' })
})

// handle server errors
app.use((err, req, res, next) => {
  console.error('\x1b[31m', err.stack, '\x1b[0m')
  res.status(err.status || 500).json({ message: err.message, error: err })
})

companion.socket(app.listen(3020), uppyOptions)

console.log('Welcome to Companion!')
console.log(`Listening on http://0.0.0.0:${3020}`)
