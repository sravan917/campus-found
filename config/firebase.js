const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let initialized = false;

/**
 * Lazily initialize Firebase Admin SDK.
 * Called on the first request that needs auth, not at server boot.
 */
const getAdmin = () => {
  if (initialized) return admin;

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!serviceAccountPath) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_PATH is not set in .env. ' +
        'Add it and place your Firebase service-account JSON file at that path.'
    );
  }

  const resolved = path.resolve(serviceAccountPath);

  if (!fs.existsSync(resolved)) {
    throw new Error(
      `Firebase service-account file not found at: ${resolved}\n` +
        'Download it from Firebase Console → Project Settings → Service Accounts → Generate New Private Key.'
    );
  }

  const serviceAccount = require(resolved);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  initialized = true;
  console.log('Firebase Admin SDK initialized');
  return admin;
};

module.exports = getAdmin;
