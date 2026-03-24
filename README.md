# Uppy + ImageKit Integration

A complete integration example showing how to use [Uppy.io](https://uppy.io/) for file uploads with [ImageKit](https://imagekit.io/) using the official ImageKit Node.js SDK with secure server-side authentication.

Files are uploaded **directly** from the browser to ImageKit's upload API via Uppy's built-in XHR Upload plugin.

<img src="/assets/imagekit-uppy-demo.gif">

## 🌟 Features

✅ **Secure Server-Side Authentication** - Token/signature generation using ImageKit Node.js SDK  
✅ **Multiple Upload Sources** - Local files, Google Drive, Dropbox, URL, and Webcam  
✅ **Dark Theme UI** - Clean, modern interface with dark mode  
✅ **Real-time Progress** - Upload progress tracking and status updates  
✅ **Direct Upload** - Files go directly to ImageKit, not through your server  
✅ **File Metadata** - Customize file name, folder, tags, and more via Dashboard  

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- An ImageKit account ([Sign up for free](https://imagekit.io/registration))
- ImageKit API credentials:
  - Public Key
  - Private Key
  - URL Endpoint
- Modern web browser

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/imagekit-samples/uppy-uploader.git
cd uppy-uploader
```

### 2. Install Dependencies

```bash
yarn install
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

### 6. Open in Browser

Visit [http://localhost:3020](http://localhost:3020)

You should see the Uppy upload dashboard with:
- Drop file area
- Browse files button
- Upload source options (My Device, Google Drive, Dropbox, URL, Webcam)
- File list with upload history

### 7. Test Your First Upload

1. Click **"Drop your files here"** or **"browse files"**
2. Select an image file
3. Fill in optional metadata (file name, folder, tags, etc.)
4. Click **"Upload"** button
5. Watch the progress bar complete

**Expected Result:**
- File uploads successfully to ImageKit
- Progress indicator shows upload status
- File appears in ImageKit Media Library

### 8. Verify Upload in ImageKit

After successful upload:
- Click the file URL to view it
- Log in to [ImageKit Media Library](https://imagekit.io/dashboard/media-library)
- Files are stored in the configured folder

## 🏗️ How It Works

### Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│    Browser      │         │     Backend     │         │    ImageKit     │
│  (Uppy + JS)    │────────▶│  (Express +     │         │     Server      │
│                 │         │ ImageKit SDK)   │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                           │                           │
        │  1. Request auth params   │                           │
        │──────────────────────────▶│                           │
        │                           │                           │
        │  2. Generate token/sig    │                           │
        │  using ImageKit SDK       │                           │
        │◀──────────────────────────│                           │
        │                           │                           │
        │  3. Upload file with auth params                      │
        │──────────────────────────────────────────────────────▶│
        │                           │                           │
        │  4. Verify signature & Store                          │
        │◀──────────────────────────────────────────────────────│
```

### Security Flow

1. **Frontend** requests authentication parameters from backend `/auth` endpoint
2. **Backend** generates one-time auth parameters using ImageKit Node.js SDK:
   - Returns: `{ token, signature, expire, publicKey }`
3. **Frontend** uploads file directly to ImageKit with auth parameters
4. **ImageKit** verifies the signature and accepts the upload

This ensures your **Private Key never leaves your server**.

### Upload Flow

1. User selects file in Uppy Dashboard
2. Frontend requests auth from `/auth` endpoint:
   ```
   GET /auth
   ```
3. Backend generates authentication:
   ```javascript
   const authParams = imagekit.helper.getAuthenticationParameters();
   // Returns: { token, expire, signature, publicKey }
   ```
4. Frontend uploads directly to ImageKit with auth params
5. ImageKit validates signature and stores file
6. Frontend displays success with file URL

## 📁 Project Structure

```
uppy-uploader/
├── client/
│   ├── index.html       # Main HTML file with Uppy Dashboard
│   ├── index.js         # Client-side upload logic & Uppy setup (plain JS, no build needed)
│   └── style.css        # Dark theme styling
├── server/
│   └── index.js         # Express server with ImageKit SDK
├── .env.example         # Environment variables template
├── .env                 # Your credentials (gitignored)
├── package.json         # Dependencies
└── README.md            # This file
```

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

Customize Uppy settings in `client/index.js`. Common configuration options:

```javascript
const uppy = new Uppy.Core({
  id: 'uppy',
  autoProceed: false,           // Require manual upload button click
  allowMultipleUploads: true,   // Allow multiple file uploads
  restrictions: {
    maxFileSize: 50 * 1024 * 1024,  // 50 MB max file size
    maxNumberOfFiles: 10,            // Maximum 10 files at once
    minNumberOfFiles: 1,             // Minimum 1 file required
    allowedFileTypes: ['image/*', 'application/pdf', 'video/*']
  }
});
```

**Key Options:**
- `autoProceed: false` - User must click Upload button
- `autoProceed: true` - Starts uploading immediately after selection
- `allowMultipleUploads: true` - Allow batch uploads
- `restrictions.maxFileSize` - Maximum file size in bytes
- `restrictions.maxNumberOfFiles` - Max files in single upload batch
- `restrictions.allowedFileTypes` - Array of MIME types to allow

### File Size Limits

File size restrictions are enforced at multiple levels. Set in `client/index.js` restrictions:

```javascript
restrictions: {
  maxFileSize: 50 * 1024 * 1024
}
```


### File Upload Metadata Fields

Customize these fields in the Uppy Dashboard:

- **File name** - Custom name for uploaded file
- **Folder path** - Destination folder (e.g., `/uploads`)
- **Use unique file name** - Add UUID suffix to prevent overwrites
- **Private File** - Mark file as private
- **Published** - Mark file as published
- **Tags** - Comma-separated tags
- **Custom coordinates** - For custom image regions

These fields are sent to ImageKit with each upload.

### Building for Production
No build step required! The project uses pre-bundled Uppy from CDN.

For production deployment:
1. Install dependencies: `npm install`
2. Configure `.env` with production values
3. Start server: `npm start`


## 🧪 Testing Different Upload Sources

Uppy supports multiple upload sources. Test each one:

### 1. Upload from Local Device

1. Click **"Drop your files here"** or **"browse files"**
2. Select a file from your computer
3. Click **"Upload"** button
4. Verify file appears in ImageKit Media Library

**Expected Result:** File uploads successfully in seconds

### 2. Upload from URL

1. Click the **URL** icon in upload sources
2. Paste a file URL:
   ```
   https://images.example.com/photo.jpg
   ```
3. Enter optional metadata (file name, folder)
4. Click **"Upload"** button
5. Verify file appears in ImageKit Media Library

### 3. Upload from Google Drive

**Setup (First time only):**
1. Add your Google Drive credentials to `.env`:
   ```env
   DRIVE_KEY=your_google_oauth_client_id
   DRIVE_SECRET=your_google_oauth_secret
   ```
2. Restart server: `yarn start`

**Usage:**
1. Click the **Google Drive** icon
2. Authorize access when prompted
3. Select files from your Google Drive
4. Click **"Upload"** button
5. Verify files appear in ImageKit Media Library

### 4. Upload from Dropbox

**Setup (First time only):**
1. Add your Dropbox credentials to `.env`:
   ```env
   DROPBOX_KEY=your_dropbox_app_key
   DROPBOX_SECRET=your_dropbox_app_secret
   ```
2. Restart server: `yarn start`

**Usage:**
1. Click the **Dropbox** icon
2. Authorize access when prompted
3. Select files from your Dropbox
4. Click **"Upload"** button
5. Verify files appear in ImageKit Media Library

### 5. Upload from Webcam

1. Click the **Webcam** icon
2. Allow browser permission to access camera
3. Click to take photo or hold to record video
4. Click **"Upload"** button
5. Verify file appears in ImageKit Media Library

**Note:** Requires HTTPS in production (localhost works with HTTP)

## ✅ Common Test Cases

### Test Case 1: Successful Image Upload

**Steps:**
1. Start server: `yarn start`
2. Open browser: http://localhost:3020
3. Click "browse files"
4. Select any image (JPG, PNG, WebP, etc.)
5. Click "Upload"

**Expected Result:**
- Progress bar shows upload progress
- Success notification appears
- No errors in browser console
- File URL shown

### Test Case 2: Multiple File Upload

**Steps:**
1. Click "browse files"
2. Select 5 files simultaneously (Cmd/Ctrl + Click)
3. Click "Upload"
4. All files upload together

**Expected Result:**
- All 5 files upload successfully
- Each file shows individual progress
- All files appear in Media Library

### Test Case 3: File Size Limit Validation

**Steps:**
1. Create a file larger than configured limit:
   ```bash
   dd if=/dev/zero of=large.bin bs=1M count=100  # 100 MB
   ```
2. Try uploading this file
3. Observe browser behavior

**Expected Result:**
- File rejected before upload
- Error message displayed: "File is too large"
- No upload attempt to server

### Test Case 4: Upload with No Internet

**Steps:**
1. Select file for upload
2. Disconnect internet
3. Click "Upload"
4. Observe error handling

**Expected Result:**
- Upload fails with network error
- Manual retry option available
- No crash or frozen UI

### Test Case 5: Duplicate File Upload Prevention

**Steps:**
1. Upload a file successfully
2. Try uploading the **same file** again (same name, same content)
3. Upload completes

**Expected Result:**
- First file: stored as `filename.ext`
- Second file: stored as `filename_xxxxxx.ext` (with UUID suffix)
- Both files exist in ImageKit Media Library

### Test Case 6: Custom Metadata Fields

**Steps:**
1. Select a file
2. In dashboard, fill in:
   - File name: `my-photo-2025`
   - Folder: `/uploads/photos`
   - Tags: `vacation, beach`
3. Click "Upload"

**Expected Result:**
- File uploaded to `/uploads/photos/my-photo-2025.ext`
- Tags applied in ImageKit Media Library
- Metadata visible in file properties

### Test Case 7: Upload from Remote URL

**Steps:**
1. Click URL icon
2. Paste: `https://picsum.photos/500/500`
3. Click "Upload"

**Expected Result:**
- Remote image downloaded and uploaded
- File appears in Media Library
- No "Invalid signature" errors

### Test Case 8: Error Recovery

**Steps:**
1. Select file
2. Start upload
3. Interrupt network (Cmd/Ctrl + S in DevTools Network tab)
4. Observe error handling
5. Click retry button

**Expected Result:**
- Upload fails gracefully with error message
- Retry button available
- Retry succeeds when network restored

### Test Case 9: API Endpoints Respond Correctly

**Steps:**
Test endpoints from terminal:

```bash
# Test config endpoint
curl http://localhost:3020/config

# Expected: JSON with IMAGEKIT_PUBLIC_KEY, IMAGEKIT_URL_ENDPOINT, SERVER_BASE_URL

# Test auth endpoint
curl http://localhost:3020/auth

# Expected: JSON with token, signature, expire, publicKey
```

**Expected Result:**
- Both endpoints return valid JSON
- No error responses (200 OK)
- Keys and signatures present

## 🐛 Troubleshooting

### Issue: "Failed to load configuration"

**Cause**: Backend server not running

**Solution**:
```bash
# Make sure server is running
yarn start

# Test the config endpoint
curl http://localhost:3020/config
```

### Issue: "Failed to fetch authentication parameters"

**Cause**: `/auth` endpoint returns error

**Solution**:
```bash
# Test the auth endpoint
curl http://localhost:3020/auth

# Should return JSON with token, expire, signature
```

Check that `.env` file has valid ImageKit credentials.

### Issue: Upload fails with "Invalid signature"

**Cause**: ImageKit credentials mismatch

**Solution**:
1. Verify `.env` file has correct credentials
2. Restart server after changing `.env`
3. Get fresh credentials from ImageKit Dashboard
4. Check that Public Key and Private Key are correct

### Issue: File uploads but doesn't appear in ImageKit

**Cause**: File was uploaded successfully but may be in different folder

**Solution**:
1. Check ImageKit Media Library
2. Look in root and configured folders
3. Check file permissions/visibility settings
4. Verify ImageKit account has sufficient quota

### Enable Debug Mode

Debug mode is enabled by default. Open browser DevTools (F12) to see:
- Detailed Uppy logs
- Network requests
- Upload progress
- Errors and warnings

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

## 🚢 Deployment

### Environment Variables

For production deployment (Heroku, Vercel, Railway, etc.), set:

```env
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_url_endpoint
SERVER_BASE_URL=https://yourdomain.com
```

### CORS Configuration

The server allows all origins by default. For production, update `server/index.js`:

```javascript
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
```

## 📊 Monitoring

Monitor your uploads in [ImageKit Dashboard](https://imagekit.io/dashboard/media-library):
- Storage usage
- API request logs
- Upload statistics
- File management

Browse files in [ImageKit Media Library](https://imagekit.io/dashboard/media-library):
- View all uploaded files
- Search and filter
- Apply transformations
- Generate URLs

## 📚 Resources

- [Uppy Documentation](https://uppy.io/docs/)
- [ImageKit JavaScript SDK](https://github.com/imagekit-developer/imagekit-javascript)
- [ImageKit Node.js SDK](https://github.com/imagekit-developer/imagekit-nodejs)
- [ImageKit Upload API](https://docs.imagekit.io/api-reference/upload-file-api)
- [ImageKit Authentication](https://docs.imagekit.io/api-reference/upload-file-api/client-side-file-upload)

## 📄 License

MIT

---

Made with ❤️ using [Uppy](https://uppy.io/) and [ImageKit](https://imagekit.io/)
