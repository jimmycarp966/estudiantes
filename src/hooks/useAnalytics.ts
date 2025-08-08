'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useCallback } from 'react';

interface AnalyticsEvent {
  event: string;
  userId?: string;
  properties?: Record<string, unknown>;
  timestamp: Date;
}

export const useAnalytics = () => {
  const { user } = useAuth();

  // Función para trackear eventos
  const track = useCallback(async (eventName: string, properties?: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;

    // Solo trackear si el usuario está autenticado
    if (!user?.uid) {
      console.log('Analytics: Usuario no autenticado, omitiendo evento:', eventName);
      return;
    }

    const event: AnalyticsEvent = {
      event: eventName,
      userId: user.uid,
      properties: {
        ...properties,
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date()
    };

    try {
      // Guardar en Firebase Analytics
      const { getFirestore, collection, addDoc } = await import('firebase/firestore');
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

      await addDoc(collection(db, 'analytics'), event);

      // También guardar en localStorage para analytics locales
      const localEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      localEvents.push(event);
      
      // Mantener solo los últimos 100 eventos
      if (localEvents.length > 100) {
        localEvents.splice(0, localEvents.length - 100);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(localEvents));

    } catch (error) {
      console.error('Error tracking event:', error);
      
      // Fallback: guardar solo en localStorage
      try {
        const localEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
        localEvents.push(event);
        localStorage.setItem('analytics_events', JSON.stringify(localEvents));
      } catch (localError) {
        console.error('Error saving to localStorage:', localError);
      }
    }
  }, [user]);

  // Función para trackear vistas de página
  const trackPageView = useCallback((pageName: string, properties?: Record<string, unknown>) => {
    track('page_view', {
      page: pageName,
      ...properties
    });
  }, [track]);

  // Función para trackear interacciones
  const trackInteraction = useCallback((element: string, action: string, properties?: Record<string, unknown>) => {
    track('interaction', {
      element,
      action,
      ...properties
    });
  }, [track]);

  // Función para trackear conversiones
  const trackConversion = useCallback((type: string, value?: number, properties?: Record<string, unknown>) => {
    track('conversion', {
      type,
      value,
      ...properties
    });
  }, [track]);

  // Función para obtener analytics locales
  const getLocalAnalytics = useCallback(() => {
    try {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      return events;
    } catch (error) {
      console.error('Error reading local analytics:', error);
      return [];
    }
  }, []);

  // Función para obtener estadísticas de sesión
  const getSessionStats = useCallback(() => {
    if (typeof window === 'undefined') {
      return { duration: 0, pageViews: 1 };
    }
    
    const sessionStart = sessionStorage.getItem('session_start');
    const currentTime = Date.now();
    
    if (!sessionStart) {
      sessionStorage.setItem('session_start', currentTime.toString());
      return { duration: 0, pageViews: 1 };
    }

    const duration = currentTime - parseInt(sessionStart);
    const pageViews = parseInt(sessionStorage.getItem('page_views') || '1');

    return { duration, pageViews };
  }, []);

  // Trackear tiempo en página
  useEffect(() => {
    const startTime = Date.now();
    
    return () => {
      const endTime = Date.now();
      const timeSpent = endTime - startTime;
      
      if (timeSpent > 1000) { // Solo trackear si estuvo más de 1 segundo
        track('time_on_page', {
          duration: timeSpent,
          page: window.location.pathname
        });
      }
    };
  }, [track]);

  // Trackear eventos de navegador
  useEffect(() => {
    const handleBeforeUnload = () => {
      const stats = getSessionStats();
      track('session_end', stats);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        track('page_hidden');
      } else {
        track('page_visible');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [track, getSessionStats]);

  return {
    track,
    trackPageView,
    trackInteraction,
    trackConversion,
    getLocalAnalytics,
    getSessionStats
  };
};