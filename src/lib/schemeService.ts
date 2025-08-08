import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import type { UserScheme, SchemeTemplate } from '@/types/schemes';

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

// Templates predefinidos
export const predefinedTemplates: SchemeTemplate[] = [
  {
    id: 'mindmap-basic',
    name: 'Mapa Mental Básico',
    description: 'Estructura simple para organizar ideas principales y secundarias',
    category: 'mindmap',
    nodes: [
      {
        id: '1',
        type: 'input',
        position: { x: 250, y: 100 },
        data: { 
          label: 'Tema Central',
          backgroundColor: '#2563eb',
          color: 'white',
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      {
        id: '2',
        type: 'default',
        position: { x: 100, y: 200 },
        data: { 
          label: 'Subtema 1',
          backgroundColor: '#3b82f6',
          color: 'white'
        }
      },
      {
        id: '3',
        type: 'default',
        position: { x: 400, y: 200 },
        data: { 
          label: 'Subtema 2',
          backgroundColor: '#3b82f6',
          color: 'white'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
      { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' }
    ]
  },
  {
    id: 'flowchart-basic',
    name: 'Diagrama de Flujo',
    description: 'Para procesos y decisiones secuenciales',
    category: 'flowchart',
    nodes: [
      {
        id: '1',
        type: 'input',
        position: { x: 250, y: 50 },
        data: { 
          label: 'Inicio',
          backgroundColor: '#10b981',
          color: 'white'
        }
      },
      {
        id: '2',
        type: 'default',
        position: { x: 250, y: 150 },
        data: { 
          label: 'Proceso',
          backgroundColor: '#3b82f6',
          color: 'white'
        }
      },
      {
        id: '3',
        type: 'default',
        position: { x: 250, y: 250 },
        data: { 
          label: '¿Decisión?',
          backgroundColor: '#f59e0b',
          color: 'white'
        }
      },
      {
        id: '4',
        type: 'output',
        position: { x: 250, y: 350 },
        data: { 
          label: 'Fin',
          backgroundColor: '#ef4444',
          color: 'white'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
      { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
      { id: 'e3-4', source: '3', target: '4', type: 'smoothstep' }
    ]
  },
  {
    id: 'comparison-table',
    name: 'Tabla de Comparación',
    description: 'Para comparar diferentes conceptos o elementos',
    category: 'comparison',
    nodes: [
      {
        id: '1',
        type: 'input',
        position: { x: 200, y: 100 },
        data: { 
          label: 'Concepto A',
          backgroundColor: '#8b5cf6',
          color: 'white'
        }
      },
      {
        id: '2',
        type: 'input',
        position: { x: 400, y: 100 },
        data: { 
          label: 'Concepto B',
          backgroundColor: '#ec4899',
          color: 'white'
        }
      },
      {
        id: '3',
        type: 'default',
        position: { x: 200, y: 200 },
        data: { 
          label: 'Característica 1',
          backgroundColor: '#f3f4f6',
          color: '#374151'
        }
      },
      {
        id: '4',
        type: 'default',
        position: { x: 400, y: 200 },
        data: { 
          label: 'Característica 1',
          backgroundColor: '#f3f4f6',
          color: '#374151'
        }
      }
    ],
    edges: [
      { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' },
      { id: 'e2-4', source: '2', target: '4', type: 'smoothstep' }
    ]
  },
  {
    id: 'timeline-basic',
    name: 'Línea de Tiempo',
    description: 'Para eventos cronológicos',
    category: 'timeline',
    nodes: [
      {
        id: '1',
        type: 'input',
        position: { x: 100, y: 200 },
        data: { 
          label: 'Evento 1',
          backgroundColor: '#2563eb',
          color: 'white'
        }
      },
      {
        id: '2',
        type: 'default',
        position: { x: 300, y: 200 },
        data: { 
          label: 'Evento 2',
          backgroundColor: '#3b82f6',
          color: 'white'
        }
      },
      {
        id: '3',
        type: 'default',
        position: { x: 500, y: 200 },
        data: { 
          label: 'Evento 3',
          backgroundColor: '#60a5fa',
          color: 'white'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
      { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' }
    ]
  }
];

// Servicios para esquemas de usuario
export const schemeService = {
  // Guardar un nuevo esquema
  async saveScheme(scheme: Omit<UserScheme, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'schemes'), {
        ...scheme,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving scheme:', error);
      throw error;
    }
  },

  // Actualizar un esquema existente
  async updateScheme(schemeId: string, updates: Partial<UserScheme>): Promise<void> {
    try {
      const schemeRef = doc(db, 'schemes', schemeId);
      await updateDoc(schemeRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating scheme:', error);
      throw error;
    }
  },

  // Eliminar un esquema
  async deleteScheme(schemeId: string): Promise<void> {
    try {
      const schemeRef = doc(db, 'schemes', schemeId);
      await deleteDoc(schemeRef);
    } catch (error) {
      console.error('Error deleting scheme:', error);
      throw error;
    }
  },

  // Obtener esquemas de un usuario
  async getUserSchemes(userId: string): Promise<UserScheme[]> {
    try {
      const q = query(
        collection(db, 'schemes'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as UserScheme[];
    } catch (error) {
      console.error('Error getting user schemes:', error);
      throw error;
    }
  },

  // Obtener un esquema específico
  async getScheme(schemeId: string): Promise<UserScheme | null> {
    try {
      const schemeRef = doc(db, 'schemes', schemeId);
      const schemeDoc = await getDoc(schemeRef);
      
      if (schemeDoc.exists()) {
        const data = schemeDoc.data();
        return {
          id: schemeDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserScheme;
      }
      return null;
    } catch (error) {
      console.error('Error getting scheme:', error);
      throw error;
    }
  },

  // Obtener esquemas públicos
  async getPublicSchemes(): Promise<UserScheme[]> {
    try {
      const q = query(
        collection(db, 'schemes'),
        where('isPublic', '==', true),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as UserScheme[];
    } catch (error) {
      console.error('Error getting public schemes:', error);
      throw error;
    }
  }
};

// Obtener templates por categoría
export const getTemplatesByCategory = (category: string): SchemeTemplate[] => {
  return predefinedTemplates.filter(template => template.category === category);
};

// Obtener template por ID
export const getTemplateById = (templateId: string): SchemeTemplate | undefined => {
  return predefinedTemplates.find(template => template.id === templateId);
};
