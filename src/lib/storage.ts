// Firebase Storage - uso dinámico para evitar errores SSR

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

export class StorageService {
  static async uploadFile(
    file: File, 
    path: string, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
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
    const storage = getStorage(app);
    const storageRef = ref(storage, path);
    
    if (onProgress) {
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress: UploadProgress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            };
            onProgress(progress);
          },
          (error) => {
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } else {
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    }
  }

  static async deleteFile(path: string): Promise<void> {
    const { getStorage, ref, deleteObject } = await import('firebase/storage');
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
    const storage = getStorage(app);
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  }

  static async getFileMetadata(path: string) {
    const { getStorage, ref, getMetadata } = await import('firebase/storage');
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
    const storage = getStorage(app);
    const storageRef = ref(storage, path);
    return await getMetadata(storageRef);
  }

  static generateFilePath(userId: string, category: 'personal' | 'shared', fileName: string): string {
    const timestamp = Date.now();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${category}/${userId}/${timestamp}_${cleanFileName}`;
  }

  static getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || '';
  }

  static isValidFileType(fileName: string, allowedTypes: string[]): boolean {
    const extension = this.getFileExtension(fileName);
    return allowedTypes.includes(extension);
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}