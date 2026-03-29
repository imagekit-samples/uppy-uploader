// =============================================================================
// ImageKit + Uppy Integration (using @uppy/xhr-upload)
//
// This file demonstrates how to integrate ImageKit's upload API with the Uppy
// file-upload widget using Uppy's built-in XHR Upload plugin. Files are sent
// directly to ImageKit's upload endpoint as multipart form data — they never
// pass through your own server.
//
// Key points:
//   - The XHR Upload plugin POSTs files directly to
//     https://upload.imagekit.io/api/v1/files/upload
//   - A preprocessor fetches a fresh one-time `token`, `signature`, and
//     `expire` from your backend before each upload and injects them as
//     metadata fields (which XHR Upload sends as form fields).
//   - Remote files (Dropbox, Google Drive, etc.) are handled by Companion:
//     Companion downloads the file from the remote source and uploads it
//     directly to ImageKit with the auth params forwarded as metadata.
// =============================================================================

// ---------------------------------------------------------------------------
// Globals - fetch from server config endpoint
// ---------------------------------------------------------------------------
let SERVER_BASE_URL = '';
let IMAGEKIT_PUBLIC_KEY = '';

// Fetch configuration from server
async function loadConfig() {
  try {
    const response = await fetch('/config');
    if (!response.ok) {
      throw new Error('Failed to load configuration');
    }
    const config = await response.json();
    SERVER_BASE_URL = config.SERVER_BASE_URL;
    IMAGEKIT_PUBLIC_KEY = config.IMAGEKIT_PUBLIC_KEY;
  } catch (error) {
    console.error('Error loading config:', error);
    throw error;
  }
}

// =============================================================================
// Auth helper
// =============================================================================

/**
 * Fetch one-time authentication parameters from the backend.
 *
 * The server returns `{ token, signature, expire, publicKey }`.
 *
 * @returns {Promise<{ token: string, signature: string, expire: number, publicKey: string }>}
 */
async function fetchAuthParams() {
  const response = await fetch(`${SERVER_BASE_URL}/auth`);
  if (!response.ok) {
    throw new Error("Failed to fetch authentication parameters");
  }
  return response.json();
}

// =============================================================================
// Dashboard meta-field definitions
// =============================================================================

/**
 * Meta fields displayed in the Uppy Dashboard for each file.
 *
 * These let users customise upload parameters (file name, folder, tags, etc.)
 * on a per-file basis before uploading.
 */
const metaFields = [
  {
    id: "name",
    name: "File name",
    placeholder: "Enter the file name",
  },
  {
    id: "folder",
    name: "Folder path",
    placeholder: "The destination path e.g. /website-assets",
  },
  {
    id: "useUniqueFileName",
    name: "Use unique file name",
    render: function ({ value, onChange }, h) {
      return h("input", {
        type: "checkbox",
        onChange: (ev) => onChange(ev.target.checked ? "true" : "false"),
        checked: value === "" || value === "true" || value === true,
        style: { verticalAlign: "middle" },
      });
    },
  },
  {
    id: "isPrivateFile",
    name: "Private File",
    render: function ({ value, onChange }, h) {
      return h("input", {
        type: "checkbox",
        onChange: (ev) => onChange(ev.target.checked ? "true" : "false"),
        checked: value === "true" || value === true,
        style: { verticalAlign: "middle" },
      });
    },
  },
  {
    id: "isPublished",
    name: "Published",
    render: function ({ value, onChange }, h) {
      return h("input", {
        type: "checkbox",
        onChange: (ev) => onChange(ev.target.checked ? "true" : "false"),
        checked: value === "true" || value === true,
        style: { verticalAlign: "middle" },
      });
    },
  },
  {
    id: "tags",
    name: "Tags",
    placeholder: "Comma separated tags e.g. t-shirt,summer",
  },
  {
    id: "customCoordinates",
    name: "Custom coordinates",
    placeholder: "Comma separated values in format x,y,width,height",
  },
];

