'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAdmin } from '@/hooks/useAdmin';
import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Download,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  dailyUsers: { date: string; count: number }[];
  dailyUploads: { date: string; count: number }[];
  dailyDownloads: { date: string; count: number }[];
  topSubjects: { name: string; count: number }[];
  topUploaders: { name: string; email: string; uploads: number }[];
  totalStats: {
    totalUsers: number;
    totalUploads: number;
    totalDownloads: number;
    avgRating: number;
    activeUsers: number;
  };
}

export default function AdminAnalyticsPage() {
  const { isAdmin } = useAdmin();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    dailyUsers: [],
    dailyUploads: [],
    dailyDownloads: [],
    topSubjects: [],
    topUploaders: [],
    totalStats: {
      totalUsers: 0,
      totalUploads: 0,
      totalDownloads: 0,
      avgRating: 0,
      activeUsers: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (!isAdmin) return;
    loadAnalytics();
  }, [isAdmin, selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      // Simular datos de analytics (en producción, esto vendría de Firebase Analytics)
      const mockData: AnalyticsData = {
        dailyUsers: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 50) + 10
        })).reverse(),
        dailyUploads: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 20) + 5
        })).reverse(),
        dailyDownloads: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 100) + 20
        })).reverse(),
        topSubjects: [
          { name: 'Matemáticas', count: 156 },
          { name: 'Programación', count: 134 },
          { name: 'Física', count: 98 },
          { name: 'Química', count: 87 },
          { name: 'Historia', count: 76 }
        ],
        topUploaders: [
          { name: 'Juan Pérez', email: 'juan@email.com', uploads: 23 },
          { name: 'María García', email: 'maria@email.com', uploads: 19 },
          { name: 'Carlos López', email: 'carlos@email.com', uploads: 15 },
          { name: 'Ana Martín', email: 'ana@email.com', uploads: 12 },
          { name: 'Luis González', email: 'luis@email.com', uploads: 10 }
        ],
        totalStats: {
          totalUsers: 1247,
          totalUploads: 856,
          totalDownloads: 3421,
          avgRating: 4.2,
          activeUsers: 892
        }
      };

      setAnalytics(mockData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Acceso Denegado</h3>
          <p className="text-gray-500">No tienes permisos para ver analytics.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              Analytics Avanzados
            </h1>
            <p className="mt-2 text-gray-600">
              Análisis detallado del uso y rendimiento de la plataforma
            </p>
          </div>
          
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Usuarios
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : analytics.totalStats.totalUsers.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Apuntes Subidos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : analytics.totalStats.totalUploads.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Download className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Descargas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : analytics.totalStats.totalDownloads.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-6 w-6 text-orange-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Usuarios Activos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : analytics.totalStats.activeUsers.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Rating Promedio
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : analytics.totalStats.avgRating.toFixed(1)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Activity Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Actividad Diaria
            </h3>
            <div className="h-64 flex items-end justify-center space-x-1">
              {analytics.dailyUsers.slice(-14).map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-blue-500 w-6 rounded-t"
                    style={{ height: `${(day.count / 50) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Usuarios activos por día (últimas 2 semanas)
            </p>
          </div>

          {/* Top Subjects */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Materias Más Populares
            </h3>
            <div className="space-y-3">
              {analytics.topSubjects.map((subject, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {subject.name}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(subject.count / 156) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8">
                      {subject.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Top Contribuyentes
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posición
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Apuntes Subidos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contribución
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.topUploaders.map((uploader, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {uploader.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {uploader.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {uploader.uploads}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(uploader.uploads / 23) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {Math.round((uploader.uploads / analytics.totalStats.totalUploads) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}