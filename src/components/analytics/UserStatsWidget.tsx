'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { 
  TrendingUp, 
  Download, 
  Star, 
  Clock, 
  Calendar,
  Target,
  BookOpen,
  Award,
  BarChart3,
} from 'lucide-react';

interface UserStats {
  totalStudyTime: number;
  sessionsThisWeek: number;
  notesUploaded: number;
  notesDownloaded: number;
  averageRating: number;
  studyStreak: number;
  totalSessions: number;
  favoriteSubject: string;
  weeklyGoalProgress: number;
}

export const UserStatsWidget: React.FC = () => {
  const { user } = useAuth();
  const { getLocalAnalytics, trackInteraction } = useAnalytics();
  const [stats, setStats] = useState<UserStats>({
    totalStudyTime: 0,
    sessionsThisWeek: 0,
    notesUploaded: 0,
    notesDownloaded: 0,
    averageRating: 0,
    studyStreak: 0,
    totalSessions: 0,
    favoriteSubject: '',
    weeklyGoalProgress: 0
  });
  const [loading, setLoading] = useState(true);

  const loadUserStats = useCallback(async () => {
    try {
      // Combinar datos de Firebase con analytics locales
      const localEvents = getLocalAnalytics();
      
      // Cargar estadísticas de Firebase
      const { getFirestore, doc, getDoc, collection, query, where, getDocs } = await import('firebase/firestore');
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

      // Obtener datos del usuario
      const userDoc = await getDoc(doc(db, 'users', user!.uid));
      const userData = userDoc.data();

      // Obtener notas subidas por el usuario
      const notesQuery = query(
        collection(db, 'notes'),
        where('uploadedBy', '==', user!.uid)
      );
      const notesSnapshot = await getDocs(notesQuery);
      
      // Obtener sesiones de estudio completadas
      const sessionsQuery = query(
        collection(db, 'studySessions'),
        where('userId', '==', user!.uid),
        where('status', '==', 'completed')
      );
      const sessionsSnapshot = await getDocs(sessionsQuery);

      // Calcular estadísticas
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const sessionsThisWeek = sessionsSnapshot.docs.filter(doc => {
        const sessionData = doc.data();
        const sessionDate = sessionData.createdAt?.toDate() || new Date();
        return sessionDate >= weekStart;
      }).length;

      // Calcular tiempo total de estudio (de sesiones completadas)
      const totalStudyTime = sessionsSnapshot.docs.reduce((total, doc) => {
        const sessionData = doc.data();
        const startTime = sessionData.startTime?.toDate();
        const endTime = sessionData.endTime?.toDate();
        if (startTime && endTime) {
          return total + (endTime.getTime() - startTime.getTime());
        }
        return total;
      }, 0);

      // Calcular materia favorita
      const subjectCounts: Record<string, number> = {};
      notesSnapshot.docs.forEach(doc => {
        const noteData = doc.data();
        const subject = noteData.subject || 'Sin categoría';
        subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
      });
      
      const favoriteSubject = Object.keys(subjectCounts).reduce((a, b) => 
        subjectCounts[a] > subjectCounts[b] ? a : b, 
        'Sin datos'
      );

      // Calcular promedio de calificaciones de notas subidas
      const notesWithRatings = notesSnapshot.docs.filter(doc => doc.data().ratingCount > 0);
      const averageRating = notesWithRatings.length > 0
        ? notesWithRatings.reduce((sum, doc) => sum + doc.data().rating, 0) / notesWithRatings.length
        : 0;

      // Contar descargas realizadas por el usuario (desde analytics)
      const downloadEvents = localEvents.filter((event: { event: string; properties?: { type: string } }) => 
        event.event === 'conversion' && event.properties?.type === 'download'
      );

      setStats({
        totalStudyTime: Math.floor(totalStudyTime / (1000 * 60)), // en minutos
        sessionsThisWeek,
        notesUploaded: notesSnapshot.size,
        notesDownloaded: downloadEvents.length,
        averageRating,
        studyStreak: userData?.stats?.studyStreak || 0,
        totalSessions: sessionsSnapshot.size,
        favoriteSubject,
        weeklyGoalProgress: Math.min((sessionsThisWeek / 5) * 100, 100) // Meta de 5 sesiones por semana
      });

    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user, getLocalAnalytics]);

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user, loadUserStats]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleStatClick = (statName: string) => {
    trackInteraction('user-stats', 'click', { stat: statName });
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Tus Estadísticas
        </h3>
        <button
          onClick={() => handleStatClick('refresh')}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Tiempo de Estudio */}
        <div 
          className="text-center p-3 rounded-lg bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => handleStatClick('study-time')}
        >
          <Clock className="h-6 w-6 text-blue-600 mx-auto mb-1" />
          <div className="text-lg font-semibold text-gray-900">
            {formatTime(stats.totalStudyTime)}
          </div>
          <div className="text-xs text-gray-600">Tiempo Total</div>
        </div>

        {/* Sesiones esta Semana */}
        <div 
          className="text-center p-3 rounded-lg bg-green-50 cursor-pointer hover:bg-green-100 transition-colors"
          onClick={() => handleStatClick('sessions-week')}
        >
          <Calendar className="h-6 w-6 text-green-600 mx-auto mb-1" />
          <div className="text-lg font-semibold text-gray-900">
            {stats.sessionsThisWeek}
          </div>
          <div className="text-xs text-gray-600">Esta Semana</div>
        </div>

        {/* Apuntes Subidos */}
        <div 
          className="text-center p-3 rounded-lg bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors"
          onClick={() => handleStatClick('notes-uploaded')}
        >
          <BookOpen className="h-6 w-6 text-purple-600 mx-auto mb-1" />
          <div className="text-lg font-semibold text-gray-900">
            {stats.notesUploaded}
          </div>
          <div className="text-xs text-gray-600">Apuntes Subidos</div>
        </div>

        {/* Rating Promedio */}
        <div 
          className="text-center p-3 rounded-lg bg-yellow-50 cursor-pointer hover:bg-yellow-100 transition-colors"
          onClick={() => handleStatClick('average-rating')}
        >
          <Star className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
          <div className="text-lg font-semibold text-gray-900">
            {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
          </div>
          <div className="text-xs text-gray-600">Rating Promedio</div>
        </div>
      </div>

      {/* Progreso Semanal */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Meta Semanal</span>
          <span className="text-gray-900 font-medium">
            {stats.sessionsThisWeek}/5 sesiones
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats.weeklyGoalProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Estadísticas Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 flex items-center gap-1">
            <Target className="h-4 w-4" />
            Racha de Estudio
          </span>
          <span className="font-medium text-gray-900">
            {stats.studyStreak} días
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600 flex items-center gap-1">
            <Download className="h-4 w-4" />
            Descargas
          </span>
          <span className="font-medium text-gray-900">
            {stats.notesDownloaded}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Materia Favorita
          </span>
          <span className="font-medium text-gray-900 truncate max-w-20" title={stats.favoriteSubject}>
            {stats.favoriteSubject}
          </span>
        </div>
      </div>

      {/* Logros */}
      {(stats.studyStreak >= 7 || stats.notesUploaded >= 10 || stats.averageRating >= 4) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Award className="h-4 w-4" />
            Logros Recientes
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.studyStreak >= 7 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                🔥 Racha de 7 días
              </span>
            )}
            {stats.notesUploaded >= 10 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                📚 Contribuidor Activo
              </span>
            )}
            {stats.averageRating >= 4 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                ⭐ Contenido de Calidad
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};