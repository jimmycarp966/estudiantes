'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detectar si ya está en modo standalone (PWA instalada)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Event listener para el prompt de instalación
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar el prompt solo si no está instalado y no es iOS
      if (!standalone && !iOS) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // En iOS, mostrar instrucciones manuales después de un tiempo
    if (iOS && !standalone) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 10000); // Mostrar después de 10 segundos

      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA instalada');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // No mostrar de nuevo en esta sesión
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  // No mostrar si ya está instalado o si fue dismissido
  if (isStandalone || (typeof window !== 'undefined' && sessionStorage.getItem('pwa-install-dismissed'))) {
    return null;
  }

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              {isIOS ? <Smartphone className="h-5 w-5 text-blue-600" /> : <Monitor className="h-5 w-5 text-blue-600" />}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                ¡Instala E-Estudiantes!
              </h3>
              <p className="text-sm text-gray-600">
                Accede más rápido desde tu dispositivo
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isIOS ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Para instalar en iOS:
            </p>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Toca el botón <strong>Compartir</strong> en Safari</li>
              <li>2. Selecciona <strong>&quot;Añadir a pantalla de inicio&quot;</strong></li>
              <li>3. Toca <strong>&quot;Añadir&quot;</strong> para confirmar</li>
            </ol>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Entendido
            </Button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Instalar App
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
            >
              Ahora no
            </Button>
          </div>
        )}

        <div className="mt-3 text-xs text-gray-500">
          ✨ Funciona sin internet • 📱 Acceso rápido • 🔔 Notificaciones
        </div>
      </div>
    </div>
  );
};