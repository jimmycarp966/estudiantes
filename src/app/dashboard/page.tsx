'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, 
  Download, 
  Clock, 
  TrendingUp,
  Calendar,


  Target
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Apuntes Subidos',
      value: '12',
      icon: BookOpen,
      color: 'bg-blue-500',
      change: '+2 esta semana'
    },
    {
      name: 'Descargas Totales',
      value: '48',
      icon: Download,
      color: 'bg-green-500',
      change: '+8 esta semana'
    },
    {
      name: 'Tiempo de Estudio',
      value: '24h',
      icon: Clock,
      color: 'bg-purple-500',
      change: 'Esta semana'
    },
    {
      name: 'Racha de Estudio',
      value: '5 días',
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '¡Sigue así!'
    }
  ];

  const recentActivity = [
    {
      type: 'upload',
      title: 'Subiste "Cálculo I - Derivadas"',
      time: 'Hace 2 horas',
      icon: BookOpen
    },
    {
      type: 'download',
      title: 'Descargaste "Física II - Ondas"',
      time: 'Hace 5 horas',
      icon: Download
    },
    {
      type: 'study',
      title: 'Sesión de Pomodoro completada',
      time: 'Ayer',
      icon: Clock
    }
  ];

  const upcomingEvents = [
    {
      title: 'Examen de Álgebra',
      date: '15 Nov',
      time: '14:00',
      type: 'exam'
    },
    {
      title: 'Entrega Proyecto Final',
      date: '20 Nov',
      time: '23:59',
      type: 'assignment'
    },
    {
      title: 'Sesión de Estudio - Química',
      date: 'Mañana',
      time: '16:00',
      type: 'study'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Hola, {user?.displayName?.split(' ')[0] || 'Estudiante'}! 👋
          </h1>
          <p className="text-gray-600">
            Bienvenido de vuelta. Aquí tienes un resumen de tu progreso de estudio.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    </div>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                Ver toda la actividad →
              </button>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximos Eventos</h2>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`h-2 w-2 rounded-full ${
                      event.type === 'exam' ? 'bg-red-500' :
                      event.type === 'assignment' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.date} - {event.time}</p>
                    </div>
                  </div>
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                Ver planificador completo →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-700 font-medium">Subir Apuntes</span>
            </button>
            <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <Clock className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-700 font-medium">Iniciar Pomodoro</span>
            </button>
            <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <Target className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-purple-700 font-medium">Nueva Meta</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}