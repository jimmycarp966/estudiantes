'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Pin } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SubjectItem {
  id: string;
  name: string;
  pinnedFiles: Array<{ name: string; url: string; noteId?: string }>;
  createdAt: Date;
}

export default function SubjectsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [newSubject, setNewSubject] = useState('');

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
      const q = query(collection(db, 'subjects'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate() || new Date() })) as SubjectItem[];
      setSubjects(items);
    })();
  }, [user]);

  const createSubject = async () => {
    if (!user || !newSubject.trim()) return;
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
    await addDoc(collection(db, 'subjects'), {
      userId: user.uid,
      name: newSubject.trim(),
      pinnedFiles: [],
      createdAt: new Date(),
    });
    setNewSubject('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Materias</h1>
            <p className="text-gray-600">Fija programas y archivos clave por materia</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 flex gap-2">
          <input
            type="text"
            placeholder="Nueva materia (ej: Álgebra I)"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <Button onClick={createSubject}>Crear</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <div key={s.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{s.name}</h3>
              </div>
              {s.pinnedFiles?.length ? (
                <ul className="space-y-2">
                  {s.pinnedFiles.map((f, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <a className="text-blue-600 hover:underline" href={f.url} target="_blank" rel="noreferrer">
                        {f.name}
                      </a>
                      <Pin className="h-4 w-4 text-gray-400" />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Sin archivos fijados aún</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}


