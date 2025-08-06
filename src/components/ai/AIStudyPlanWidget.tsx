'use client';

import { useState } from 'react';
import { AIService } from '@/lib/aiService';
import { Button } from '@/components/ui/Button';
import { 
  Brain, 
  Clock,
  Target,
  CheckCircle,
  RotateCcw,
  Download,
  Share2
} from 'lucide-react';

interface AIStudyPlanWidgetProps {
  userId?: string;
}

interface StudyPlan {
  dailyPlan: Array<{
    subject: string;
    time: number;
    tasks: string[];
  }>;
  weeklyGoals: string[];
  tips: string[];
}

export const AIStudyPlanWidget: React.FC<AIStudyPlanWidgetProps> = () => {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<string[]>(['Matemáticas', 'Física', 'Química']);
  const [availableTime, setAvailableTime] = useState(120); // 2 horas por defecto
  const [currentDay, setCurrentDay] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const aiService = AIService.getInstance();

  const generateStudyPlan = async () => {
    setLoading(true);
    try {
      const result = await aiService.generateStudyPlan(subjects, availableTime);
      setStudyPlan(result);
      setCurrentDay(0);
      setCompletedTasks(new Set());
    } catch (error) {
      console.error('Error generando plan de estudio:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (task: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(task)) {
      newCompleted.delete(task);
    } else {
      newCompleted.add(task);
    }
    setCompletedTasks(newCompleted);
  };

  const getProgressPercentage = () => {
    if (!studyPlan) return 0;
    const totalTasks = studyPlan.dailyPlan.reduce((sum, day) => sum + day.tasks.length, 0);
    return Math.round((completedTasks.size / totalTasks) * 100);
  };

  const addSubject = () => {
    const newSubject = prompt('Ingresa el nombre de la materia:');
    if (newSubject && !subjects.includes(newSubject)) {
      setSubjects([...subjects, newSubject]);
    }
  };

  const removeSubject = (subjectToRemove: string) => {
    setSubjects(subjects.filter(subject => subject !== subjectToRemove));
  };

  if (!studyPlan) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Plan de Estudio con IA
            </h3>
          </div>
        </div>

        <div className="space-y-6">
          {/* Subjects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Materias a estudiar
            </label>
            <div className="space-y-2">
              {subjects.map((subject, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => {
                      const newSubjects = [...subjects];
                      newSubjects[index] = e.target.value;
                      setSubjects(newSubjects);
                    }}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => removeSubject(subject)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addSubject}
                className="w-full"
              >
                + Agregar Materia
              </Button>
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiempo disponible por día (minutos)
            </label>
            <input
              type="range"
              min="30"
              max="480"
              step="30"
              value={availableTime}
              onChange={(e) => setAvailableTime(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>30 min</span>
              <span className="font-medium">{availableTime} min</span>
              <span>8 horas</span>
            </div>
          </div>

          <Button
            onClick={generateStudyPlan}
            disabled={loading || subjects.length === 0}
            className="w-full"
          >
            <Brain className="h-4 w-4 mr-2" />
            {loading ? 'Generando plan...' : 'Generar Plan de Estudio'}
          </Button>

          <div className="text-sm text-gray-600">
            💡 La IA creará un plan personalizado basado en tus materias y tiempo disponible, 
            incluyendo metas semanales y consejos de estudio.
          </div>
        </div>
      </div>
    );
  }

  const currentDayPlan = studyPlan.dailyPlan[currentDay];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Plan de Estudio Personalizado
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateStudyPlan}
            disabled={loading}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progreso General</span>
          <span>{getProgressPercentage()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Daily Plan */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Plan Diario</h4>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDay(Math.max(0, currentDay - 1))}
              disabled={currentDay === 0}
            >
              ←
            </Button>
            <span className="text-sm text-gray-600">
              Día {currentDay + 1} de {studyPlan.dailyPlan.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDay(Math.min(studyPlan.dailyPlan.length - 1, currentDay + 1))}
              disabled={currentDay === studyPlan.dailyPlan.length - 1}
            >
              →
            </Button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium text-gray-900">{currentDayPlan.subject}</h5>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{currentDayPlan.time} min</span>
            </div>
          </div>

          <div className="space-y-2">
            {currentDayPlan.tasks.map((task, index) => (
              <div key={index} className="flex items-center space-x-2">
                <button
                  onClick={() => toggleTask(task)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                    completedTasks.has(task)
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {completedTasks.has(task) && <CheckCircle className="h-3 w-3" />}
                </button>
                <span className={`text-sm ${completedTasks.has(task) ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                  {task}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Goals */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-3">Metas Semanales</h4>
        <div className="space-y-2">
          {studyPlan.weeklyGoals.map((goal, index) => (
            <div key={index} className="flex items-start space-x-2">
              <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{goal}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-3">Consejos de Estudio</h4>
        <div className="space-y-2">
          {studyPlan.tips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm text-gray-700">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const planText = `Plan de Estudio Personalizado\n\n` +
              `Materias: ${subjects.join(', ')}\n` +
              `Tiempo diario: ${availableTime} minutos\n\n` +
              `Metas Semanales:\n${studyPlan.weeklyGoals.map(goal => `• ${goal}`).join('\n')}\n\n` +
              `Consejos:\n${studyPlan.tips.map(tip => `• ${tip}`).join('\n')}`;
            
            navigator.clipboard.writeText(planText);
          }}
          className="flex-1"
        >
          <Download className="h-4 w-4 mr-1" />
          Exportar Plan
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.share?.({
              title: 'Mi Plan de Estudio Personalizado',
              text: `Plan de estudio generado con IA para ${subjects.join(', ')}`,
              url: window.location.href
            }).catch(() => {
              // Fallback
            });
          }}
          className="flex-1"
        >
          <Share2 className="h-4 w-4 mr-1" />
          Compartir
        </Button>
      </div>
    </div>
  );
}; 