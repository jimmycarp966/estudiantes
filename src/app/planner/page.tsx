'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Plus, 
  Clock, 
  Target, 
  BookOpen,
  Edit3,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StudySession } from '@/types';

export default function PlannerPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [, setLoading] = useState(true);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    type: 'study' as StudySession['type'],
    tags: ''
  });

  const loadSessions = useCallback(async () => {
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

      const q = query(
        collection(db, 'studySessions'),
        where('userId', '==', user?.uid),
        orderBy('startTime', 'asc')
      );

      const sessionsSnapshot = await getDocs(q);
      const sessionsData = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate() || new Date(),
        endTime: doc.data().endTime?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as StudySession[];

      setSessions(sessionsData);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user, loadSessions]);

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
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

      const sessionData = {
        userId: user.uid,
        title: newSession.title,
        description: newSession.description,
        startTime: new Date(newSession.startTime),
        endTime: new Date(newSession.endTime),
        type: newSession.type,
        status: 'pending' as const,
        tags: newSession.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        createdAt: new Date()
      };

      await addDoc(collection(db, 'studySessions'), sessionData);
      
      setNewSession({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        type: 'study',
        tags: ''
      });
      setShowAddForm(false);
      await loadSessions();
    } catch (error) {
      console.error('Error adding session:', error);
      alert('Error al crear la sesión');
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
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

      await updateDoc(doc(db, 'studySessions', sessionId), {
        status: 'completed'
      });

      await loadSessions();
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const getSessionTypeColor = (type: StudySession['type']) => {
    const colors = {
      study: 'bg-blue-100 text-blue-800',
      exam: 'bg-red-100 text-red-800',
      assignment: 'bg-yellow-100 text-yellow-800',
      reminder: 'bg-green-100 text-green-800'
    };
    return colors[type];
  };

  const getSessionTypeIcon = (type: StudySession['type']) => {
    const icons = {
      study: BookOpen,
      exam: Target,
      assignment: Edit3,
      reminder: Clock
    };
    return icons[type];
  };

  const upcomingSessions = sessions.filter(s => 
    s.startTime > new Date() && s.status === 'pending'
  ).slice(0, 5);

  const todaySessions = sessions.filter(s => {
    const today = new Date();
    const sessionDate = new Date(s.startTime);
    return sessionDate.toDateString() === today.toDateString();
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-600" />
              Planificador de Estudio
            </h1>
            <p className="mt-2 text-gray-600">
              Organiza tu tiempo de estudio y mantén un seguimiento de tus objetivos académicos.
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Sesión
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sesiones</p>
                <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoy</p>
                <p className="text-2xl font-bold text-blue-600">{todaySessions.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {sessions.filter(s => s.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Próximas</p>
                <p className="text-2xl font-bold text-purple-600">{upcomingSessions.length}</p>
              </div>
              <Target className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Add Session Form */}
        {showAddForm && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Nueva Sesión de Estudio</h3>
            <form onSubmit={handleAddSession} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <Input
                    required
                    value={newSession.title}
                    onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: Estudiar Matemáticas"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={newSession.type}
                    onChange={(e) => setNewSession(prev => ({ ...prev, type: e.target.value as StudySession['type'] }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="study">Estudio</option>
                    <option value="exam">Examen</option>
                    <option value="assignment">Tarea</option>
                    <option value="reminder">Recordatorio</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha y Hora de Inicio
                  </label>
                  <Input
                    type="datetime-local"
                    required
                    value={newSession.startTime}
                    onChange={(e) => setNewSession(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha y Hora de Fin
                  </label>
                  <Input
                    type="datetime-local"
                    required
                    value={newSession.endTime}
                    onChange={(e) => setNewSession(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newSession.description}
                  onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción opcional..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etiquetas (separadas por comas)
                </label>
                <Input
                  value={newSession.tags}
                  onChange={(e) => setNewSession(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="matemáticas, cálculo, examen"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Crear Sesión
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Sessions Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Sessions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Sesiones de Hoy</h3>
            </div>
            <div className="p-6">
              {todaySessions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No tienes sesiones programadas para hoy
                </p>
              ) : (
                <div className="space-y-3">
                  {todaySessions.map((session) => {
                    const Icon = getSessionTypeIcon(session.type);
                    return (
                      <div key={session.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{session.title}</p>
                            <p className="text-sm text-gray-500">
                              {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {session.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionTypeColor(session.type)}`}>
                            {session.type}
                          </span>
                          {session.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleCompleteSession(session.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Próximas Sesiones</h3>
            </div>
            <div className="p-6">
              {upcomingSessions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No tienes sesiones programadas próximamente
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.map((session) => {
                    const Icon = getSessionTypeIcon(session.type);
                    return (
                      <div key={session.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{session.title}</p>
                            <p className="text-sm text-gray-500">
                              {session.startTime.toLocaleDateString()} - {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionTypeColor(session.type)}`}>
                          {session.type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}