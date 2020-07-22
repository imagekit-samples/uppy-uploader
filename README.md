# Uppy uploader
ImageKit sample integration with [Uppy](https://github.com/transloadit/uppy) upload widget.

# Live demo
You can see a hosted demo of this sample project [here](https://066dn.sse.codesandbox.io) or [fork this on codesandbox.io](https://codesandbox.io/s/github/imagekit-samples/uppy-uploader).

A step by step walkthrough of the code is also available at https://docs.imagekit.io/sample-projects/upload-widget/uppy-upload-widget/

<img src="/assets/imagekit-uppy-demo.gif">

# Features
This sample project has the following features. The best way to integrate an upload widget in your application is to clone this application or copy and paste the relevant part.

✅ Upload files from the local device.

✅ Upload files using remote URLs.

✅ Let users choose files from Google Drive, Dropbox, Instagram, or Facebook.

✅ Option to record a selfie using the device camera and upload it.

✅ Preview added file.

✅ Customize the upload request parameters like file name, tags, folder path, custom coordinates, private file attribute, etc using a nice interface. 

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

Open [http://localhost:3020](http://localhost:3020) in your browser. This address will be equal to `SERVER_BASE_URL` variable value that you entered in **.env** file.


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