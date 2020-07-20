# Uppy uploader
ImageKit sample integration with [Uppy](https://github.com/transloadit/uppy) upload widget.

# How to run locally

**1. Clone the repo**

Clone the repo directly from Github.
```
git clone git@github.com:imagekit-samples/uppy-uploader.git
```

**2. Install the dependencies**

Both npm and yarn should work, but we used yarn during the development and testing of this demo.

```
yarn install
```

**3. Build the JS and CSS bundle**

This following command will create client-side JS and CSS files, if you want to make some changes in the client-side JS file [client/vanillajs/index.js](client/vanillajs/index.js), run this command to generate bundles again.
```
yarn build
```

**4. Configure private and public key**

Create a copy of `env.example` file and save it as `.env` file. This file contains your private keys, which will be used on the server-side. For a minimal setup, just put the required ImageKit.io credentials.

Open [client/vanillajs/index.js](client/vanillajs/index.js) and set your ImageKit [public key](https://docs.imagekit.io/api-reference/api-introduction/api-keys#public-key) in variable `IMAGEKIT_PUBLIC_KEY`. This is required on the client-side.

**5. Start the server**

```
node server/index.js
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