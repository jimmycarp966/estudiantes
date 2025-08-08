'use client';

import { useAuth } from '@/contexts/AuthContext';

export const useAdmin = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator' || isAdmin;
  
  // Lista de emails de administradores (puedes cambiar esto)
  const adminEmails = [
    'admin@estudiantes.com',
    'tu_email@gmail.com', // Cambia por tu email
    'daniel@gmail.com', // Administrador principal
  ];

  const checkAdminStatus = async () => {
    if (!user) return false;
    
    try {
      const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
      const { initializeApp, getApps } = await import('firebase/app');
      
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };
      
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const db = getFirestore(app);

      // Si el email está en la lista de admins y no tiene rol, asignarlo
      if (adminEmails.includes(user.email) && !user.role) {
        await updateDoc(doc(db, 'users', user.uid), {
          role: 'admin',
          isVerified: true
        });
        return true;
      }

      return isAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  const promoteToModerator = async (userId: string) => {
    if (!isAdmin) throw new Error('Only admins can promote users');
    
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const { initializeApp, getApps } = await import('firebase/app');
    
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);

    await updateDoc(doc(db, 'users', userId), {
      role: 'moderator'
    });
  };

  const promoteToAdmin = async (userId: string) => {
    if (!isAdmin) throw new Error('Only admins can promote users to admin');
    
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const { initializeApp, getApps } = await import('firebase/app');
    
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);

    await updateDoc(doc(db, 'users', userId), {
      role: 'admin',
      isVerified: true
    });
  };

  const banUser = async (userId: string, reason: string) => {
    if (!isModerator) throw new Error('Only moderators can ban users');
    
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const { initializeApp, getApps } = await import('firebase/app');
    
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);

    await updateDoc(doc(db, 'users', userId), {
      isBanned: true,
      banReason: reason,
      bannedAt: new Date()
    });
  };

  return {
    isAdmin,
    isModerator,
    checkAdminStatus,
    promoteToModerator,
    promoteToAdmin,
    banUser
  };
};