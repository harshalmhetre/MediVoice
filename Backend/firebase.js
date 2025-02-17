const admin=require('firebase-admin')
const serviceAccount=require('./prescriptionapp-feff3-firebase-adminsdk-fbsvc-bcd534519a.json');

admin.initializeApp({
    credential:admin.credential.cert(serviceAccount)
});

module.exports=admin
