import { auth, db, storage } from './firebase';

export const requireAuth = () => {
  if (!auth) throw new Error('Firebase Auth not initialized');
  return auth;
};

export const requireDb = () => {
  if (!db) throw new Error('Firestore not initialized');
  return db;
};

export const requireStorage = () => {
  if (!storage) throw new Error('Firebase Storage not initialized');
  return storage;
};

export const isFirebaseInitialized = () => {
  return !!(auth && db && storage);
};