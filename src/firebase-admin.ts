// src/firebase-admin.ts
import 'dotenv/config';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

const serviceAccountPath = process.env.SERVICE_ACCOUNT_KEY_PATH
  ? path.resolve(process.env.SERVICE_ACCOUNT_KEY_PATH)
  : null;

if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, 'utf8'),
    );

    // Check if Firebase Admin has already been initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin initialized successfully.');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
} else {
  console.error('Service account key file not found or path is not set.');
}

export default admin;
