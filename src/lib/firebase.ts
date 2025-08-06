import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase solo si no hay apps inicializadas
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Solo importar y exportar servicios si estamos en el cliente
let auth: unknown = null;
let db: unknown = null;
let storage: unknown = null;
let googleProvider: unknown = null;

if (typeof window !== 'undefined') {
  // Solo en el cliente
  import('firebase/auth').then((authModule) => {
    auth = authModule.getAuth(app);
    googleProvider = new authModule.GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  });
  
  import('firebase/firestore').then((firestoreModule) => {
    db = firestoreModule.getFirestore(app);
  });
  
  import('firebase/storage').then((storageModule) => {
    storage = storageModule.getStorage(app);
  });
}

export { auth, db, storage, googleProvider };
export default app;