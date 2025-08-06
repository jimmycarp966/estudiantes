'use client';

import { useState } from 'react';
import { AIService } from '@/lib/aiService';
import { Button } from '@/components/ui/Button';
import { 
  Brain, 
  BookOpen, 
  Target, 
  Clock, 
  Tag, 
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Copy,
  Check
} from 'lucide-react';

interface AISummaryWidgetProps {
  noteId: string;
  title: string;
  subject: string;
  content: string;
  onSummaryGenerated?: (summary: {
    summary: string;
    keyPoints: string[];
    questions: string[];
    difficulty: string;
    estimatedTime: number;
    tags: string[];
  }) => void;
}

export const AISummaryWidget: React.FC<AISummaryWidgetProps> = ({
  noteId,
  title,
  subject,
  content,
  onSummaryGenerated
}) => {
  const [summary, setSummary] = useState<{
    summary: string;
    keyPoints: string[];
    questions: string[];
    difficulty: string;
    estimatedTime: number;
    tags: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [summaryType, setSummaryType] = useState<'summary' | 'key-points' | 'questions' | 'mind-map'>('summary');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']));
  const [copied, setCopied] = useState<string | null>(null);

  const aiService = AIService.getInstance();

  const generateSummary = async () => {
    setLoading(true);
    try {
      const result = await aiService.generateSummary({
        content,
        subject,
        title,
        type: summaryType
      });
      
      setSummary(result);
      onSummaryGenerated?.(result);
    } catch (error) {
      console.error('Error generando resumen:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Principiante';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      default:
        return 'Intermedio';
    }
  };

  if (!summary) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Resumen con IA
            </h3>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de resumen
            </label>
            <select
              value={summaryType}
              onChange={(e) => setSummaryType(e.target.value as any)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="summary">Resumen completo</option>
              <option value="key-points">Puntos clave</option>
              <option value="questions">Preguntas de estudio</option>
              <option value="mind-map">Estructura de mapa mental</option>
            </select>
          </div>

          <Button
            onClick={generateSummary}
            disabled={loading}
            className="w-full"
          >
            <Brain className="h-4 w-4 mr-2" />
            {loading ? 'Generando resumen...' : 'Generar Resumen con IA'}
          </Button>

          <p className="text-sm text-gray-600">
            💡 La IA analizará el contenido y generará un resumen personalizado con puntos clave, 
            preguntas de estudio y tiempo estimado de aprendizaje.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Resumen Generado por IA
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(JSON.stringify(summary as any, null, 2), 'full')}
          >
            {copied === 'full' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateSummary()}
            disabled={loading}
          >
            <Brain className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {(summary as any).estimatedTime} min
            </span>
          </div>
          <p className="text-xs text-blue-700">Tiempo estimado</p>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-green-600" />
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor((summary as any).difficulty)}`}>
              {getDifficultyText((summary as any).difficulty)}
            </span>
          </div>
          <p className="text-xs text-green-700">Nivel de dificultad</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">
              {(summary as any).tags?.length || 0} tags
            </span>
          </div>
          <p className="text-xs text-purple-700">Conceptos clave</p>
        </div>
      </div>

      {/* Summary Section */}
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('summary')}
            className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-900">Resumen</span>
            </div>
            {expandedSections.has('summary') ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          
          {expandedSections.has('summary') && (
            <div className="px-4 pb-4">
              <p className="text-gray-700 leading-relaxed mb-3">
                {(summary as any).summary}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard((summary as any).summary, 'summary')}
              >
                {copied === 'summary' ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                Copiar resumen
              </Button>
            </div>
          )}
        </div>

        {/* Key Points Section */}
        {(summary as any).keyPoints && (summary as any).keyPoints.length > 0 && (
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('keyPoints')}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-gray-900">Puntos Clave</span>
                <span className="text-sm text-gray-500">({(summary as any).keyPoints.length})</span>
              </div>
              {expandedSections.has('keyPoints') ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>
            
            {expandedSections.has('keyPoints') && (
              <div className="px-4 pb-4">
                <ul className="space-y-2">
                  {(summary as any).keyPoints.map((point: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Questions Section */}
        {(summary as any).questions && (summary as any).questions.length > 0 && (
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('questions')}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-900">Preguntas de Estudio</span>
                <span className="text-sm text-gray-500">({(summary as any).questions.length})</span>
              </div>
              {expandedSections.has('questions') ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>
            
            {expandedSections.has('questions') && (
              <div className="px-4 pb-4">
                <div className="space-y-3">
                  {(summary as any).questions.map((question: string, index: number) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-3">
                      <p className="text-gray-800 font-medium">
                        {index + 1}. {question}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tags Section */}
        {(summary as any).tags && (summary as any).tags.length > 0 && (
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('tags')}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-gray-900">Conceptos Clave</span>
                <span className="text-sm text-gray-500">({(summary as any).tags.length})</span>
              </div>
              {expandedSections.has('tags') ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>
            
            {expandedSections.has('tags') && (
              <div className="px-4 pb-4">
                <div className="flex flex-wrap gap-2">
                  {(summary as any).tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateSummary()}
          disabled={loading}
          className="flex-1"
        >
          <Brain className="h-4 w-4 mr-2" />
          Regenerar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => copyToClipboard(JSON.stringify(summary as any, null, 2), 'full')}
        >
          {copied === 'full' ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.share?.({
              title: `Resumen de ${title}`,
              text: (summary as any).summary,
              url: window.location.href
            }).catch(() => {
                              copyToClipboard((summary as any).summary, 'share');
            });
          }}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}; 