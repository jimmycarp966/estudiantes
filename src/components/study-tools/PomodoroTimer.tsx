'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  Play, 
  Pause, 
 
  RotateCcw,
  Coffee,
  Target,
  Settings
} from 'lucide-react';

interface PomodoroSettings {
  workDuration: number; // en minutos
  shortBreakDuration: number;
  longBreakDuration: number;
  cyclesForLongBreak: number;
}

const defaultSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  cyclesForLongBreak: 4
};

export const PomodoroTimer: React.FC = () => {
  const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings);
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [completedCycles, setCompletedCycles] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Configurar duración inicial
  useEffect(() => {
    if (currentSession === 'work') {
      setTimeLeft(settings.workDuration * 60);
    } else if (currentSession === 'shortBreak') {
      setTimeLeft(settings.shortBreakDuration * 60);
    } else {
      setTimeLeft(settings.longBreakDuration * 60);
    }
  }, [currentSession, settings]);

  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    
    // Reproducir sonido de notificación
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }

    // Mostrar notificación del navegador
    if (Notification.permission === 'granted') {
      const sessionName = currentSession === 'work' ? 'Trabajo' : 'Descanso';
      new Notification(`¡Sesión de ${sessionName} completada!`, {
        body: 'Es hora de cambiar de actividad.',
        icon: '/favicon.ico'
      });
    }

    // Cambiar al siguiente tipo de sesión
    if (currentSession === 'work') {
      const newCompletedCycles = completedCycles + 1;
      setCompletedCycles(newCompletedCycles);
      
      if (newCompletedCycles % settings.cyclesForLongBreak === 0) {
        setCurrentSession('longBreak');
      } else {
        setCurrentSession('shortBreak');
      }
    } else {
      setCurrentSession('work');
    }
  }, [currentSession, completedCycles, settings.cyclesForLongBreak]);

  // Timer
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, handleSessionComplete]);



  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    const totalDuration = currentSession === 'work' 
      ? settings.workDuration * 60
      : currentSession === 'shortBreak'
      ? settings.shortBreakDuration * 60
      : settings.longBreakDuration * 60;
    
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  };

  const getSessionColor = () => {
    switch (currentSession) {
      case 'work':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'shortBreak':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'longBreak':
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getSessionIcon = () => {
    switch (currentSession) {
      case 'work':
        return <Target className="h-6 w-6" />;
      case 'shortBreak':
        return <Coffee className="h-6 w-6" />;
      case 'longBreak':
        return <Coffee className="h-6 w-6" />;
    }
  };

  const getSessionName = () => {
    switch (currentSession) {
      case 'work':
        return 'Trabajando';
      case 'shortBreak':
        return 'Descanso Corto';
      case 'longBreak':
        return 'Descanso Largo';
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    
    // Solicitar permisos de notificación
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentSession('work');
    setCompletedCycles(0);
    setTimeLeft(settings.workDuration * 60);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
      {/* Audio element for notifications */}
      <audio
        ref={audioRef}
        preload="auto"
      >
        <source src="/notification.mp3" type="audio/mpeg" />
      </audio>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Pomodoro Timer</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
          <h3 className="font-medium text-gray-900">Configuración</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trabajo (min)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.workDuration}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  workDuration: parseInt(e.target.value) || 25 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descanso corto (min)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakDuration}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  shortBreakDuration: parseInt(e.target.value) || 5 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descanso largo (min)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreakDuration}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  longBreakDuration: parseInt(e.target.value) || 15 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciclos para descanso largo
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={settings.cyclesForLongBreak}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  cyclesForLongBreak: parseInt(e.target.value) || 4 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Session Indicator */}
      <div className={`rounded-lg p-4 mb-6 border-2 ${getSessionColor()}`}>
        <div className="flex items-center justify-center space-x-2">
          {getSessionIcon()}
          <span className="font-medium">{getSessionName()}</span>
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-6">
        <div className="text-6xl font-mono font-bold text-gray-900 mb-2">
          {formatTime(timeLeft)}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-600">
          Ciclo {completedCycles + 1}
        </p>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-3 mb-6">
        <Button
          onClick={isRunning ? () => setIsRunning(false) : handleStart}
          className="flex-1"
        >
          {isRunning ? (
            <>
              <Pause className="h-5 w-5 mr-2" />
              Pausar
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" />
              {timeLeft === (currentSession === 'work' ? settings.workDuration * 60 : 
                currentSession === 'shortBreak' ? settings.shortBreakDuration * 60 : 
                settings.longBreakDuration * 60) ? 'Iniciar' : 'Continuar'}
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleReset}
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      {/* Stats */}
      <div className="text-center text-sm text-gray-600">
        <p>Sesiones completadas hoy: {Math.floor(completedCycles / 2)}</p>
      </div>
    </div>
  );
};