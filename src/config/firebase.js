import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)




// Initialize the Firebase Admin SDK
try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin SDK initialized successfully');
    }

} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}
export const firestore = getFirestore(admin.app());
export const auth = getAuth(admin.app());

export default admin;