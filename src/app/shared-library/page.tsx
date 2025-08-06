'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { NoteCard } from '@/components/notes/NoteCard';
import { Input } from '@/components/ui/Input';

import { useAuth } from '@/contexts/AuthContext';
import { Note } from '@/types';
// Firebase imports se hacen dinámicamente
import { 
  Library, 
  Search, 
  Filter, 


  Star,
  Download
} from 'lucide-react';

export default function SharedLibraryPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'rating'>('recent');

  // Cargar notas públicas
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;
    
    const loadNotes = async () => {
      try {
        const { getFirestore, collection, query, where, orderBy, onSnapshot, limit } = await import('firebase/firestore');
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
        
        const q = query(
          collection(firestore, 'notes'),
          where('isPublic', '==', true),
          orderBy('uploadedAt', 'desc'),
          limit(100)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const notesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            uploadedAt: doc.data().uploadedAt?.toDate() || new Date(),
          })) as Note[];
          
          setNotes(notesData);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error loading notes:', error);
        setLoading(false);
      }
    };
    
    loadNotes();
  }, []);

  // Filtrar y ordenar notas
  useEffect(() => {
    let filtered = notes;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        note.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.career?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por materia
    if (selectedSubject) {
      filtered = filtered.filter(note => note.subject === selectedSubject);
    }

    // Filtrar por universidad
    if (selectedUniversity) {
      filtered = filtered.filter(note => note.university === selectedUniversity);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.downloads - a.downloads;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'recent':
        default:
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
    });

    setFilteredNotes(filtered);
  }, [notes, searchTerm, selectedSubject, selectedUniversity, sortBy]);

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

  // Obtener opciones únicas para filtros
  const subjects = Array.from(new Set(notes.map(note => note.subject))).sort();
  const universities = Array.from(new Set(notes.map(note => note.university).filter(Boolean))).sort();

  const stats = {
    totalNotes: notes.length,
    totalDownloads: notes.reduce((sum, note) => sum + note.downloads, 0),
    avgRating: notes.length > 0 ? notes.reduce((sum, note) => sum + (note.rating || 0), 0) / notes.length : 0,
    uniqueSubjects: subjects.length
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Library className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Biblioteca Colaborativa</h1>
              <p className="text-gray-600">Descubre y comparte apuntes con la comunidad estudiantil</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Library className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Apuntes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalNotes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-500 p-3 rounded-lg">
                <Download className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Descargas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalDownloads}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-yellow-500 p-3 rounded-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.avgRating.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-purple-500 p-3 rounded-lg">
                <Filter className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Materias</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.uniqueSubjects}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Buscar apuntes, materias, universidades..."
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

            {/* University Filter */}
            <div>
              <select
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las universidades</option>
                {universities.map(university => (
                  <option key={university} value={university}>{university}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'rating')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="recent">Más recientes</option>
                <option value="popular">Más descargados</option>
                <option value="rating">Mejor valorados</option>
              </select>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            {filteredNotes.length} apunte{filteredNotes.length !== 1 ? 's' : ''} encontrado{filteredNotes.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando biblioteca...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Library className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {notes.length === 0 ? 'La biblioteca está vacía' : 'No se encontraron apuntes'}
            </h3>
            <p className="text-gray-600">
              {notes.length === 0 
                ? 'Sé el primero en compartir apuntes con la comunidad.'
                : 'Intenta cambiar los filtros de búsqueda.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}