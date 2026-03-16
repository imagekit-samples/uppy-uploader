# Uppy uploader
ImageKit sample integration with [Uppy](https://github.com/transloadit/uppy) upload widget using [`@uppy/xhr-upload`](https://uppy.io/docs/xhr-upload/).

Files are uploaded **directly** from the browser to ImageKit's upload API (`https://upload.imagekit.io/api/v1/files/upload`) via Uppy's built-in XHR Upload plugin.

# Demo application
[Fork this on CodeSandbox](https://codesandbox.io/s/github/imagekit-samples/uppy-uploader)

<img src="/assets/imagekit-uppy-demo.gif">

# How it works

1. **Server** (`server/index.js`) — An Express server that:
   - Initialises the [`@imagekit/nodejs`](https://www.npmjs.com/package/@imagekit/nodejs) SDK.
   - Exposes a `GET /auth` endpoint that returns one-time `{ token, signature, expire, publicKey }` parameters for client-side uploads.
   - Runs [Uppy Companion](https://uppy.io/docs/companion/) so users can import files from Google Drive, Dropbox, and Facebook.

2. **Client** (`client/vanillajs/index.js`) — A browser-side script that:
   - Sets up Uppy with the Dashboard, Webcam, URL, and remote-provider plugins.
   - Uses `@uppy/xhr-upload` to POST files directly to ImageKit's upload endpoint as multipart form data.
   - Registers a **preprocessor** via `uppy.addPreProcessor()` that fetches fresh one-time auth params (`token`, `signature`, `expire`) from the server before each upload — including retries.
   - Implements **automatic retry** with exponential back-off (up to 3 retries with delays of 1s, 2s, 4s). Each retry re-runs the preprocessor to get a fresh single-use token.
   - Supports per-file metadata fields (file name, folder, tags, etc.) via the Dashboard UI.

# Features

✅ Upload files from the local device.

✅ Upload files using remote URLs.

✅ Let users choose files from Google Drive, Dropbox, Instagram, or Facebook.

✅ Option to record a selfie using the device camera and upload it.

✅ Preview added file.

✅ Customize the upload request parameters like file name, tags, folder path, custom coordinates, private file attribute, etc using a nice interface.

✅ Automatic retry with exponential back-off and fresh auth tokens on each attempt.

# How to run locally

**1. Clone the repo**

```
git clone git@github.com:imagekit-samples/uppy-uploader.git
```

**2. Install the dependencies**

```
yarn install
```

**3. Configure .env file**

Create a copy of `env.example` file and save it as `.env` file. This file contains your private keys, which will be used on the server-side. For a minimal setup, you need to put the following required variables i.e. `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`, and `SERVER_BASE_URL`.

```bash
# Required variables. If running in Codesandbox, please add secrets in your fork
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

# Don't add trailing slash in SERVER_BASE_URL. It should be either http://localhost:3020 or your Codesandbox URL
SERVER_BASE_URL=
```

**4. Start the application**

```
yarn start
```

Open [http://localhost:3020](http://localhost:3020) in your browser.

# How to use DropBox, Facebook and Drive upload options
Uppy allows users to fetch files from local disk, remote URLs, Google Drive, Dropbox, Instagram, or snap and record selfies with a camera. To use these options, you need to set up [Companion](https://uppy.io/docs/companion/). This demo project is already configured to use Companion in the backend.

All you have to do is:
1. Specify the `key` and `secret` for your applications in `.env` file. We created this file during the setup. For more information regarding how to create a third party application and set up redirect URLs, checkout [Uppy docs](https://uppy.io/docs/dropbox/)
2. Restart the backend server.
3. Refresh the page [http://localhost:3020](http://localhost:3020)

```
# Third-party app's credentials
FACEBOOK_KEY=
FACEBOOK_SECRET=
DROPBOX_KEY=
DROPBOX_SECRET=
DRIVE_KEY=
DRIVE_SECRET=
```
