const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Your Firebase JSON Key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "pfe-dev-45fd3.firebasestorage.app" , // Ensure this is in your .env
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
