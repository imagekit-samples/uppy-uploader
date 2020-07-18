import Uppy from '@uppy/core'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import Url from '@uppy/url'
import Dashboard from '@uppy/dashboard'
import ImageKitUppyPlugin from "imagekit-uppy-plugin"
import GoogleDrive from '@uppy/google-drive'
import Dropbox from '@uppy/dropbox'
import Facebook from '@uppy/facebook'


const uppy = Uppy({ debug: true, autoProceed: false })
    .use(Dashboard, { inline: true, trigger: '#uppyDashboard' })
    .use(GoogleDrive, { target: Dashboard, companionUrl: 'https://593487260f15.ngrok.io' }) // don't had trailing slash
    .use(Dropbox, { target: Dashboard, companionUrl: 'https://593487260f15.ngrok.io'})
    .use(Facebook, { target: Dashboard, companionUrl: 'https://593487260f15.ngrok.io'})
    .use(Url, { target: Dashboard, companionUrl: 'https://593487260f15.ngrok.io' })
    .use(ImageKitUppyPlugin, {
        id: 'ImageKit',
        authenticationEndpoint: 'https://593487260f15.ngrok.io/auth',
        publicKey: "public_BimyddYm83A5tzSLpdF71jNfgoI=",
        metaFields: ["useUniqueFileName", "tags", "folder", "isPrivateFile", "customCoordinates", "responseFields"]
    })

uppy.on('success', (fileCount) => {
    console.log(`${fileCount} files uploaded`)
})