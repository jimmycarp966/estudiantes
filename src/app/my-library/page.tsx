'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { NoteCard } from '@/components/notes/NoteCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { Note } from '@/types';
// Firebase imports se hacen dinámicamente
import { 
  BookOpen, 
  Search, 
 
  Plus,
  Grid,
  List,

} from 'lucide-react';
import Link from 'next/link';

export default function MyLibraryPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'downloads'>('date');

  // Cargar notas del usuario
  useEffect(() => {
    if (!user) return;
    
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;
    
    const loadNotes = async () => {
      try {
        const { getFirestore, collection, query, where, orderBy, onSnapshot } = await import('firebase/firestore');
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
        const firestore = getFirestore(app);
        
        // Query con ordenamiento (requiere índice)
        const q = query(
          collection(firestore, 'notes'),
          where('uploadedBy', '==', user.uid),
          orderBy('uploadedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const notesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            uploadedAt: doc.data().uploadedAt?.toDate() || new Date(),
          })) as Note[];
          
          // Los datos ya vienen ordenados desde Firestore
          
          setNotes(notesData);
          setLoading(false);
        }, (error) => {
          console.error('Error loading notes:', error);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error initializing Firestore:', error);
        setLoading(false);
      }
    };
    
    loadNotes();
  }, [user]);

  // Filtrar y ordenar notas
  useEffect(() => {
    let filtered = notes;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por materia
    if (selectedSubject) {
      filtered = filtered.filter(note => note.subject === selectedSubject);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'downloads':
          return b.downloads - a.downloads;
        case 'date':
        default:
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
    });

    setFilteredNotes(filtered);
  }, [notes, searchTerm, selectedSubject, sortBy]);

  const handleDelete = async (noteId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este apunte?')) return;

    try {
      const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
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
      const firestore = getFirestore(app);
      
      await deleteDoc(doc(firestore, 'notes', noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error al eliminar el apunte');
    }
  };

  const handleDownload = async (note: Note) => {
    try {
      // Incrementar contador de descargas
      const { getFirestore, doc, updateDoc, increment } = await import('firebase/firestore');
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
      const firestore = getFirestore(app);
      
      await updateDoc(doc(firestore, 'notes', note.id), {
        downloads: increment(1)
      });
    } catch (error) {
      console.error('Error updating download count:', error);
    }
  };

  // Obtener materias únicas
  const subjects = Array.from(new Set(notes.map(note => note.subject))).sort();

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mi Biblioteca</h1>
                <p className="text-gray-600">Gestiona tus apuntes personales</p>
              </div>
            </div>
            <Link href="/upload">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Subir Apunte
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Buscar apuntes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las materias</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'downloads')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Más recientes</option>
                <option value="title">Por título</option>
                <option value="downloads">Más descargados</option>
              </select>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredNotes.length} apunte{filteredNotes.length !== 1 ? 's' : ''} encontrado{filteredNotes.length !== 1 ? 's' : ''}
            </p>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Notes Grid/List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando apuntes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {notes.length === 0 ? 'No tienes apuntes aún' : 'No se encontraron apuntes'}
            </h3>
            <p className="text-gray-600 mb-6">
              {notes.length === 0 
                ? 'Comienza subiendo tu primer apunte para organizar tu biblioteca personal.'
                : 'Intenta cambiar los filtros de búsqueda.'
              }
            </p>
            {notes.length === 0 && (
              <Link href="/upload">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Subir Primer Apunte
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                showActions={true}
                onDelete={handleDelete}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}