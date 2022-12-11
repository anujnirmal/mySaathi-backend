const admin = require("firebase-admin"); //firebase admin for push notification

// Get the json file containing service account keys
// This can be downloaded from, console.firebase.com > project settings > service account
// And then hitting generate 
const serviceAccount = require("../firebase.json"); 

// Initialize the app with the service account keys
const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = firebase;