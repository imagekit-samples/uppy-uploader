import Uppy from '@uppy/core'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import Url from '@uppy/url'
import Dashboard from '@uppy/dashboard'
import ImageKitUppyPlugin from "imagekit-uppy-plugin"
import GoogleDrive from '@uppy/google-drive'
import Dropbox from '@uppy/dropbox'
import Facebook from '@uppy/facebook'

const SERVER_URL = "https://593487260f15.ngrok.io";
const IMAGEKIT_PUBLIC_KEY = "public_BimyddYm83A5tzSLpdF71jNfgoI=";

const uppy = Uppy({ debug: true, autoProceed: false })
    .use(Dashboard, { inline: true, trigger: '#uppyDashboard' })
    .use(GoogleDrive, { target: Dashboard, companionUrl: SERVER_URL }) // don't had trailing slash
    .use(Dropbox, { target: Dashboard, companionUrl: SERVER_URL})
    .use(Facebook, { target: Dashboard, companionUrl: SERVER_URL})
    .use(Url, { target: Dashboard, companionUrl: SERVER_URL })
    .use(ImageKitUppyPlugin, {
        id: 'ImageKit',
        authenticationEndpoint: `${SERVER_URL}/auth`,
        publicKey: IMAGEKIT_PUBLIC_KEY,
        metaFields: ["useUniqueFileName", "tags", "folder", "isPrivateFile", "customCoordinates", "responseFields"]
    })

uppy.on('success', (fileCount) => {
    console.log(`${fileCount} files uploaded`)
})