// src/firebase-admin.ts
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseAdminService {
  private firebaseApp: admin.app.App;

  constructor(private readonly configService: ConfigService) {
    const serviceAccountPath = this.configService.get<string>('SERVICE_ACCOUNT_KEY_PATH')
      ? path.resolve(this.configService.get<string>('SERVICE_ACCOUNT_KEY_PATH'))
      : null;

    console.log(serviceAccountPath, "serviceAccountPath");
    
    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      try {
        const serviceAccount = JSON.parse(
          fs.readFileSync(serviceAccountPath, 'utf8')
        );

        // Check if Firebase Admin has already been initialized
        if (!admin.apps.length) {
          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
          });
          console.log('Firebase Admin initialized successfully.');
        } else {
          this.firebaseApp = admin.app();
        }
      } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
        throw error;
      }
    } else {
      console.warn(
        'Service account file not found. Firebase Admin initialization skipped.'
      );
    }
  }

  getAuth() {
    return admin.auth(this.firebaseApp);
  }

  getAdmin() {
    return admin;
  }
}
