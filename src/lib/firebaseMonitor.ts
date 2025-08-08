// Servicio para monitorear el uso de Firebase
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

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

export interface UsageStats {
  totalUsers: number;
  totalNotes: number;
  totalSessions: number;
  totalSchemes: number;
  totalReviews: number;
  totalFavorites: number;
  totalAnalytics: number;
  publicNotes: number;
  privateNotes: number;
  totalDownloads: number;
  totalRatings: number;
  averageRating: number;
  storageUsage: {
    personal: number;
    shared: number;
    total: number;
  };
  recentActivity: {
    newUsers: number;
    newNotes: number;
    newSessions: number;
    newReviews: number;
  };
  topSubjects: Array<{ subject: string; count: number }>;
  topUniversities: Array<{ university: string; count: number }>;
}

export interface CollectionStats {
  collection: string;
  totalDocuments: number;
  sizeInBytes: number;
  lastUpdated: Date;
  growthRate: number;
}

export class FirebaseMonitor {
  static async getUsageStats(): Promise<UsageStats> {
    try {
      // Obtener estadísticas básicas
      const [
        usersSnapshot,
        notesSnapshot,
        sessionsSnapshot,
        schemesSnapshot,
        reviewsSnapshot,
        favoritesSnapshot,
        analyticsSnapshot,
        publicNotesSnapshot
      ] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'notes')),
        getDocs(collection(db, 'studySessions')),
        getDocs(collection(db, 'schemes')),
        getDocs(collection(db, 'reviews')),
        getDocs(collection(db, 'favorites')),
        getDocs(collection(db, 'analytics')),
        getDocs(query(collection(db, 'notes'), where('isPublic', '==', true)))
      ]);

      // Calcular estadísticas de notas
      const notes = notesSnapshot.docs.map(doc => doc.data());
      const totalDownloads = notes.reduce((sum, note) => sum + (note.downloads || 0), 0);
      const totalRatings = notes.reduce((sum, note) => sum + (note.ratingCount || 0), 0);
      const averageRating = notes.length > 0 
        ? notes.reduce((sum, note) => sum + (note.rating || 0), 0) / notes.length 
        : 0;

      // Obtener materias más populares
      const subjects = notes.map(note => note.subject).filter(Boolean);
      const subjectCounts = subjects.reduce((acc, subject) => {
        acc[subject] = (acc[subject] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topSubjects = Object.entries(subjectCounts)
        .map(([subject, count]) => ({ subject, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Obtener universidades más populares
      const universities = notes.map(note => note.university).filter(Boolean);
      const universityCounts = universities.reduce((acc, university) => {
        acc[university] = (acc[university] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topUniversities = Object.entries(universityCounts)
        .map(([university, count]) => ({ university, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Calcular actividad reciente (últimos 7 días)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentUsers = usersSnapshot.docs.filter(doc => {
        const createdAt = doc.data().createdAt?.toDate();
        return createdAt && createdAt > sevenDaysAgo;
      }).length;

      const recentNotes = notesSnapshot.docs.filter(doc => {
        const uploadedAt = doc.data().uploadedAt?.toDate();
        return uploadedAt && uploadedAt > sevenDaysAgo;
      }).length;

      const recentSessions = sessionsSnapshot.docs.filter(doc => {
        const createdAt = doc.data().createdAt?.toDate();
        return createdAt && createdAt > sevenDaysAgo;
      }).length;

      const recentReviews = reviewsSnapshot.docs.filter(doc => {
        const createdAt = doc.data().createdAt?.toDate();
        return createdAt && createdAt > sevenDaysAgo;
      }).length;

      return {
        totalUsers: usersSnapshot.size,
        totalNotes: notesSnapshot.size,
        totalSessions: sessionsSnapshot.size,
        totalSchemes: schemesSnapshot.size,
        totalReviews: reviewsSnapshot.size,
        totalFavorites: favoritesSnapshot.size,
        totalAnalytics: analyticsSnapshot.size,
        publicNotes: publicNotesSnapshot.size,
        privateNotes: notesSnapshot.size - publicNotesSnapshot.size,
        totalDownloads,
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        storageUsage: {
          personal: 0, // Se calcularía con Storage API
          shared: 0,   // Se calcularía con Storage API
          total: 0     // Se calcularía con Storage API
        },
        recentActivity: {
          newUsers: recentUsers,
          newNotes: recentNotes,
          newSessions: recentSessions,
          newReviews: recentReviews
        },
        topSubjects,
        topUniversities
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      throw error;
    }
  }

  static async getCollectionStats(): Promise<CollectionStats[]> {
    const collections = ['users', 'notes', 'studySessions', 'schemes', 'reviews', 'favorites', 'analytics', 'subjects'];
    const stats: CollectionStats[] = [];

    for (const collectionName of collections) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        const docs = snapshot.docs;
        
        // Calcular tamaño aproximado (estimación)
        const sizeInBytes = docs.reduce((total, doc) => {
          const data = doc.data();
          const jsonString = JSON.stringify(data);
          return total + new Blob([jsonString]).size;
        }, 0);

        // Obtener fecha de último documento
        const lastDoc = docs[doc.length - 1];
        const lastUpdated = lastDoc ? lastDoc.data().createdAt?.toDate() || new Date() : new Date();

        // Calcular tasa de crecimiento (documentos por día en los últimos 7 días)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentDocs = docs.filter(doc => {
          const createdAt = doc.data().createdAt?.toDate();
          return createdAt && createdAt > sevenDaysAgo;
        });

        const growthRate = recentDocs.length / 7; // documentos por día

        stats.push({
          collection: collectionName,
          totalDocuments: docs.length,
          sizeInBytes,
          lastUpdated,
          growthRate: Math.round(growthRate * 100) / 100
        });
      } catch (error) {
        console.error(`Error getting stats for collection ${collectionName}:`, error);
        stats.push({
          collection: collectionName,
          totalDocuments: 0,
          sizeInBytes: 0,
          lastUpdated: new Date(),
          growthRate: 0
        });
      }
    }

    return stats;
  }

  static async getRealTimeStats(callback: (stats: UsageStats) => void): Promise<() => void> {
    // Suscribirse a cambios en tiempo real
    const unsubscribe = onSnapshot(collection(db, 'notes'), async () => {
      try {
        const stats = await this.getUsageStats();
        callback(stats);
      } catch (error) {
        console.error('Error in real-time stats:', error);
      }
    });

    return unsubscribe;
  }

  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getUsageAlerts(stats: UsageStats): Array<{ type: 'warning' | 'error' | 'info'; message: string }> {
    const alerts: Array<{ type: 'warning' | 'error' | 'info'; message: string }> = [];

    // Alertas de uso
    if (stats.totalNotes > 10000) {
      alerts.push({
        type: 'warning' as const,
        message: 'Gran cantidad de notas. Considera implementar paginación.'
      });
    }

    if (stats.totalUsers > 1000) {
      alerts.push({
        type: 'info' as const,
        message: 'Excelente crecimiento de usuarios. Considera optimizar consultas.'
      });
    }

    if (stats.averageRating < 3.0 && stats.totalRatings > 100) {
      alerts.push({
        type: 'warning' as const,
        message: 'Rating promedio bajo. Revisa la calidad del contenido.'
      });
    }

    if (stats.recentActivity.newUsers === 0) {
      alerts.push({
        type: 'error' as const,
        message: 'No hay nuevos usuarios registrados en los últimos 7 días.'
      });
    }

    return alerts;
  }
}
