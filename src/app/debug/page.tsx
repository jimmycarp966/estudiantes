'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function DebugPage() {
  const [config, setConfig] = useState<Record<string, string | undefined>>({});
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Verificar configuración de Firebase
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    setConfig(firebaseConfig);
  }, []);

  const testGoogleAuth = async () => {
    try {
      const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const { initializeApp, getApps } = await import('firebase/app');
      
      const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
      const auth = getAuth(app);
      const googleProvider = new GoogleAuthProvider();
      
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, googleProvider);
      alert(`Login exitoso: ${result.user.email}`);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('Error de autenticación:', error);
      setError(`Error: ${err.code} - ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug - Configuración Firebase</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuración de Firebase</h2>
          <div className="space-y-2">
            <div><strong>API Key:</strong> {config.apiKey ? '✅ Configurada' : '❌ Faltante'}</div>
            <div><strong>Auth Domain:</strong> {config.authDomain || '❌ Faltante'}</div>
            <div><strong>Project ID:</strong> {config.projectId || '❌ Faltante'}</div>
            <div><strong>Storage Bucket:</strong> {config.storageBucket || '❌ Faltante'}</div>
            <div><strong>Messaging Sender ID:</strong> {config.messagingSenderId || '❌ Faltante'}</div>
            <div><strong>App ID:</strong> {config.appId ? '✅ Configurada' : '❌ Faltante'}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Prueba de Autenticación Google</h2>
          <Button onClick={testGoogleAuth} className="mb-4">
            Probar Login con Google
          </Button>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Solución de Problemas</h2>
          <ul className="text-blue-800 space-y-2">
            <li>• <strong>Dominio no autorizado:</strong> Asegúrate de que el dominio esté en la lista de dominios autorizados en Firebase Console</li>
            <li>• <strong>Popup bloqueado:</strong> Permite popups para este sitio en tu navegador</li>
            <li>• <strong>Proveedor no habilitado:</strong> Verifica que Google esté habilitado en Firebase Auth</li>
            <li>• <strong>Variables de entorno:</strong> Asegúrate de que todas las variables estén configuradas en Vercel</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
