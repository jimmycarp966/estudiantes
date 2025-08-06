'use client';

import { useEffect, useState } from 'react';

export const useServiceWorker = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Verificar soporte para Service Workers
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      setRegistration(reg);
      setIsRegistered(true);

      console.log('Service Worker registrado:', reg);

      // Verificar actualizaciones
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nueva versión disponible
              setUpdateAvailable(true);
            }
          });
        }
      });

      // Escuchar cambios de controller
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Recargar página cuando se active un nuevo SW
        window.location.reload();
      });

    } catch (error) {
      console.error('Error registrando Service Worker:', error);
    }
  };

  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      // Enviar mensaje al SW para que se active
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const unregisterServiceWorker = async () => {
    if (registration) {
      const unregistered = await registration.unregister();
      if (unregistered) {
        setIsRegistered(false);
        setRegistration(null);
        console.log('Service Worker desregistrado');
      }
    }
  };

  return {
    isSupported,
    isRegistered,
    registration,
    updateAvailable,
    updateServiceWorker,
    unregisterServiceWorker
  };
};