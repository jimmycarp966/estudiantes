'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Review } from '@/types';
import { 
  Star, 
  Send, 
  ThumbsUp, 
  Flag, 
  User,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';


interface ReviewSystemProps {
  noteId: string;
  currentRating: number;
  ratingCount: number;
  onRatingUpdate: (newRating: number, newCount: number) => void;
}

export const ReviewSystem: React.FC<ReviewSystemProps> = ({
  noteId,
  currentRating,
  ratingCount,
  onRatingUpdate
}) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(true);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  const loadReviews = useCallback(async () => {
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
        collection(db, 'reviews'),
        where('noteId', '==', noteId),
        orderBy('createdAt', 'desc')
      );

      const reviewsSnapshot = await getDocs(q);
      const reviewsData = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Review[];

      setReviews(reviewsData);
      
      // Verificar si el usuario ya ha reseñado
      if (user) {
        const userReview = reviewsData.find(r => r.userId === user.uid);
        setUserHasReviewed(!!userReview);
      }

    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [noteId, user]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || userHasReviewed) return;

    try {
      const { getFirestore, collection, addDoc, doc, updateDoc, increment } = await import('firebase/firestore');
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

      // Crear la reseña
      const reviewData = {
        noteId,
        userId: user.uid,
        userDisplayName: user.displayName || 'Usuario Anónimo',
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: new Date(),
        isHelpful: 0,
        reportCount: 0
      };

      await addDoc(collection(db, 'reviews'), reviewData);

      // Actualizar el rating promedio del apunte
      const newRatingCount = ratingCount + 1;
      const newAverageRating = ((currentRating * ratingCount) + newReview.rating) / newRatingCount;

      await updateDoc(doc(db, 'notes', noteId), {
        rating: newAverageRating,
        ratingCount: increment(1)
      });

      // Actualizar estadísticas del usuario
      await updateDoc(doc(db, 'users', user.uid), {
        'stats.totalRatings': increment(1)
      });

      onRatingUpdate(newAverageRating, newRatingCount);
      setNewReview({ rating: 5, comment: '' });
      setShowAddReview(false);
      await loadReviews();

    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error al enviar la reseña');
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
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
      const db = getFirestore(app);

      await updateDoc(doc(db, 'reviews', reviewId), {
        isHelpful: increment(1)
      });

      await loadReviews();
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const handleReport = async (reviewId: string) => {
    const reason = prompt('¿Por qué quieres reportar esta reseña?');
    if (!reason || !user) return;

    try {
      const { getFirestore, collection, addDoc, doc, updateDoc, increment } = await import('firebase/firestore');
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

      // Crear reporte
      await addDoc(collection(db, 'reports'), {
        itemId: reviewId,
        itemType: 'review',
        reportedBy: user.uid,
        reason: 'inappropriate',
        description: reason,
        createdAt: new Date(),
        status: 'pending'
      });

      // Incrementar contador de reportes
      await updateDoc(doc(db, 'reviews', reviewId), {
        reportCount: increment(1)
      });

      alert('Reporte enviado exitosamente');
    } catch (error) {
      console.error('Error reporting review:', error);
    }
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onStarClick && onStarClick(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {currentRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-1">
                {renderStars(Math.round(currentRating))}
              </div>
              <div className="text-sm text-gray-500">
                {ratingCount} {ratingCount === 1 ? 'reseña' : 'reseñas'}
              </div>
            </div>
          </div>
          
          {user && !userHasReviewed && (
            <Button onClick={() => setShowAddReview(true)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Escribir Reseña
            </Button>
          )}
        </div>
      </div>

      {/* Add Review Form */}
      {showAddReview && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Escribir una reseña
          </h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calificación
              </label>
              {renderStars(newReview.rating, true, (rating) => 
                setNewReview(prev => ({ ...prev, rating }))
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentario (opcional)
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Comparte tu experiencia con este apunte..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddReview(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" />
                Enviar Reseña
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Reseñas ({reviews.length})
        </h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Cargando reseñas...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay reseñas</h3>
            <p className="mt-1 text-sm text-gray-500">
              Sé el primero en dejar una reseña de este apunte.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {review.userDisplayName}
                        </h4>
                        {renderStars(review.rating)}
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {review.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center space-x-4">
                  <button
                    onClick={() => handleHelpful(review.id)}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>Útil ({review.isHelpful})</span>
                  </button>
                  
                  {user && user.uid !== review.userId && (
                    <button
                      onClick={() => handleReport(review.id)}
                      className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600"
                    >
                      <Flag className="h-4 w-4" />
                      <span>Reportar</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};