'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { initializeFirebaseIndexes } from '@/lib/firebaseIndexes';

interface AuthContextType {
  user: User | null;
  firebaseUser: unknown | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }
    
    const initAuth = async () => {
      try {
        const { getAuth, onAuthStateChanged } = await import('firebase/auth');
        const { getFirestore, doc, getDoc, setDoc } = await import('firebase/firestore');
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
        const auth = getAuth(app);
        const db = getFirestore(app);
        
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          setFirebaseUser(firebaseUser);
          
          if (firebaseUser) {
            // Obtener o crear perfil de usuario en Firestore
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            
            // Lista de emails de administradores
            const adminEmails = [
              'admin@estudiantes.com',
              'tu_email@gmail.com', // Cambia por tu email real
            ];
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              
              // Auto-promover a admin si el email está en la lista
              let userRole = userData.role;
              if (adminEmails.includes(firebaseUser.email!) && !userRole) {
                userRole = 'admin';
                await setDoc(doc(db, 'users', firebaseUser.uid), {
                  ...userData,
                  role: 'admin',
                  isVerified: true
                }, { merge: true });
              }
              
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                displayName: firebaseUser.displayName || userData.displayName,
                photoURL: firebaseUser.photoURL || userData.photoURL,
                createdAt: userData.createdAt?.toDate() || new Date(),
                lastLoginAt: new Date(),
                role: userRole || 'user',
                isVerified: userData.isVerified || false,
                stats: userData.stats || {
                  totalUploads: 0,
                  totalDownloads: 0,
                  totalRatings: 0,
                  studyStreak: 0
                }
              });
            } else {
              // Crear nuevo documento de usuario
              const isNewAdmin = adminEmails.includes(firebaseUser.email!);
              const newUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || '',
                createdAt: new Date(),
                lastLoginAt: new Date(),
                role: (isNewAdmin ? 'admin' : 'user') as 'user' | 'admin' | 'moderator',
                isVerified: isNewAdmin,
                stats: {
                  totalUploads: 0,
                  totalDownloads: 0,
                  totalRatings: 0,
                  studyStreak: 0
                }
              };
              
              await setDoc(doc(db, 'users', firebaseUser.uid), {
                ...newUser,
                createdAt: new Date(),
                lastLoginAt: new Date(),
              });
              
              setUser(newUser);
            }
          } else {
            setUser(null);
          }
          
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error initializing Firebase Auth:', error);
        setLoading(false);
      }
    };
    
    initAuth();
    
    // Verificar índices de Firestore
    initializeFirebaseIndexes();
  }, []);

  const login = async (email: string, password: string) => {
    const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
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
    const auth = getAuth(app);
    
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, displayName: string) => {
    const { getAuth, createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');
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
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    
    await updateProfile(firebaseUser, {
      displayName: displayName
    });

    const newUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: displayName,
      photoURL: '',
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
  };

  const loginWithGoogle = async () => {
    try {
      const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const { getFirestore, doc, getDoc, setDoc } = await import('firebase/firestore');
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
      const auth = getAuth(app);
      const db = getFirestore(app);
      const googleProvider = new GoogleAuthProvider();
      
      // Configurar parámetros del proveedor
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Agregar scopes si es necesario
      googleProvider.addScope('email');
      googleProvider.addScope('profile');
      
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Verificar si el usuario ya existe en Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Crear nuevo usuario en Firestore
        const newUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || 'Usuario',
          photoURL: firebaseUser.photoURL || '',
          createdAt: new Date(),
          lastLoginAt: new Date(),
          role: 'user',
          isVerified: true,
          stats: {
            totalUploads: 0,
            totalDownloads: 0,
            totalRatings: 0,
            studyStreak: 0
          }
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      } else {
        // Actualizar último login
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          lastLoginAt: new Date()
        }, { merge: true });
      }
      
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('Error en login con Google:', error);
      
      let errorMessage = 'Error al iniciar sesión con Google';
      
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Se cerró la ventana de Google. Intenta de nuevo.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'El navegador bloqueó la ventana de Google. Permite popups para este sitio.';
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = 'Este dominio no está autorizado para autenticación con Google.';
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'Ya existe una cuenta con este email usando otro método de autenticación.';
      }
      
      alert(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    const { getAuth, signOut } = await import('firebase/auth');
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
    const auth = getAuth(app);
    
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  const value = {
    user,
    firebaseUser,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};