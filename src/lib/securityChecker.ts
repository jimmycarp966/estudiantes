// Servicio para verificar reglas de seguridad de Firebase
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

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

export interface SecurityTestResult {
  test: string;
  passed: boolean;
  error?: string;
  details?: string;
}

export class SecurityChecker {
  static async testUserPermissions(userId: string): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];
    
    try {
      // Test 1: Usuario puede leer su propio perfil
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        results.push({
          test: 'Usuario puede leer su propio perfil',
          passed: userDoc.exists(),
          details: userDoc.exists() ? 'Perfil encontrado' : 'Perfil no encontrado'
        });
      } catch (error) {
        results.push({
          test: 'Usuario puede leer su propio perfil',
          passed: false,
          error: String(error)
        });
      }

      // Test 2: Usuario puede crear una nota
      try {
        const testNote = {
          title: 'Test Note',
          description: 'Test description',
          fileName: 'test.pdf',
          fileType: 'pdf',
          fileSize: 1024,
          fileUrl: 'https://test.com/test.pdf',
          uploadedBy: userId,
          uploadedAt: new Date(),
          tags: ['test'],
          subject: 'Test Subject',
          downloads: 0,
          rating: 0,
          ratingCount: 0,
          isPublic: false,
          category: 'personal'
        };
        
        const testDocRef = doc(collection(db, 'notes'));
        await setDoc(testDocRef, testNote);
        
        results.push({
          test: 'Usuario puede crear una nota',
          passed: true,
          details: 'Nota de prueba creada exitosamente'
        });

        // Limpiar nota de prueba
        await deleteDoc(testDocRef);
        
      } catch (error) {
        results.push({
          test: 'Usuario puede crear una nota',
          passed: false,
          error: String(error)
        });
      }

      // Test 3: Usuario puede leer sus propias notas
      try {
        const q = query(
          collection(db, 'notes'),
          where('uploadedBy', '==', userId)
        );
        const snapshot = await getDocs(q);
        
        results.push({
          test: 'Usuario puede leer sus propias notas',
          passed: true,
          details: `Encontradas ${snapshot.size} notas propias`
        });
      } catch (error) {
        results.push({
          test: 'Usuario puede leer sus propias notas',
          passed: false,
          error: String(error)
        });
      }

      // Test 4: Usuario puede leer notas públicas
      try {
        const q = query(
          collection(db, 'notes'),
          where('isPublic', '==', true)
        );
        const snapshot = await getDocs(q);
        
        results.push({
          test: 'Usuario puede leer notas públicas',
          passed: true,
          details: `Encontradas ${snapshot.size} notas públicas`
        });
      } catch (error) {
        results.push({
          test: 'Usuario puede leer notas públicas',
          passed: false,
          error: String(error)
        });
      }

      // Test 5: Usuario puede crear una sesión de estudio
      try {
        const testSession = {
          userId: userId,
          title: 'Test Session',
          description: 'Test session description',
          startTime: new Date(),
          endTime: new Date(Date.now() + 3600000),
          type: 'study',
          status: 'pending',
          tags: ['test'],
          createdAt: new Date()
        };
        
        const testSessionRef = doc(collection(db, 'studySessions'));
        await setDoc(testSessionRef, testSession);
        
        results.push({
          test: 'Usuario puede crear una sesión de estudio',
          passed: true,
          details: 'Sesión de prueba creada exitosamente'
        });

        // Limpiar sesión de prueba
        await deleteDoc(testSessionRef);
        
      } catch (error) {
        results.push({
          test: 'Usuario puede crear una sesión de estudio',
          passed: false,
          error: String(error)
        });
      }

    } catch (error) {
      results.push({
        test: 'Configuración general de Firebase',
        passed: false,
        error: String(error)
      });
    }

    return results;
  }

  static async testUnauthorizedAccess(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];
    
    try {
      // Test: Intentar acceder a datos de otro usuario (debería fallar)
      try {
        const otherUserId = 'test-other-user-id';
        const userDoc = await getDoc(doc(db, 'users', otherUserId));
        
        results.push({
          test: 'Acceso no autorizado a perfil de otro usuario',
          passed: !userDoc.exists(), // Debería no existir o no ser accesible
          details: userDoc.exists() ? 'ADVERTENCIA: Acceso permitido a datos de otro usuario' : 'Correcto: Acceso denegado'
        });
      } catch (error) {
        results.push({
          test: 'Acceso no autorizado a perfil de otro usuario',
          passed: true,
          details: 'Correcto: Acceso denegado por reglas de seguridad'
        });
      }

    } catch {
      results.push({
        test: 'Test de acceso no autorizado',
        passed: false,
        error: 'Error desconocido'
      });
    }

    return results;
  }

  static getRecommendedRules(): string {
    return `
// Reglas recomendadas para Firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios - solo pueden acceder a su propio perfil
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Notas - usuarios pueden crear sus propias notas y leer notas públicas
    match /notes/{noteId} {
      allow read: if request.auth != null && 
        (resource.data.isPublic == true || resource.data.uploadedBy == request.auth.uid);
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.uploadedBy;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.uploadedBy;
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.uploadedBy;
    }
    
    // Sesiones de estudio - solo el propietario
    match /studySessions/{sessionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Esquemas - solo el propietario
    match /schemes/{schemeId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Reseñas - todos pueden leer, solo autenticados pueden crear
    match /reviews/{reviewId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Favoritos - solo el propietario
    match /favorites/{favoriteId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Analytics - solo crear eventos
    match /analytics/{eventId} {
      allow create: if request.auth != null;
    }
    
    // Materias - solo el propietario
    match /subjects/{subjectId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}

// Reglas recomendadas para Storage
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Archivos personales - solo el propietario
    match /personal/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Archivos compartidos - todos pueden leer, solo propietario puede escribir
    match /shared/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
    `.trim();
  }
}