// =============================================================================
// Uppy initialisation
// =============================================================================

function initializeUppy() {
  // Uppy v5.2.1 from CDN exposes the constructor as window.Uppy
  if (!window.Uppy) {
    throw new Error('Uppy library failed to load from CDN. Check your internet connection.');
  }

  const Uppy = window.Uppy

  const uppy = new Uppy.Uppy({
    debug: true,
    autoProceed: false,
  })
    // --- Dashboard UI --------------------------------------------------------
    .use(Uppy.Dashboard, {
      inline: true,
      target: "#uppyDashboard",
      metaFields,
      proudlyDisplayPoweredByUppy: false,
      note: "ImageKit + Uppy Demo • https://github.com/imagekit-samples/uppy-uploader",
      theme: "dark",
      showProgressDetails: true,
      showLinkToFileUploadResult: true,
    })
    // --- Remote providers (require Companion running on the server) ----------
    .use(Uppy.GoogleDrive, { target: Uppy.Dashboard, companionUrl: SERVER_BASE_URL })
    .use(Uppy.Dropbox, { target: Uppy.Dashboard, companionUrl: SERVER_BASE_URL })
    .use(Uppy.Facebook, { target: Uppy.Dashboard, companionUrl: SERVER_BASE_URL })
    // --- Local providers -----------------------------------------------------
    .use(Uppy.Webcam, { target: Uppy.Dashboard })
    .use(Uppy.Url, { target: Uppy.Dashboard, companionUrl: SERVER_BASE_URL })
    // --- XHR Upload — sends files directly to ImageKit's upload API ----------
    .use(Uppy.XHRUpload, {
      endpoint: "https://upload.imagekit.io/api/v1/files/upload",
      fieldName: "file",
      formData: true,
      // Send all file metadata as form fields. The preprocessor below injects
      // the required ImageKit auth params (publicKey, signature, token, expire,
      // fileName) into each file's metadata before the upload starts.
      allowedMetaFields: true,
      // ImageKit returns JSON with a `url` field pointing to the uploaded file.
      responseUrlFieldName: "url",
      // Disable the stall timeout — large files or slow connections may take a while.
      timeout: 0,
    });

  // =============================================================================
  // Preprocessor — inject ImageKit auth params before each upload
  // =============================================================================

  /**
   * Before each upload batch, fetch a fresh set of one-time auth params from the
   * backend and inject them into every file's metadata. XHR Upload sends metadata
   * as form fields, so ImageKit receives `publicKey`, `signature`, `token`,
   * `expire`, and `fileName` alongside the file binary.
   */
  uppy.addPreProcessor(async (fileIDs) => {
    for (const fileID of fileIDs) {
      const file = uppy.getFile(fileID);
      const authParams = await fetchAuthParams();

      uppy.setFileMeta(fileID, {
        // Required auth fields for ImageKit client-side uploads
        fileName: file.meta.name || file.name,
        publicKey: authParams.publicKey || IMAGEKIT_PUBLIC_KEY,
        signature: authParams.signature,
        token: authParams.token,
        expire: String(authParams.expire),
      });
    }
  });

  uppy.on("complete", (result) => {
    if (result.successful.length) {
      console.log(`${result.successful.length} file(s) uploaded successfully`);
      result.successful.forEach((file) => {
        console.log(`  ✓ ${file.name} → ${file.uploadURL}`);
      });
    }
    if (result.failed.length) {
      console.error(`${result.failed.length} file(s) failed`);
      result.failed.forEach((file) => {
        console.error(`  ✗ ${file.name}: ${file.error}`);
      });
    }
  });

  return uppy;
}

// =============================================================================
// Initialize app
// =============================================================================

loadConfig()
  .then(() => {
    initializeUppy();
  })
  .catch((error) => {
    console.error('Failed to initialize application:', error);
  });
