// Utilidad para crear índices de Firestore automáticamente
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

interface IndexConfig {
  collection: string;
  fields: string[];
  query: any;
  description: string;
}

const requiredIndexes: IndexConfig[] = [
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
  }
];

export async function createMissingIndexes() {
  console.log('🔍 Verificando índices de Firestore...');
  
  for (const indexConfig of requiredIndexes) {
    try {
      // Intentar ejecutar la query para verificar si el índice existe
      await getDocs(indexConfig.query);
      console.log(`✅ Índice existente: ${indexConfig.description}`);
    } catch (error: any) {
      if (error.code === 'failed-precondition') {
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
        console.error(`❌ Error verificando índice: ${error.message}`);
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
