'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PomodoroTimer } from '@/components/study-tools/PomodoroTimer';
import { AISummaryWidget } from '@/components/ai/AISummaryWidget';
import { AIFlashcardsWidget } from '@/components/ai/AIFlashcardsWidget';
import { AIStudyPlanWidget } from '@/components/ai/AIStudyPlanWidget';
import { 
  Clock, 
  Brain, 
  Target, 
  Calendar,

  Zap
} from 'lucide-react';

export default function StudyToolsPage() {
  const tools = [
    {
      name: 'Temporizador Pomodoro',
      description: 'Técnica de gestión del tiempo para mantener la concentración',
      icon: Clock,
      color: 'bg-red-500',
      component: 'pomodoro'
    },
    {
      name: 'Flashcards',
      description: 'Tarjetas de estudio para memorización activa',
      icon: Brain,
      color: 'bg-blue-500',
      component: 'flashcards'
    },
    {
      name: 'Metas de Estudio',
      description: 'Establece y sigue objetivos de aprendizaje',
      icon: Target,
      color: 'bg-green-500',
      component: 'goals'
    },
    {
      name: 'Planificador',
      description: 'Organiza tus sesiones de estudio y exámenes',
      icon: Calendar,
      color: 'bg-purple-500',
      component: 'planner'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Herramientas de Estudio</h1>
              <p className="text-gray-600">Potencia tu aprendizaje con técnicas probadas</p>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pomodoro Timer - Featured */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <Clock className="h-6 w-6 text-red-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Temporizador Pomodoro</h2>
              </div>
              <PomodoroTimer />
            </div>
          </div>

          {/* AI Tools */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <Brain className="h-6 w-6 text-purple-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Herramientas de IA</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AISummaryWidget
                  title="Demo de Resumen"
                  subject="Matemáticas"
                  content="Este es un contenido de ejemplo para demostrar las capacidades de la IA. La inteligencia artificial puede analizar textos educativos y generar resúmenes automáticos, extraer puntos clave, crear preguntas de estudio y estimar el tiempo de aprendizaje necesario."
                />
                <AIFlashcardsWidget
                  title="Demo de Flashcards"
                  subject="Matemáticas"
                  content="Este es un contenido de ejemplo para demostrar las capacidades de la IA. La inteligencia artificial puede analizar textos educativos y generar resúmenes automáticos, extraer puntos clave, crear preguntas de estudio y estimar el tiempo de aprendizaje necesario."
                />
                <AIStudyPlanWidget />
              </div>
            </div>
          </div>

          {/* Coming Soon Tools */}
          {tools.slice(1).map((tool) => {
            const Icon = tool.icon;
            return (
              <div key={tool.name} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <div className={`${tool.color} p-3 rounded-lg mr-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
                    <p className="text-gray-600 text-sm">{tool.description}</p>
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="text-gray-400 mb-2">
                    <Icon className="h-12 w-12 mx-auto" />
                  </div>
                  <h4 className="text-gray-600 font-medium mb-2">Próximamente</h4>
                  <p className="text-gray-500 text-sm">
                    Esta herramienta estará disponible en una próxima actualización
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Study Tips */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Consejos de Estudio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">📚 Técnica Feynman</h3>
              <p className="text-blue-800 text-sm">
                Explica conceptos complejos con palabras simples para verificar tu comprensión.
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">🔄 Repetición Espaciada</h3>
              <p className="text-green-800 text-sm">
                Revisa el material en intervalos crecientes para mejorar la retención.
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-medium text-purple-900 mb-2">🎯 Estudio Activo</h3>
              <p className="text-purple-800 text-sm">
                Involúcrate activamente: haz preguntas, resúmenes y practica problemas.
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="font-medium text-orange-900 mb-2">⏰ Gestión del Tiempo</h3>
              <p className="text-orange-800 text-sm">
                Divide tu tiempo de estudio en bloques enfocados con descansos regulares.
              </p>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-medium text-red-900 mb-2">🏠 Ambiente de Estudio</h3>
              <p className="text-red-800 text-sm">
                Crea un espacio de estudio libre de distracciones y bien organizado.
              </p>
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-4">
              <h3 className="font-medium text-indigo-900 mb-2">💪 Autocuidado</h3>
              <p className="text-indigo-800 text-sm">
                Mantén un buen descanso, ejercicio y alimentación para optimizar tu rendimiento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}