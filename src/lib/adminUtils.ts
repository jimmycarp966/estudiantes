// Utilidades para administradores
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export async function promoteUserToAdmin(email: string) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);

    // Buscar usuario por email
    const usersQuery = query(collection(db, 'users'), where('email', '==', email));
    const usersSnapshot = await getDocs(usersQuery);

    if (usersSnapshot.empty) {
      throw new Error(`No se encontró usuario con email: ${email}`);
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;

    // Promover a administrador
    await updateDoc(doc(db, 'users', userId), {
      role: 'admin',
      isVerified: true
    });

    console.log(`✅ Usuario ${email} promovido a administrador exitosamente`);
    return true;
  } catch (error) {
    console.error('❌ Error promoviendo usuario:', error);
    throw error;
  }
}

export async function findUserByEmail(email: string) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);

    const usersQuery = query(collection(db, 'users'), where('email', '==', email));
    const usersSnapshot = await getDocs(usersQuery);

    if (usersSnapshot.empty) {
      return null;
    }

    const userDoc = usersSnapshot.docs[0];
    return {
      id: userDoc.id,
      ...userDoc.data()
    };
  } catch (error) {
    console.error('Error buscando usuario:', error);
    return null;
  }
}

// Función para usar desde la consola del navegador
export function setupAdminPromotion() {
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).promoteToAdmin = async (email: string) => {
      try {
        await promoteUserToAdmin(email);
        alert(`Usuario ${email} promovido a administrador exitosamente`);
      } catch (error) {
        alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    };

    (window as unknown as Record<string, unknown>).findUser = async (email: string) => {
      const user = await findUserByEmail(email);
      console.log('Usuario encontrado:', user);
      return user;
    };

    console.log('🔧 Utilidades de administrador cargadas:');
    console.log('  - promoteToAdmin(email): Promueve un usuario a administrador');
    console.log('  - findUser(email): Busca un usuario por email');
    console.log('');
    console.log('Ejemplo: promoteToAdmin("daniel@gmail.com")');
  }
}
