// Utilidad para crear índices de Firestore automáticamente
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore';

import type { Query, DocumentData } from 'firebase/firestore';

interface IndexConfig {
  collection: string;
  fields: string[];
  query: Query<DocumentData, DocumentData>;
  description: string;
}

const getRequiredIndexes = (): IndexConfig[] => {
  // Solo crear queries en el cliente
  if (typeof window === 'undefined') return [];
  
  return [
    {
      collection: 'notes',
      fields: ['uploadedBy', 'uploadedAt'],
      query: query(
        collection(getFirestore(), 'notes'),
        where('uploadedBy', '==', 'test'),
        orderBy('uploadedAt', 'desc')
      ),
      description: 'Índice para notas por usuario ordenadas por fecha'
    },
    {
      collection: 'notes',
      fields: ['isPublic', 'uploadedAt'],
      query: query(
        collection(getFirestore(), 'notes'),
        where('isPublic', '==', true),
        orderBy('uploadedAt', 'desc')
      ),
      description: 'Índice para notas públicas ordenadas por fecha'
    },
    {
      collection: 'favorites',
      fields: ['userId'],
      query: query(
        collection(getFirestore(), 'favorites'),
        where('userId', '==', 'test')
      ),
      description: 'Índice para favoritos por usuario'
    },
    {
      collection: 'studySessions',
      fields: ['userId', 'startTime'],
      query: query(
        collection(getFirestore(), 'studySessions'),
        where('userId', '==', 'test'),
        orderBy('startTime', 'asc')
      ),
      description: 'Índice para sesiones de estudio por usuario ordenadas por fecha'
    },
    {
      collection: 'studySessions',
      fields: ['userId', 'status'],
      query: query(
        collection(getFirestore(), 'studySessions'),
        where('userId', '==', 'test'),
        where('status', '==', 'completed')
      ),
      description: 'Índice para sesiones de estudio completadas por usuario'
    },
    {
      collection: 'subjects',
      fields: ['userId', 'createdAt'],
      query: query(
        collection(getFirestore(), 'subjects'),
        where('userId', '==', 'test'),
        orderBy('createdAt', 'desc')
      ),
      description: 'Índice para materias por usuario ordenadas por fecha'
    },
    {
      collection: 'reviews',
      fields: ['noteId', 'createdAt'],
      query: query(
        collection(getFirestore(), 'reviews'),
        where('noteId', '==', 'test'),
        orderBy('createdAt', 'desc')
      ),
      description: 'Índice para reseñas por nota ordenadas por fecha'
    }
  ];
};

export function generateFirebaseIndexCommands(): string[] {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const commands: string[] = [];
  
  const indexes = [
    {
      collection: 'notes',
      fields: ['uploadedBy', 'uploadedAt'],
      description: 'Notas por usuario ordenadas por fecha'
    },
    {
      collection: 'notes',
      fields: ['isPublic', 'uploadedAt'],
      description: 'Notas públicas ordenadas por fecha'
    },
    {
      collection: 'favorites',
      fields: ['userId'],
      description: 'Favoritos por usuario'
    },
    {
      collection: 'studySessions',
      fields: ['userId', 'startTime'],
      description: 'Sesiones de estudio por usuario ordenadas por fecha'
    },
    {
      collection: 'studySessions',
      fields: ['userId', 'status'],
      description: 'Sesiones de estudio completadas por usuario'
    },
    {
      collection: 'subjects',
      fields: ['userId', 'createdAt'],
      description: 'Materias por usuario ordenadas por fecha'
    },
    {
      collection: 'reviews',
      fields: ['noteId', 'createdAt'],
      description: 'Reseñas por nota ordenadas por fecha'
    }
  ];

  for (const index of indexes) {
    const fieldConfigs = index.fields.map(field => {
      // Determinar el orden basado en el tipo de campo
      if (field === 'uploadedAt' || field === 'startTime' || field === 'createdAt') {
        return `${field}:desc`;
      }
      return `${field}:asc`;
    }).join(',');

    const command = `firebase firestore:indexes:create --project=${projectId} --collection=${index.collection} --fields=${fieldConfigs}`;
    commands.push(command);
  }

  return commands;
}

export async function createMissingIndexes() {
  // Solo ejecutar en el cliente
  if (typeof window === 'undefined') return;
  
  console.log('🔍 Verificando índices de Firestore...');
  
  const requiredIndexes = getRequiredIndexes();
  
  for (const indexConfig of requiredIndexes) {
    try {
      // Intentar ejecutar la query para verificar si el índice existe
      await getDocs(indexConfig.query);
      console.log(`✅ Índice existente: ${indexConfig.description}`);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code === 'failed-precondition') {
        console.warn(`⚠️ Índice faltante: ${indexConfig.description}`);
        console.warn(`📋 Crear manualmente en Firebase Console:`);
        console.warn(`   Colección: ${indexConfig.collection}`);
        console.warn(`   Campos: ${indexConfig.fields.join(', ')}`);
        
        // Mostrar enlace directo para crear el índice
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const indexUrl = `https://console.firebase.google.com/v1/r/project/${projectId}/firestore/indexes`;
        console.warn(`🔗 URL: ${indexUrl}`);
        
        // Abrir automáticamente en el navegador
        if (typeof window !== 'undefined') {
          window.open(indexUrl, '_blank');
        }
      } else {
        console.error(`❌ Error verificando índice: ${err.message}`);
      }
    }
  }
}

export async function initializeFirebaseIndexes() {
  // Solo ejecutar en el cliente
  if (typeof window === 'undefined') return;
  
  try {
    await createMissingIndexes();
  } catch (error) {
    console.error('Error inicializando índices:', error);
  }
}
