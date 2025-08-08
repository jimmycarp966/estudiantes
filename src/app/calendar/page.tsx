'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StudySession } from '@/types';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';

const locales = { es } as unknown as Record<string, Locale>;
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

type RbcEvent = { id: string; title: string; start: Date; end: Date; type: StudySession['type']; };

export default function CalendarPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    type: 'study' as StudySession['type'],
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
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
      const q = query(collection(db, 'studySessions'), where('userId', '==', user.uid), orderBy('startTime', 'asc'));
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        startTime: d.data().startTime?.toDate() || new Date(),
        endTime: d.data().endTime?.toDate() || new Date(),
        createdAt: d.data().createdAt?.toDate() || new Date(),
      })) as StudySession[];
      setSessions(items);
    })();
  }, [user]);

  const events: RbcEvent[] = useMemo(() => sessions.map(s => ({
    id: s.id,
    title: s.title,
    start: new Date(s.startTime),
    end: new Date(s.endTime),
    type: s.type,
  })), [sessions]);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setShowNew(true);
    setNewSession(prev => ({ ...prev, startTime: format(start, "yyyy-MM-dd'T'HH:mm"), endTime: format(end, "yyyy-MM-dd'T'HH:mm") }));
  };

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
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
    await addDoc(collection(db, 'studySessions'), {
      userId: user.uid,
      title: newSession.title,
      description: '',
      type: newSession.type,
      startTime: new Date(newSession.startTime),
      endTime: new Date(newSession.endTime),
      status: 'pending',
      tags: [],
      createdAt: new Date(),
    });
    setShowNew(false);
    setNewSession({ title: '', type: 'study', startTime: '', endTime: '' });
    // recargar sesiones
    const { getDocs: getDocsReload, getFirestore: getDb } = await import('firebase/firestore');
    const db2 = getDb(app);
    await getDocsReload(collection(db2, 'studySessions'));
    // Nota: en producción filtrar/ordenar
  };

  const eventStyleGetter = (event: RbcEvent) => {
    const colors: Record<StudySession['type'], string> = {
      study: '#2563eb',
      exam: '#ef4444',
      assignment: '#f59e0b',
      reminder: '#10b981',
    };
    return {
      style: {
        backgroundColor: colors[event.type],
        borderRadius: 6,
        opacity: 0.9,
        color: '#fff',
        border: 'none',
        display: 'block',
      },
    };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
              <p className="text-gray-600">Visualiza tus sesiones, exámenes y entregas</p>
            </div>
          </div>
          <Button onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva entrada
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            defaultView={Views.MONTH}
            selectable
            onSelectSlot={handleSelectSlot}
            style={{ height: 700 }}
            messages={{
              month: 'Mes',
              day: 'Día',
              week: 'Semana',
              today: 'Hoy',
              previous: 'Anterior',
              next: 'Siguiente',
              date: 'Fecha',
              time: 'Hora',
              event: 'Evento',
              allDay: 'Todo el día',
              noEventsInRange: 'Sin eventos en este rango',
            }}
            eventPropGetter={eventStyleGetter}
            popup
          />
        </div>

        {showNew && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">Nueva entrada</h3>
            <form onSubmit={createSession} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input placeholder="Título" required value={newSession.title} onChange={(e) => setNewSession(p => ({ ...p, title: e.target.value }))} />
              <select
                value={newSession.type}
                onChange={(e) => setNewSession(p => ({ ...p, type: e.target.value as StudySession['type'] }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="study">Estudio</option>
                <option value="exam">Examen</option>
                <option value="assignment">Tarea</option>
                <option value="reminder">Recordatorio</option>
              </select>
              <Input type="datetime-local" required value={newSession.startTime} onChange={(e) => setNewSession(p => ({ ...p, startTime: e.target.value }))} />
              <Input type="datetime-local" required value={newSession.endTime} onChange={(e) => setNewSession(p => ({ ...p, endTime: e.target.value }))} />
              <div className="md:col-span-4 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


