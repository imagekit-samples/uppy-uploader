import 'regenerator-runtime/runtime'

import Uppy from '@uppy/core'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import Url from '@uppy/url'
import Dashboard from '@uppy/dashboard'
import ImageKitUppyPlugin from "imagekit-uppy-plugin"
import GoogleDrive from '@uppy/google-drive'
import Dropbox from '@uppy/dropbox'
import Facebook from '@uppy/facebook'
import Webcam from "@uppy/webcam"
import '@uppy/webcam/dist/style.css'

const SERVER_BASE_URL = window.SERVER_BASE_URL;
const IMAGEKIT_PUBLIC_KEY = window.IMAGEKIT_PUBLIC_KEY;

const authenticator = async () => {
    try {

        // You can pass headers as well and later validate the request source in the backend, or you can use headers for any other use case.
        const response = await fetch(`${SERVER_BASE_URL}/auth`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const { signature, expire, token } = data;
        return { signature, expire, token };
    } catch (error) {
        throw new Error(`Authentication request failed: ${error.message}`);
    }
};

const metaFields = [
    {
        id: 'name', name: 'File name', placeholder: 'Enter the file name'
    },
    {
        id: 'folder', name: 'Folder path', placeholder: 'The destination path e.g. /website-assets'
    },
    {
        id: 'useUniqueFileName',
        name: "Use unique file name",
        render: function ({ value, onChange }, h) {
            return h('input', {
                type: 'checkbox',
                onChange: (ev) => onChange(ev.target.checked ? 'true' : 'false'),
                checked: value === "" || value === "true" || value === true,
                style: {
                    verticalAlign: "middle"
                }
            })
        }
    },
    {
        id: 'isPrivateFile',
        name: 'Private File',
        render: function ({ value, onChange }, h) {
            return h('input', {
                type: 'checkbox',
                onChange: (ev) => onChange(ev.target.checked ? 'true' : 'false'),
                checked: value === "true" || value === true,
                style: {
                    verticalAlign: "middle"
                }
            })
        }
    },
    {
        id: 'tags', name: 'Tags', placeholder: 'Comma seperated tags e.g. t-shirt,summer'
    },
    {
        id: 'customCoordinates', name: 'Custom coodinates', placeholder: 'Comma seperated values in format x,y,width,height'
    }
];

const uppy = Uppy({ debug: true, autoProceed: false })
    .use(Dashboard, {
        inline: true,
        trigger: '#uppyDashboard',
        metaFields: metaFields,
        proudlyDisplayPoweredByUppy: false,
        note: "ImageKit Uppy Sample • https://github.com/imagekit-samples/uppy-uploader"
    })
    .use(GoogleDrive, { target: Dashboard, companionUrl: SERVER_BASE_URL }) // don't add trailing slash
    .use(Dropbox, { target: Dashboard, companionUrl: SERVER_BASE_URL })
    .use(Facebook, { target: Dashboard, companionUrl: SERVER_BASE_URL })
    .use(Webcam, { target: Dashboard })
    .use(Url, { target: Dashboard, companionUrl: SERVER_BASE_URL })
    .use(ImageKitUppyPlugin, {
        id: 'ImageKit',
        publicKey: IMAGEKIT_PUBLIC_KEY,
        authenticator,
        metaFields: [
            "useUniqueFileName",
            "tags",
            "folder",
            "isPrivateFile",
            "customCoordinates",
            "responseFields"
        ]
    })

uppy.on('success', (fileCount) => {
    console.log(`${fileCount} files uploaded`)
})