import Uppy from '@uppy/core'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import Url from '@uppy/url'
import Dashboard from '@uppy/dashboard'
import ImageKitUppyPlugin from "imagekit-uppy-plugin"
import GoogleDrive from '@uppy/google-drive'
import Dropbox from '@uppy/dropbox'
import Facebook from '@uppy/facebook'

const SERVER_BASE_URL = "http://localhost:3020";
const IMAGEKIT_PUBLIC_KEY = "your_public_key";

if(IMAGEKIT_PUBLIC_KEY === "your_public_key") {
    console.error("Enter your public key in client side JS file")
    alert("Enter your public key in client side JS file");
}

const metaFields = [
    {
        id: 'name', name: 'File name', placeholder: 'Enter the file name'
    },
    { id: 'folder', name: 'Folder path', placeholder: 'The destination path e.g. /website-assets' },
    {
        id: 'useUniqueFileName', name: "Use unique file name", render: function ({ value, onChange }, h) {
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
        id: 'isPrivateFile', name: 'Private File', render: function ({ value, onChange }, h) {
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
    { id: 'tags', name: 'Tags', placeholder: 'Comma seperated tags e.g. t-shirt,summer' },
    { id: 'customCoordinates', name: 'Custom coodinates', placeholder: 'Comma seperated values in format x,y,width,height' },
];

const uppy = Uppy({ debug: true, autoProceed: false })
    .use(Dashboard, { inline: true, trigger: '#uppyDashboard', metaFields: metaFields })
    .use(GoogleDrive, { target: Dashboard, companionUrl: SERVER_BASE_URL }) // don't had trailing slash
    .use(Dropbox, { target: Dashboard, companionUrl: SERVER_BASE_URL })
    .use(Facebook, { target: Dashboard, companionUrl: SERVER_BASE_URL })
    .use(Url, { target: Dashboard, companionUrl: SERVER_BASE_URL })
    .use(ImageKitUppyPlugin, {
        id: 'ImageKit',
        authenticationEndpoint: `${SERVER_BASE_URL}/auth`,
        publicKey: IMAGEKIT_PUBLIC_KEY,
        metaFields: ["useUniqueFileName", "tags", "folder", "isPrivateFile", "customCoordinates", "responseFields"]
    })

uppy.on('success', (fileCount) => {
    console.log(`${fileCount} files uploaded`)
})