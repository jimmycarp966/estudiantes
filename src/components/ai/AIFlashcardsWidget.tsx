'use client';

import { useState } from 'react';
import { AIService } from '@/lib/aiService';
import { Button } from '@/components/ui/Button';
import { 
  Brain, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  Play,
  Pause,
  SkipForward,
  Download,
  Share2
} from 'lucide-react';

interface AIFlashcardsWidgetProps {
  title: string;
  subject: string;
  content: string;
}

interface Flashcard {
  question: string;
  answer: string;
}

export const AIFlashcardsWidget: React.FC<AIFlashcardsWidgetProps> = ({
  title,
  subject,
  content
}) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null);

  const aiService = AIService.getInstance();

  const generateFlashcards = async () => {
    setLoading(true);
    try {
      const result = await aiService.generateFlashcards(content, subject);
      setFlashcards(result);
      setCurrentCard(0);
      setShowAnswer(false);
    } catch (error) {
      console.error('Error generando flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setShowAnswer(false);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const toggleAutoPlay = () => {
    if (isPlaying) {
      // Detener autoplay
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        setAutoPlayInterval(null);
      }
      setIsPlaying(false);
    } else {
      // Iniciar autoplay
      const interval = setInterval(() => {
        if (currentCard < flashcards.length - 1) {
          nextCard();
        } else {
          // Volver al inicio
          setCurrentCard(0);
          setShowAnswer(false);
        }
      }, 5000); // 5 segundos por tarjeta
      
      setAutoPlayInterval(interval);
      setIsPlaying(true);
    }
  };

  const skipToEnd = () => {
    setCurrentCard(flashcards.length - 1);
    setShowAnswer(false);
  };

  const resetCards = () => {
    setCurrentCard(0);
    setShowAnswer(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
    }
  };

  if (flashcards.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Flashcards con IA
            </h3>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            Genera tarjetas de estudio automáticamente basadas en el contenido del apunte.
          </p>

          <Button
            onClick={generateFlashcards}
            disabled={loading}
            className="w-full"
          >
            <Brain className="h-4 w-4 mr-2" />
            {loading ? 'Generando flashcards...' : 'Generar Flashcards'}
          </Button>

          <div className="text-sm text-gray-500">
            💡 La IA creará preguntas y respuestas para ayudarte a memorizar los conceptos clave.
          </div>
        </div>
      </div>
    );
  }

  const currentFlashcard = flashcards[currentCard];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Flashcards ({flashcards.length})
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateFlashcards}
            disabled={loading}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progreso</span>
          <span>{currentCard + 1} de {flashcards.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentCard + 1) / flashcards.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 mb-6 min-h-[200px] flex flex-col justify-center">
        <div className="text-center">
          <div className="mb-4">
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Pregunta {currentCard + 1}
            </h4>
            <p className="text-gray-700 text-lg leading-relaxed">
              {currentFlashcard.question}
            </p>
          </div>

          {showAnswer && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
              <h5 className="font-medium text-purple-800 mb-2">Respuesta:</h5>
              <p className="text-gray-700 leading-relaxed">
                {currentFlashcard.answer}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Navigation */}
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevCard}
            disabled={currentCard === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            onClick={toggleAnswer}
            className="flex-1 max-w-xs"
          >
            {showAnswer ? 'Ocultar Respuesta' : 'Mostrar Respuesta'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={nextCard}
            disabled={currentCard === flashcards.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Auto-play Controls */}
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoPlay}
            className={isPlaying ? 'bg-red-50 text-red-600' : ''}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? 'Pausar' : 'Autoplay'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={skipToEnd}
            disabled={currentCard === flashcards.length - 1}
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={resetCards}
          >
            <RotateCcw className="h-4 w-4" />
            Reiniciar
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(currentFlashcard.question)}
            className="flex-1"
          >
            Copiar Pregunta
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(currentFlashcard.answer)}
            className="flex-1"
          >
            Copiar Respuesta
          </Button>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const allCards = flashcards.map((card, index) => 
                `${index + 1}. ${card.question}\nRespuesta: ${card.answer}`
              ).join('\n\n');
              copyToClipboard(allCards);
            }}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-1" />
            Exportar Todas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.share?.({
                title: `Flashcards de ${title}`,
                text: `Pregunta: ${currentFlashcard.question}\nRespuesta: ${currentFlashcard.answer}`,
                url: window.location.href
              }).catch(() => {
                copyToClipboard(`${currentFlashcard.question}\n\nRespuesta: ${currentFlashcard.answer}`);
              });
            }}
            className="flex-1"
          >
            <Share2 className="h-4 w-4 mr-1" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Consejos de estudio:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Lee la pregunta cuidadosamente antes de ver la respuesta</li>
          <li>• Intenta responder mentalmente antes de mostrar la solución</li>
          <li>• Usa el autoplay para repasar rápidamente</li>
          <li>• Exporta las flashcards para estudiarlas offline</li>
        </ul>
      </div>
    </div>
  );
}; 