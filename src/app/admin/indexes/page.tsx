'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { Database, ExternalLink, AlertTriangle, CheckCircle, XCircle, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { generateFirebaseIndexCommands } from '@/lib/firebaseIndexes';

interface IndexStatus {
  collection: string;
  fields: string[];
  description: string;
  exists: boolean;
  error?: string;
}

export default function IndexesPage() {
  const { user } = useAuth();
  const [indexes, setIndexes] = useState<IndexStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const requiredIndexes = [
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

  const checkIndexes = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    setChecking(true);
    const results: IndexStatus[] = [];

    try {
      const { getFirestore, collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
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

      for (const indexConfig of requiredIndexes) {
        try {
          let testQuery;
          
          if (indexConfig.collection === 'notes' && indexConfig.fields.includes('uploadedBy')) {
            testQuery = query(
              collection(db, 'notes'),
              where('uploadedBy', '==', 'test'),
              orderBy('uploadedAt', 'desc')
            );
          } else if (indexConfig.collection === 'notes' && indexConfig.fields.includes('isPublic')) {
            testQuery = query(
              collection(db, 'notes'),
              where('isPublic', '==', true),
              orderBy('uploadedAt', 'desc')
            );
          } else if (indexConfig.collection === 'favorites') {
            testQuery = query(
              collection(db, 'favorites'),
              where('userId', '==', 'test')
            );
          } else if (indexConfig.collection === 'studySessions' && indexConfig.fields.includes('startTime')) {
            testQuery = query(
              collection(db, 'studySessions'),
              where('userId', '==', 'test'),
              orderBy('startTime', 'asc')
            );
          } else if (indexConfig.collection === 'studySessions' && indexConfig.fields.includes('status')) {
            testQuery = query(
              collection(db, 'studySessions'),
              where('userId', '==', 'test'),
              where('status', '==', 'completed')
            );
          } else if (indexConfig.collection === 'subjects') {
            testQuery = query(
              collection(db, 'subjects'),
              where('userId', '==', 'test'),
              orderBy('createdAt', 'desc')
            );
          } else if (indexConfig.collection === 'reviews') {
            testQuery = query(
              collection(db, 'reviews'),
              where('noteId', '==', 'test'),
              orderBy('createdAt', 'desc')
            );
          }

          if (testQuery) {
            await getDocs(testQuery);
            results.push({
              ...indexConfig,
              exists: true
            });
          }
        } catch (error: unknown) {
          const err = error as { code?: string; message?: string };
          if (err.code === 'failed-precondition') {
            results.push({
              ...indexConfig,
              exists: false,
              error: 'Índice faltante'
            });
          } else {
            results.push({
              ...indexConfig,
              exists: false,
              error: err.message || 'Error desconocido'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking indexes:', error);
    }

    setIndexes(results);
    setChecking(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      checkIndexes();
    }
  }, [user, checkIndexes]);

  const openFirebaseConsole = () => {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const url = `https://console.firebase.google.com/v1/r/project/${projectId}/firestore/indexes`;
    window.open(url, '_blank');
  };

  const copyCommandsToClipboard = () => {
    const commands = generateFirebaseIndexCommands();
    const commandsText = commands.join('\n');
    navigator.clipboard.writeText(commandsText);
    alert('Comandos copiados al portapapeles');
  };

  const missingIndexes = indexes.filter(index => !index.exists);
  const existingIndexes = indexes.filter(index => index.exists);

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Debes iniciar sesión para acceder a esta página.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Database className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Índices de Firestore</h1>
            <p className="text-gray-600">Gestiona los índices necesarios para el funcionamiento de la aplicación</p>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <Button 
            onClick={checkIndexes} 
            disabled={checking}
            className="flex items-center gap-2"
          >
            {checking ? 'Verificando...' : 'Verificar Índices'}
          </Button>
          
          <Button 
            onClick={openFirebaseConsole}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir Firebase Console
          </Button>

          <Button 
            onClick={copyCommandsToClipboard}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Terminal className="h-4 w-4" />
            Copiar Comandos CLI
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500">Verificando índices...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Índices faltantes */}
            {missingIndexes.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">
                    Índices Faltantes ({missingIndexes.length})
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {missingIndexes.map((index, i) => (
                    <div key={i} className="bg-white rounded-lg p-4 border border-red-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{index.description}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Colección: <span className="font-mono">{index.collection}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Campos: <span className="font-mono">{index.fields.join(', ')}</span>
                          </p>
                          {index.error && (
                            <p className="text-sm text-red-600 mt-1">{index.error}</p>
                          )}
                        </div>
                        <XCircle className="h-5 w-5 text-red-500 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
                
                                 <div className="mt-4 p-4 bg-red-100 rounded-lg">
                   <p className="text-sm text-red-800 mb-3">
                     <strong>Instrucciones:</strong> Ve a Firebase Console y crea los índices faltantes. 
                     Los índices pueden tardar varios minutos en construirse.
                   </p>
                   <div className="flex gap-2">
                     <Button 
                       onClick={copyCommandsToClipboard}
                       size="sm"
                       variant="outline"
                       className="flex items-center gap-2"
                     >
                       <Terminal className="h-3 w-3" />
                       Copiar Comandos CLI
                     </Button>
                     <Button 
                       onClick={openFirebaseConsole}
                       size="sm"
                       variant="outline"
                       className="flex items-center gap-2"
                     >
                       <ExternalLink className="h-3 w-3" />
                       Abrir Console
                     </Button>
                   </div>
                 </div>
              </div>
            )}

            {/* Índices existentes */}
            {existingIndexes.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">
                    Índices Existentes ({existingIndexes.length})
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {existingIndexes.map((index, i) => (
                    <div key={i} className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{index.description}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Colección: <span className="font-mono">{index.collection}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Campos: <span className="font-mono">{index.fields.join(', ')}</span>
                          </p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumen */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Resumen</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{indexes.length}</div>
                  <div className="text-sm text-blue-800">Total de Índices</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{existingIndexes.length}</div>
                  <div className="text-sm text-green-800">Existentes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{missingIndexes.length}</div>
                  <div className="text-sm text-red-800">Faltantes</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
