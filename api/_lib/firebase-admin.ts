// Firebase Admin SDK initialization for serverless functions
// Loads credentials from firebase_service_account.json or FIREBASE_SERVICE_ACCOUNT_KEY env

import { config as loadEnv } from 'dotenv';
import type { Firestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Always load .env from the repo root (process.cwd()) to avoid bundler path issues
loadEnv({ path: resolve(process.cwd(), '.env') });

let db: Firestore | null = null;

function loadServiceAccount(): { account: any | null, checkedPaths: string[] } {
    const checkedPaths: string[] = [];

    // 1. Try env var first
    const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (envKey) {
        const cleaned = envKey.trim().replace(/^['"]|['"]$/g, '');
        if (cleaned.startsWith('{')) {
            console.log('[firebase-admin] using service account from env');
            return { account: JSON.parse(cleaned), checkedPaths: ['process.env.FIREBASE_SERVICE_ACCOUNT_KEY'] };
        }
    }

    // 2. Try JSON file in project root (process.cwd())
    const keyPath = resolve(process.cwd(), 'firebase_service_account.json');
    checkedPaths.push(keyPath);

    try {
        if (existsSync(keyPath)) {
            console.log('[firebase-admin] using service account from file', keyPath);
            const raw = readFileSync(keyPath, 'utf-8');
            return { account: JSON.parse(raw), checkedPaths };
        }
    } catch { /* ignore */ }

    // Fallback to process.cwd() just in case
    const cwdPath = resolve(process.cwd(), 'firebase_service_account.json');
    if (cwdPath !== keyPath) {
        checkedPaths.push(cwdPath);
        try {
            if (existsSync(cwdPath)) {
                console.log('[firebase-admin] using service account from cwd', cwdPath);
                return { account: JSON.parse(readFileSync(cwdPath, 'utf-8')), checkedPaths };
            }
        } catch { /* ignore */ }
    }

    console.warn(`⚠️ No service account found at: \n  - ${checkedPaths.join('\n  - ')}`);
    return { account: null, checkedPaths };
}

export async function getFirestore(): Promise<Firestore> {
    if (db) return db;

    const adminModule = await import('firebase-admin');
    const admin: any = (adminModule as any).default ?? adminModule;
    const { getFirestore: getFs } = await import('firebase-admin/firestore');

    console.log('[firebase-admin] boot', {
        envProject: process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.VITE_FIREBASE_PROJECT_ID,
        hasEnvKey: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY),
        gacPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    if (!admin.apps.length) {
        const { account, checkedPaths } = loadServiceAccount();
        const projectId = "call4li"
            // || account?.project_id
            // || process.env.FIREBASE_PROJECT_ID
            // || process.env.GOOGLE_CLOUD_PROJECT
            // || process.env.GCLOUD_PROJECT
            // || process.env.VITE_FIREBASE_PROJECT_ID;

        console.log('[firebase-admin] init', {
            hasAccount: Boolean(account),
            projectId,
            checkedPaths,
        });

        if (projectId) {
            if (!process.env.GOOGLE_CLOUD_PROJECT) process.env.GOOGLE_CLOUD_PROJECT = projectId;
            if (!process.env.GCLOUD_PROJECT) process.env.GCLOUD_PROJECT = projectId;
        }

        if (!projectId) {
            throw new Error(`Missing Firebase project id.
Checked: service account project_id, FIREBASE_PROJECT_ID, GOOGLE_CLOUD_PROJECT, GCLOUD_PROJECT, VITE_FIREBASE_PROJECT_ID.
Looked for service account at: ${checkedPaths.join(', ')}
Set FIREBASE_SERVICE_ACCOUNT_KEY or place firebase_service_account.json at project root, and set FIREBASE_PROJECT_ID.`);
        }

        if (account) {
            admin.initializeApp({
                credential: admin.credential.cert(account),
                projectId,
            });
        } else {
            admin.initializeApp({ projectId });
        }
    }

    db = getFs();
    return db;
}

export async function getStorage() {
    const { getStorage: getStore } = await import('firebase-admin/storage');
    return getStore();
}
