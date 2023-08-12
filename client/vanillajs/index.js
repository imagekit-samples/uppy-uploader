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
const AUTHENTICATOR_TIMEOUT = 6000;

const authenticator = () => {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.timeout = AUTHENTICATOR_TIMEOUT;
        var url = `${SERVER_BASE_URL}/auth`;
        if (url.indexOf("?") === -1) {
            url += `?t=${Math.random().toString()}`;
        } else {
            url += `&t=${Math.random().toString()}`;
        }
        xhr.open('GET', url);
        xhr.ontimeout = function (e) {
            reject(["Authentication request timed out in 60 seconds", xhr]);
        };
        xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
                try {
                    var body = JSON.parse(xhr.responseText);
                    var obj = {
                        signature: body.signature,
                        expire: body.expire,
                        token: body.token
                    }
                    resolve(obj);
                } catch (ex) {
                    reject([ex, xhr]);
                }
            } else {
                try {
                    var error = JSON.parse(xhr.responseText);
                    reject([error, xhr]);
                } catch (ex) {
                    reject([ex, xhr]);
                }
            }
        });
        xhr.send();
    })
}

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