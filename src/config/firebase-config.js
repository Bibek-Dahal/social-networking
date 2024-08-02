import admin from 'firebase-admin';
import path from 'path';

// import  serviceAccount = require('./service-account-key.json');

export const firebaseInit = async () => {
  //   console.log('cwd=====', process.cwd());
  try {
    const keyLocation = path.join(
      process.cwd(),
      'src',
      'config',
      'service-account-key.json'
    );
    //   console.log('key-location====', keyLocation);
    admin.initializeApp({
      credential: admin.credential.cert(keyLocation),
      storageBucket: 'gs://node-image-upload-2cd02.appspot.com',
    });

    const bucket = admin.storage().bucket();
    console.log('firebase initialized');
    return bucket;
  } catch (error) {
    console.log('cant initialize firebase');
  }
};
