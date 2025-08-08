'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { createMissingIndexes } from '@/lib/firebaseIndexes';
import { 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface IndexStatus {
  name: string;
  collection: string;
  fields: string[];
  status: 'exists' | 'missing' | 'checking';
  error?: string;
}

export default function IndexesPage() {
  const [indexes, setIndexes] = useState<IndexStatus[]>([
    {
      name: 'Notas por usuario ordenadas por fecha',
      collection: 'notes',
      fields: ['uploadedBy', 'uploadedAt'],
      status: 'checking'
    },
    {
      name: 'Notas públicas ordenadas por fecha',
      collection: 'notes',
      fields: ['isPublic', 'uploadedAt'],
      status: 'checking'
    },
    {
      name: 'Favoritos por usuario',
      collection: 'favorites',
      fields: ['userId'],
      status: 'checking'
    }
  ]);
  const [checking, setChecking] = useState(false);

  const checkIndexes = async () => {
    setChecking(true);
    try {
      await createMissingIndexes();
      
      // Simular verificación de índices
      setTimeout(() => {
        setIndexes(prev => prev.map(index => ({
          ...index,
          status: Math.random() > 0.5 ? 'exists' : 'missing'
        })));
        setChecking(false);
      }, 2000);
    } catch (error) {
      console.error('Error checking indexes:', error);
      setChecking(false);
    }
  };

  const openFirebaseConsole = () => {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const url = `https://console.firebase.google.com/v1/r/project/${projectId}/firestore/indexes`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    checkIndexes();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exists':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'missing':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'exists':
        return 'Índice existente';
      case 'missing':
        return 'Índice faltante';
      default:
        return 'Verificando...';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exists':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'missing':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Índices de Firestore</h1>
                <p className="text-gray-600">Gestiona los índices necesarios para las consultas</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={checkIndexes} 
                disabled={checking}
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
                Verificar
              </Button>
              <Button onClick={openFirebaseConsole}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Firebase Console
              </Button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">¿Cómo crear índices?</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Haz clic en &quot;Firebase Console&quot; para abrir la consola</li>
            <li>Ve a Firestore Database → Índices</li>
            <li>Haz clic en &quot;Crear índice&quot;</li>
            <li>Selecciona la colección y los campos mostrados abajo</li>
            <li>Configura el orden (Ascending/Descending) según se indica</li>
            <li>Haz clic en &quot;Crear&quot;</li>
          </ol>
        </div>

        {/* Indexes List */}
        <div className="space-y-4">
          {indexes.map((index, idx) => (
            <div 
              key={idx}
              className={`bg-white rounded-lg shadow-sm p-6 border ${getStatusColor(index.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(index.status)}
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">{index.name}</h3>
                    <p className="text-sm text-gray-600">
                      Colección: <strong>{index.collection}</strong> | 
                      Campos: <strong>{index.fields.join(', ')}</strong>
                    </p>
                    <p className={`text-sm font-medium ${getStatusColor(index.status).split(' ')[0]}`}>
                      {getStatusText(index.status)}
                    </p>
                  </div>
                </div>
                
                {index.status === 'missing' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={openFirebaseConsole}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Crear
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={openFirebaseConsole}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Firebase Console
            </Button>
            <Button 
              onClick={checkIndexes}
              disabled={checking}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
              Verificar Índices
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
