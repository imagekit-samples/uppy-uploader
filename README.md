# Uppy + ImageKit Integration

A complete integration example showing how to use [Uppy.io](https://uppy.io/) for file uploads with [ImageKit](https://imagekit.io/) using the official ImageKit Node.js SDK with secure server-side authentication.

Files are uploaded **directly** from the browser to ImageKit's upload API via Uppy's built-in XHR Upload plugin.

# Demo application

[Fork this on CodeSandbox](https://codesandbox.io/s/github/imagekit-samples/uppy-uploader)

<img src="/assets/imagekit-uppy-demo.gif">

# Features
This sample project has the following features. The best way to integrate an upload widget in your application is to clone this application or copy and paste the relevant part.

✅ Upload files from the local device.

✅ Upload files using remote URLs.

✅ Let users choose files from Google Drive, Dropbox, Instagram, or Facebook.

✅ Option to record a selfie using the device camera and upload it.

✅ Preview added file.

✅ Customize the upload request parameters like file name, tags, folder path, custom coordinates, private file attribute, etc using a nice interface. 


## 📋 Prerequisites

- Node.js (v18 or higher)
- An ImageKit account ([Sign up for free](https://imagekit.io/registration))
- ImageKit API credentials:
  - Public Key
  - Private Key
  - URL Endpoint

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/imagekit-samples/uppy-uploader.git
cd uppy-uploader
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Get ImageKit Credentials

1. Create an account at [imagekit.io/registration](https://imagekit.io/registration)
2. Log in to [ImageKit Dashboard](https://imagekit.io/dashboard)
3. Go to **Developer** → **API Keys**
4. Copy your **Public Key**, **Private Key**, and **URL Endpoint**

### 4. Configure Environment Variables

Create `.env` file from the template:

```bash
cp .env.example .env
```

Edit `.env` and add your ImageKit credentials:

```env
# ImageKit credentials - Get these from https://imagekit.io/dashboard/developer/api-keys
IMAGEKIT_PUBLIC_KEY=your_public_key_here
IMAGEKIT_PRIVATE_KEY=your_private_key_here
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

# Server configuration
SERVER_BASE_URL=http://localhost:3020
```

**Important:** The `IMAGEKIT_PRIVATE_KEY` should ONLY be in `.env` and never exposed in client-side code.

### 5. Start the Server

```bash
npm start
```

The server will start on the configured port (default: 3020).

Expected output:
```
Listening on http://localhost:3020
```

### 6. Verify the Application

Open your browser and navigate to `http://localhost:3020`. You should now be able to upload files to ImageKit through the Uppy dashboard.

### Upload Flow

1. User selects file in Uppy Dashboard
2. Frontend requests auth details from `/auth` endpoint:
  ```
  GET /auth
  ```
3. Backend uses the ImageKit Node.js SDK to generate authentication parameters, creating a secure signature and token to authenticate the file upload request from the frontend:
  ```javascript
  const authParams = imagekit.helper.getAuthenticationParameters();
  // Returns: { token, expire, signature, publicKey }
  ```
4. Frontend receives auth parameters and uploads the file directly to ImageKit's upload API with the signature and token included in the request
5. ImageKit validates the signature against the private key to ensure the request is legitimate, then stores the file in your media library
6. Frontend receives success response and displays file URL, and thumbnail to the user

## 🔌 API Endpoints

### `GET /config`

Returns configuration for the frontend (environment variables).

**Response:**
```json
{
  "IMAGEKIT_PUBLIC_KEY": "your_public_key",
  "IMAGEKIT_URL_ENDPOINT": "https://ik.imagekit.io/your_id",
  "SERVER_BASE_URL": "http://localhost:3020"
}
```

### `GET /auth`

Generates one-time authentication parameters for ImageKit uploads.

**Response:**
```json
{
  "token": "a3f8b9c2...",
  "expire": 1234567890,
  "signature": "d4e5f6a7...",
  "publicKey": "your_public_key"
}
```

**Implementation:**
```javascript
const authParams = imagekit.helper.getAuthenticationParameters();
res.json({
  ...authParams,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY
});
```

## ⚙️ Configuration

### Uppy Configuration

For comprehensive configuration options and examples, refer to the [Uppy Core documentation](https://uppy.io/docs/uppy/) and [Uppy options guide](https://uppy.io/docs/uppy/#options).

### File Size Limits

For detailed information on implementing file size limitations and other restriction options, refer to the [Uppy Restrictions Documentation](https://uppy.io/docs/uppy/#restrictions).

### File Upload Metadata Fields

Customize these fields in the Uppy Dashboard to control how files are processed and stored:

- **File name** - Custom name for the uploaded file. If not specified, the original filename is used. Supports alphanumeric characters, hyphens, and underscores.
- **Folder path** - Destination folder in ImageKit media library (e.g., `/uploads/photos`). Creates the folder automatically if it doesn't exist. Use forward slashes for nested folders.
- **Use unique file name** - When enabled, appends a UUID suffix to the filename to prevent overwriting existing files with the same name.
- **Private File** - Mark the file as private to restrict direct access. [Private files](https://imagekit.io/docs/media-delivery-basic-security#private-files) can only be accessed using a valid signed URL or using a valid named transformation.
- **Published** - Mark the file as published to make it publicly accessible. Unpublished files are stored in [draft state](https://imagekit.io/docs/dam/drafts)
- **Tags** - Comma-separated list of tags for organizing and categorizing files (e.g., `vacation,beach,2025`). Useful for searching and filtering in ImageKit.
- **Custom coordinates** - Define custom regions within images for focused cropping and transformations. Specify as `x,y,width,height` in pixels.

All metadata fields are optional. ImageKit applies sensible defaults if not specified.


# How to use DropBox, Facebook and Drive upload options
Uppy allows users to fetch files from local disk, [remote URLs](https://uppy.io/docs/url/), [Google Drive](https://uppy.io/docs/google-drive/), [Dropbox](https://uppy.io/docs/dropbox/), [Instagram](https://uppy.io/docs/instagram/), or snap and record selfies with a [camera](https://uppy.io/docs/webcam/). To use these options, you need to set up [Companion](https://uppy.io/docs/companion/). This demo project is already configured to use Companion in the backend. 

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

## 🐛 Troubleshooting

If you encounter issues:
- Refer uppy [docs](https://uppy.io/docs/uppy)
- Check [Uppy debug mode](https://uppy.io/docs/uppy/#debug) documentation
- [Open an issue](https://github.com/imagekit-samples/uppy-uploader/issues) on GitHub

## 🔒 Security Best Practices

✅ **DO:**
- Keep `.env` file in `.gitignore` (already configured)
- Use environment variables in production
- Never commit credentials to version control
- Regenerate keys if accidentally exposed
- Implement user authentication for production

❌ **DON'T:**
- Share your Private Key publicly
- Commit `.env` to version control
- Expose Private Key in client-side code
- Use same credentials for development and production
- Hard-code credentials in source files

## 📚 Resources

- [Uppy Documentation](https://uppy.io/docs/)
- [ImageKit JavaScript SDK](https://github.com/imagekit-developer/imagekit-javascript)
- [ImageKit Node.js SDK](https://github.com/imagekit-developer/imagekit-nodejs)
- [ImageKit Upload API](https://imagekit.io/docs/api-reference/upload-file/upload-file)
- [ImageKit Authentication](https://imagekit.io/docs/api-reference/upload-file/upload-file#how-to-implement-client-side-file-upload)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ using [Uppy](https://uppy.io/) and [ImageKit](https://imagekit.io/)
