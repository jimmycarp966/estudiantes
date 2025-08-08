'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EnhancedNoteCard } from '@/components/notes/EnhancedNoteCard';
import { AdvancedFilters } from '@/components/search/AdvancedFilters';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';


import { useAuth } from '@/contexts/AuthContext';
import { Note } from '@/types';
// Firebase imports se hacen dinámicamente
import { 
  Library,
  Star,
  Download,
  Filter
} from 'lucide-react';

export default function SharedLibraryPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const {
    filters,
    updateFilter,
    sortBy,
    setSortBy,
    filteredAndSortedNotes,
    clearFilters,
    searchStats
  } = useAdvancedSearch(notes);

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
        
        // Query con ordenamiento (requiere índice)
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
          
          // Los datos ya vienen ordenados desde Firestore
          
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

  // Las notas filtradas ahora se manejan con el hook useAdvancedSearch

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

  const handleRatingUpdate = (noteId: string, newRating: number, newCount: number) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === noteId 
          ? { ...note, rating: newRating, ratingCount: newCount }
          : note
      )
    );
  };

  const handleFavorite = async (noteId: string) => {
    if (!user) return;

    try {
      const { getFirestore, doc, setDoc, deleteDoc } = await import('firebase/firestore');
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

      const favoriteId = `${user.uid}_${noteId}`;
      
      if (favorites.has(noteId)) {
        // Remover de favoritos
        await deleteDoc(doc(db, 'favorites', favoriteId));
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(noteId);
          return newFavorites;
        });
      } else {
        // Agregar a favoritos
        await setDoc(doc(db, 'favorites', favoriteId), {
          userId: user.uid,
          noteId,
          createdAt: new Date()
        });
        setFavorites(prev => new Set(prev).add(noteId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Cargar favoritos del usuario
  useEffect(() => {
    if (!user) return;

    const loadFavorites = async () => {
      try {
        const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
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
          collection(db, 'favorites'),
          where('userId', '==', user.uid)
        );

        const favoritesSnapshot = await getDocs(q);
        const userFavorites = new Set(
          favoritesSnapshot.docs.map(doc => doc.data().noteId)
        );
        
        setFavorites(userFavorites);
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };

    loadFavorites();
  }, [user]);

  // Obtener opciones únicas para filtros
  const subjects = Array.from(new Set(notes.map(note => note.subject))).sort();
  const universities = Array.from(new Set(notes.map(note => note.university).filter(Boolean) as string[])).sort();

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

        {/* Advanced Filters */}
        <AdvancedFilters
          filters={filters}
          onFiltersChange={(newFilters) => Object.keys(newFilters).forEach(key => 
            updateFilter(key as keyof typeof newFilters, newFilters[key as keyof typeof newFilters])
          )}
          subjects={subjects}
          universities={universities}
          onClearFilters={clearFilters}
        />

        {/* Search Results Summary */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>
                {searchStats.totalResults} de {searchStats.totalNotes} apuntes
              </span>
              {searchStats.averageRating > 0 && (
                <span className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  {searchStats.averageRating.toFixed(1)} promedio
                </span>
              )}
              <span>
                {searchStats.totalDownloads.toLocaleString()} descargas totales
              </span>
            </div>
            
            {/* Sort */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'rating' | 'title')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Más recientes</option>
                <option value="popular">Más descargados</option>
                <option value="rating">Mejor valorados</option>
                <option value="title">Alfabético</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando biblioteca...</p>
          </div>
        ) : filteredAndSortedNotes.length === 0 ? (
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
            {filteredAndSortedNotes.map(note => (
              <EnhancedNoteCard
                key={note.id}
                note={note}
                onDownload={handleDownload}
                onRatingUpdate={handleRatingUpdate}
                onFavorite={handleFavorite}
                isFavorited={favorites.has(note.id)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}