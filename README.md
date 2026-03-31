# ImageKit Uppy Integration

A sample project demonstrating how to use [Uppy](https://uppy.io/) for client-side file uploads with [ImageKit](https://imagekit.io/).

Files are uploaded directly from the browser to ImageKit's upload API via Uppy's XHR Upload plugin, with secure server-side authentication powered by the [ImageKit Node.js SDK](https://github.com/imagekit-developer/imagekit-nodejs).

[Fork on CodeSandbox](https://codesandbox.io/s/github/imagekit-samples/uppy-uploader)

<img src="/assets/imagekit-uppy-demo.gif">

## Features

- Upload files from the local device
- Upload files using remote URLs
- Let users choose files from Google Drive, Dropbox, Instagram, or Facebook
- Record a selfie using the device camera and upload it
- Preview added files before uploading
- Customize upload request parameters like file name, tags, folder path, custom coordinates, private file attribute, and more

The best way to integrate an upload widget in your application is to clone this project or copy and paste the relevant parts.

## Prerequisites

- Node.js (v18 or higher)
- An ImageKit account ([Sign up for free](https://imagekit.io/registration))
- ImageKit API credentials:
  - Public Key
  - Private Key
  - URL Endpoint

## Getting Started

### Installation

```bash
git clone https://github.com/imagekit-samples/uppy-uploader.git
cd uppy-uploader
npm install
```

### Configuration

1. Log in to [ImageKit Dashboard](https://imagekit.io/dashboard)
2. Go to **Developer** → **API Keys**
3. Copy your **Public Key**, **Private Key**, and **URL Endpoint**

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# ImageKit credentials - Get these from https://imagekit.io/dashboard/developer/api-keys
IMAGEKIT_PUBLIC_KEY=your_public_key_here
IMAGEKIT_PRIVATE_KEY=your_private_key_here
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

# Server configuration
SERVER_BASE_URL=http://localhost:3020
```

> **Important:** `IMAGEKIT_PRIVATE_KEY` must never be exposed in client-side code. Keep it only in `.env`.

### Running the Server

```bash
npm start
```

Open [http://localhost:3020](http://localhost:3020) in your browser. You should see the Uppy dashboard and be able to upload files to ImageKit.

## How It Works

1. User selects a file in the Uppy Dashboard.
2. Frontend requests auth details from the `/auth` endpoint:
   ```
   GET /auth
   ```
3. Backend uses the ImageKit Node.js SDK to generate authentication parameters, creating a secure signature and token:
   ```js
   const authParams = imagekit.helper.getAuthenticationParameters();
   // Returns: { token, expire, signature, publicKey }
   ```
4. Frontend receives auth parameters and uploads the file directly to ImageKit's upload API with the signature and token included in the request.
5. ImageKit validates the signature against the private key to ensure the request is legitimate, then stores the file in your media library.
6. Frontend receives the success response and displays the file URL and thumbnail to the user.

## Upload Metadata Fields

The Uppy Dashboard exposes several optional fields that control how files are processed and stored in ImageKit:

| Field | Description |
|---|---|
| **File name** | Custom name for the uploaded file. Defaults to the original filename. |
| **Folder path** | Destination folder in the ImageKit media library (e.g., `/uploads/photos`). Created automatically if it doesn't exist. |
| **Use unique file name** | Appends a UUID suffix to prevent overwriting files with the same name. |
| **Private file** | Restricts direct access. [Private files](https://imagekit.io/docs/media-delivery-basic-security#private-files) require a signed URL or named transformation. |
| **Published** | Makes the file publicly accessible. Unpublished files are stored as [drafts](https://imagekit.io/docs/dam/drafts). |
| **Tags** | Comma-separated labels for organizing files (e.g., `vacation,beach,2025`). |
| **Custom coordinates** | Defines a crop region as `x,y,width,height` in pixels. |

All fields are optional. ImageKit applies sensible defaults when they are omitted.

For Uppy-specific configuration (file size limits, restrictions, etc.), refer to the [Uppy documentation](https://uppy.io/docs/uppy/#restrictions).

## Third-Party Sources

Uppy supports importing files from [Google Drive](https://uppy.io/docs/google-drive/), [Dropbox](https://uppy.io/docs/dropbox/), [Instagram](https://uppy.io/docs/instagram/), [remote URLs](https://uppy.io/docs/url/), and the device [camera](https://uppy.io/docs/webcam/) via [Companion](https://uppy.io/docs/companion/). This project includes a pre-configured Companion server.

To enable third-party sources, add the relevant credentials to your `.env` file:

```env
FACEBOOK_KEY=
FACEBOOK_SECRET=
DROPBOX_KEY=
DROPBOX_SECRET=
DRIVE_KEY=
DRIVE_SECRET=
```

Then restart the server and refresh the page. For instructions on creating third-party app credentials and configuring redirect URLs, see the [Uppy Companion docs](https://uppy.io/docs/companion/).

## Troubleshooting

- Refer to the [Uppy documentation](https://uppy.io/docs/uppy/)
- Enable [Uppy debug mode](https://uppy.io/docs/uppy/#debug) for detailed logging
- [Open an issue](https://github.com/imagekit-samples/uppy-uploader/issues) on GitHub

## Security

Your private key should never leave the server. This project follows these practices:

- `.env` is listed in `.gitignore` to prevent accidental commits
- Authentication parameters are generated server-side and contain a short-lived token
- The private key is never sent to the client

For production deployments, also consider:
- Implementing user authentication before issuing upload tokens
- Using separate credentials for development and production environments
- Rotating keys immediately if they are accidentally exposed

## Resources

- [Uppy Documentation](https://uppy.io/docs/)
- [ImageKit Node.js SDK](https://github.com/imagekit-developer/imagekit-nodejs)
- [ImageKit JavaScript SDK](https://github.com/imagekit-developer/imagekit-javascript)
- [ImageKit Upload API Reference](https://imagekit.io/docs/api-reference/upload-file/upload-file)
- [ImageKit Client-Side Upload Guide](https://imagekit.io/docs/api-reference/upload-file/upload-file#how-to-implement-client-side-file-upload)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
