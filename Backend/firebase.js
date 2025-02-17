const admin=require('firebase-admin')
const serviceAccount=require('./medivoice-721e9-firebase-adminsdk-fbsvc-cf6985ba9e.json');

admin.initializeApp({
    credential:admin.credential.cert(serviceAccount)
});

module.exports=admin
