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
//   - Retries are handled by Uppy's built-in retry mechanism. Each retry
//     re-runs the preprocessor, so a fresh auth token is always used.
// =============================================================================

import Uppy from "@uppy/core";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import Dashboard from "@uppy/dashboard";
import XHRUpload from "@uppy/xhr-upload";
import Url from "@uppy/url";
import GoogleDrive from "@uppy/google-drive";
import Dropbox from "@uppy/dropbox";
import Facebook from "@uppy/facebook";
import Webcam from "@uppy/webcam";
import "@uppy/webcam/dist/style.css";

// ---------------------------------------------------------------------------
// Globals injected by the EJS template
// ---------------------------------------------------------------------------
const SERVER_BASE_URL = window.SERVER_BASE_URL;
const IMAGEKIT_PUBLIC_KEY = window.IMAGEKIT_PUBLIC_KEY;

// =============================================================================
// Auth helper
// =============================================================================

/**
 * Fetch one-time authentication parameters from the backend.
 *
 * The server returns `{ token, signature, expire, publicKey }`.
 * A fresh set **must** be fetched before every upload attempt because ImageKit
 * tokens are single-use and cannot be reused — not even on retries.
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

const uppy = new Uppy({ debug: true, autoProceed: false })
  // --- Dashboard UI --------------------------------------------------------
  .use(Dashboard, {
    inline: true,
    target: "#uppyDashboard",
    metaFields,
    proudlyDisplayPoweredByUppy: false,
    note: "ImageKit + Uppy Demo • https://github.com/imagekit-samples/uppy-uploader",
  })
  // --- Remote providers (require Companion running on the server) ----------
  .use(GoogleDrive, { target: Dashboard, companionUrl: SERVER_BASE_URL })
  .use(Dropbox, { target: Dashboard, companionUrl: SERVER_BASE_URL })
  .use(Facebook, { target: Dashboard, companionUrl: SERVER_BASE_URL })
  // --- Local providers -----------------------------------------------------
  .use(Webcam, { target: Dashboard })
  .use(Url, { target: Dashboard, companionUrl: SERVER_BASE_URL })
  // --- XHR Upload — sends files directly to ImageKit's upload API ----------
  .use(XHRUpload, {
    endpoint: "https://upload.imagekit.io/api/v1/files/upload",
    fieldName: "file",
    formData: true,
    // Send all file metadata as form fields. The preprocessor below injects
    // the required ImageKit auth params (publicKey, signature, token, expire,
    // fileName) into each file's metadata before the upload starts.
    metaFields: null,
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
 *
 * This also runs on retries — Uppy's retry mechanism re-runs the full upload
 * pipeline (preprocessors → uploaders → postprocessors), so stale tokens from
 * a previous failed attempt are replaced with fresh ones.
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

// =============================================================================
// Automatic retry with exponential back-off
// =============================================================================

/**
 * Uppy v1's XHR Upload plugin has no built-in automatic retry. When an upload
 * fails the Dashboard shows a "Retry" button the user must click manually.
 *
 * To provide automatic retries with fresh auth tokens (since ImageKit tokens
 * are single-use), we listen for `upload-error` and schedule a call to
 * `uppy.retryUpload(fileID)`. Uppy's `retryUpload` creates a brand-new upload
 * pipeline starting at step 0, so the preprocessor runs again and fetches a
 * fresh `{ token, signature, expire }` before each retry attempt.
 *
 * Configuration:
 *   - MAX_AUTO_RETRIES: maximum retry attempts per file
 *   - RETRY_DELAYS:     exponential back-off delays in ms
 *
 * Remote files (Dropbox, Google Drive, etc.) are NOT auto-retried because
 * Companion manages their own socket-based retry via `upload-retry` events.
 */
const MAX_AUTO_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];

// Track retry attempts per file ID
const retryCountMap = new Map();

uppy.on("upload-error", (file, error) => {
  // Don't auto-retry remote files — Companion handles its own retries
  if (file.isRemote) return;

  const count = retryCountMap.get(file.id) || 0;

  if (count >= MAX_AUTO_RETRIES) {
    uppy.log(
      `[ImageKit] All ${MAX_AUTO_RETRIES} retries exhausted for ${file.name}`,
      "error"
    );
    retryCountMap.delete(file.id);
    return;
  }

  const delayMs = RETRY_DELAYS[count] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
  retryCountMap.set(file.id, count + 1);

  uppy.log(
    `[ImageKit] Upload failed for ${file.name} (attempt ${count + 1}/${MAX_AUTO_RETRIES}), ` +
      `retrying in ${delayMs}ms…`,
    "warning"
  );

  setTimeout(() => {
    // Verify the file still exists (user may have removed it while waiting)
    const current = uppy.getFile(file.id);
    if (current && current.error) {
      uppy.retryUpload(file.id);
    }
  }, delayMs);
});

// Clean up retry tracking on success or file removal
uppy.on("upload-success", (file) => {
  retryCountMap.delete(file.id);
});

uppy.on("file-removed", (file) => {
  retryCountMap.delete(file.id);
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
