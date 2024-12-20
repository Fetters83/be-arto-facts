const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

(async () => {
  try {
    const testUid = 'aGPbRJGy23SBHttkb8r7aGBThUg1'; // Replace with a valid test UID
    const customToken = await admin.auth().createCustomToken(testUid);
    console.log('Custom token generated successfully:', customToken);
  } catch (error) {
    console.error('Error generating custom token:', error);
  }
})();
