import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from root
dotenv.config({ path: join(__dirname, '..', '.env') });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

async function importData() {
    console.log('Starting import process...');

    if (!firebaseConfig.apiKey) {
        console.error('Error: Firebase API Key missing in .env');
        console.log('Environment variables found:', Object.keys(process.env).filter(k => k.startsWith('VITE_FIREBASE')));
        process.exit(1);
    }

    console.log('Firebase Config loaded for Project:', firebaseConfig.projectId);

    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        console.log('Firebase app initialized.');

        const dataPath = join(__dirname, '..', 'data', '10-cars-data.json');
        const data = JSON.parse(await readFile(dataPath, 'utf-8'));

        console.log(`Read ${data.length} cars from JSON.`);

        const carsCol = collection(db, 'cars');

        console.log('Checking for existing cars in Firestore...');
        const existingSnap = await getDocs(carsCol);
        console.log(`Found ${existingSnap.size} existing documents.`);

        if (existingSnap.size > 0) {
            console.log(`Clearing ${existingSnap.size} existing cars...`);
            for (const d of existingSnap.docs) {
                await deleteDoc(doc(db, 'cars', d.id));
                console.log(`Deleted: ${d.id}`);
            }
        }

        console.log('Importing new cars...');
        for (const car of data) {
            // Generate a slug if missing
            car.slug = car.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            car.id = crypto.randomUUID();
            car.published = true;
            car.isComingSoon = false;

            const docRef = await addDoc(carsCol, car);
            console.log(`Added: ${car.name} (Firestore ID: ${docRef.id})`);
        }

        console.log('Import completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Import failed with error:', err);
        process.exit(1);
    }
}

importData();
