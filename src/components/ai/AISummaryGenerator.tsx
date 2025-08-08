'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';

interface AISummaryGeneratorProps {
  content: string;
  onSummaryGenerated?: (summary: string) => void;
}

export function AISummaryGenerator({ content, onSummaryGenerated }: AISummaryGeneratorProps) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateSummary = async () => {
    if (!content.trim()) return;
    
    setLoading(true);
    try {
      // Simulación de llamada a IA (aquí iría la integración real con OpenAI)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSummary = `Resumen generado por IA:
      
${content.slice(0, 200)}... 

Puntos clave:
• Concepto principal del contenido
• Ideas secundarias importantes
• Conclusiones relevantes

Este resumen fue generado automáticamente por la IA de E-Estudiantes.`;
      
      setSummary(mockSummary);
      onSummaryGenerated?.(mockSummary);
    } catch (error) {
      console.error('Error generando resumen:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
    }
  };

  return (
    <div className="space-y-4">
      <motion.button
        onClick={generateSummary}
        disabled={loading || !content.trim()}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {loading ? 'Generando resumen...' : 'Generar resumen con IA'}
      </motion.button>

      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg"
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Resumen generado por IA
            </h3>
            <button
              onClick={copyToClipboard}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {summary}
            </pre>
          </div>
        </motion.div>
      )}
    </div>
  );
} 