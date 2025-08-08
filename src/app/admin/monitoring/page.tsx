'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { FirebaseMonitor, UsageStats, CollectionStats } from '@/lib/firebaseMonitor';
import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  AlertTriangle,
  Info,
  RefreshCw,
  Download,
  Star,
  Activity
} from 'lucide-react';

export default function MonitoringPage() {
  const { user } = useAuth();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [collectionStats, setCollectionStats] = useState<CollectionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [realTimeMode, setRealTimeMode] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [stats, collections] = await Promise.all([
        FirebaseMonitor.getUsageStats(),
        FirebaseMonitor.getCollectionStats()
      ]);
      setUsageStats(stats);
      setCollectionStats(collections);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      loadStats();
    }
  }, [user]);

  useEffect(() => {
    if (!realTimeMode || !user?.uid) return;

    let unsubscribe: (() => void) | undefined;

    const setupRealTime = async () => {
      unsubscribe = await FirebaseMonitor.getRealTimeStats((stats) => {
        setUsageStats(stats);
      });
    };

    setupRealTime();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [realTimeMode, user]);

  const getAlertIcon = (type: 'warning' | 'error' | 'info') => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertColor = (type: 'warning' | 'error' | 'info') => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-red-600">
              Solo los administradores pueden acceder a esta página.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Monitoreo de Firebase</h1>
                <p className="text-gray-600">Estadísticas de uso y rendimiento de la aplicación</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={loadStats} 
                disabled={loading}
                variant={realTimeMode ? 'outline' : 'primary'}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Cargando...' : 'Actualizar'}
              </Button>
              <Button 
                onClick={() => setRealTimeMode(!realTimeMode)}
                variant={realTimeMode ? 'primary' : 'outline'}
              >
                <Activity className="h-4 w-4 mr-2" />
                {realTimeMode ? 'Tiempo Real ON' : 'Tiempo Real OFF'}
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando estadísticas...</p>
          </div>
        ) : usageStats ? (
          <>
            {/* Usage Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                    <p className="text-2xl font-semibold text-gray-900">{usageStats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="bg-green-500 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Apuntes</p>
                    <p className="text-2xl font-semibold text-gray-900">{usageStats.totalNotes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="bg-purple-500 p-3 rounded-lg">
                    <Download className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Descargas</p>
                    <p className="text-2xl font-semibold text-gray-900">{usageStats.totalDownloads}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="bg-yellow-500 p-3 rounded-lg">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
                    <p className="text-2xl font-semibold text-gray-900">{usageStats.averageRating}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Content Stats */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Contenido</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Apuntes Públicos</span>
                    <span className="font-semibold">{usageStats.publicNotes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Apuntes Privados</span>
                    <span className="font-semibold">{usageStats.privateNotes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Sesiones de Estudio</span>
                    <span className="font-semibold">{usageStats.totalSessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Esquemas</span>
                    <span className="font-semibold">{usageStats.totalSchemes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Reseñas</span>
                    <span className="font-semibold">{usageStats.totalReviews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Favoritos</span>
                    <span className="font-semibold">{usageStats.totalFavorites}</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente (7 días)</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nuevos Usuarios</span>
                    <span className="font-semibold">{usageStats.recentActivity.newUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nuevos Apuntes</span>
                    <span className="font-semibold">{usageStats.recentActivity.newNotes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nuevas Sesiones</span>
                    <span className="font-semibold">{usageStats.recentActivity.newSessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nuevas Reseñas</span>
                    <span className="font-semibold">{usageStats.recentActivity.newReviews}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Subjects and Universities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Materias Más Populares</h3>
                <div className="space-y-3">
                  {usageStats.topSubjects.map((subject, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600 truncate">{subject.subject}</span>
                      <span className="font-semibold">{subject.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Universidades Más Activas</h3>
                <div className="space-y-3">
                  {usageStats.topUniversities.map((university, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600 truncate">{university.university}</span>
                      <span className="font-semibold">{university.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Collection Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas por Colección</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Colección
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documentos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tamaño
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Crecimiento/día
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Última Actualización
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {collectionStats.map((stat, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {stat.collection}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stat.totalDocuments.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {FirebaseMonitor.formatBytes(stat.sizeInBytes)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stat.growthRate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stat.lastUpdated.toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Alerts */}
            {FirebaseMonitor.getUsageAlerts(usageStats).length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas y Recomendaciones</h3>
                <div className="space-y-3">
                  {FirebaseMonitor.getUsageAlerts(usageStats).map((alert, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
                    >
                      <div className="flex items-start">
                        {getAlertIcon(alert.type)}
                        <p className="ml-2">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar estadísticas</h3>
            <p className="text-gray-600">No se pudieron cargar las estadísticas de Firebase.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
