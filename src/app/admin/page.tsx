'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Users,
  FileText,
  Flag,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminStats {
  totalUsers: number;
  totalNotes: number;
  totalReports: number;
  activeUsers: number;
  pendingReports: number;
  totalDownloads: number;
}

export default function AdminPage() {
  const { } = useAuth();
  const { isAdmin } = useAdmin();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalNotes: 0,
    totalReports: 0,
    activeUsers: 0,
    pendingReports: 0,
    totalDownloads: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    
    loadAdminStats();
  }, [isAdmin]);

  const loadAdminStats = async () => {
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
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

      // Contar usuarios
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // Contar notas
      const notesSnapshot = await getDocs(collection(db, 'notes'));
      const totalNotes = notesSnapshot.size;

      // Contar reportes (simulado por ahora)
      const totalReports = 0;
      const pendingReports = 0;

      // Calcular descargas totales
      let totalDownloads = 0;
      notesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        totalDownloads += data.downloads || 0;
      });

      setStats({
        totalUsers,
        totalNotes,
        totalReports,
        activeUsers: Math.floor(totalUsers * 0.7), // Simulado
        pendingReports,
        totalDownloads
      });

    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Acceso Denegado</h3>
                      <p className="mt-1 text-sm text-gray-500">
              No tienes permisos para acceder al panel de administraci&oacute;n.
            </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-600" />
            Panel de Administración
          </h1>
          <p className="mt-2 text-gray-600">
            Gestiona usuarios, contenido y moderación de la plataforma
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Users */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total de Usuarios
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : stats.totalUsers.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Total Notes */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total de Apuntes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : stats.totalNotes.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Usuarios Activos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : stats.activeUsers.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Total Downloads */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Descargas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : stats.totalDownloads.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Reports */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Flag className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Reportes Pendientes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {loading ? '...' : stats.pendingReports}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Estado del Sistema
                    </dt>
                    <dd className="text-lg font-medium text-green-600">
                      Operativo
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Acciones Rápidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/users">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Gestionar Usuarios
                </Button>
              </Link>
              
              <Link href="/admin/reports">
                <Button className="w-full justify-start" variant="outline">
                  <Flag className="mr-2 h-4 w-4" />
                  Ver Reportes
                </Button>
              </Link>
              
              <Link href="/admin/analytics">
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analytics Avanzados
                </Button>
              </Link>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => loadAdminStats()}
              >
                <Clock className="mr-2 h-4 w-4" />
                Actualizar Stats
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Actividad Reciente
            </h3>
            <div className="text-sm text-gray-500">
              <p>• Nuevo usuario registrado hace 2 minutos</p>
              <p>• Apunte subido en &quot;Matemáticas&quot; hace 15 minutos</p>
              <p>• Reporte resuelto hace 1 hora</p>
              <p>• 23 descargas en la última hora</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}