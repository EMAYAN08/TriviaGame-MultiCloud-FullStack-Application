const Firestore = require('@google-cloud/firestore');

// Firestore setup
// Ref: https://stackoverflow.com/questions/71581334/initializing-firestore-object-in-a-gcp-datastore
const db = new Firestore({
  projectId: 'module-7-sdp-14',
  keyFilename: 'module-7-sdp-14-8e73d061475e.json',
});

module.exports = db;
