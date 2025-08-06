'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAdmin } from '@/hooks/useAdmin';
import { useState } from 'react';
import { 
  Flag, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  X,
  Eye,
  FileText,
  User,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Report {
  id: string;
  itemId: string;
  itemType: 'note' | 'review' | 'user';
  reportedBy: string;
  reason: string;
  description?: string;
  createdAt: Date;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  resolvedBy?: string;
  resolvedAt?: Date;
}

export default function AdminReportsPage() {
  const { isAdmin, isModerator } = useAdmin();
  const [reports] = useState<Report[]>([
    {
      id: '1',
      itemId: 'note_123',
      itemType: 'note',
      reportedBy: 'user_456',
      reason: 'inappropriate',
      description: 'Contenido ofensivo en el archivo',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      status: 'pending'
    },
    {
      id: '2',
      itemId: 'review_789',
      itemType: 'review',
      reportedBy: 'user_101',
      reason: 'spam',
      description: 'Comentario repetitivo y sin sentido',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 horas atrás
      status: 'pending'
    },
    {
      id: '3',
      itemId: 'user_202',
      itemType: 'user',
      reportedBy: 'user_303',
      reason: 'fake',
      description: 'Perfil falso con información incorrecta',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 día atrás
      status: 'resolved',
      resolvedBy: 'admin_001',
      resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ]);

  // const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      inappropriate: 'Contenido Inapropiado',
      spam: 'Spam',
      copyright: 'Violación de Derechos de Autor',
      fake: 'Contenido Falso',
      other: 'Otro'
    };
    return labels[reason] || reason;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'note': return <FileText className="h-4 w-4" />;
      case 'review': return <MessageCircle className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const filteredReports = reports.filter(report => 
    selectedStatus === 'all' || report.status === selectedStatus
  );

  if (!isAdmin && !isModerator) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Acceso Denegado</h3>
          <p className="mt-1 text-sm text-gray-500">
            No tienes permisos para ver los reportes.
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
            <Flag className="h-8 w-8 text-orange-600" />
            Gestión de Reportes
          </h1>
          <p className="mt-2 text-gray-600">
            Revisa y gestiona reportes de contenido y usuarios
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
              <Flag className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reports.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resueltos</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Descartados</p>
                <p className="text-2xl font-bold text-gray-600">
                  {reports.filter(r => r.status === 'dismissed').length}
                </p>
              </div>
              <X className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'pending' | 'resolved' | 'dismissed')}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="resolved">Resueltos</option>
              <option value="dismissed">Descartados</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Reportes ({filteredReports.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getItemTypeIcon(report.itemType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {report.itemType === 'note' && 'Apunte reportado'}
                          {report.itemType === 'review' && 'Reseña reportada'}
                          {report.itemType === 'user' && 'Usuario reportado'}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Motivo:</strong> {getReasonLabel(report.reason)}
                      </p>
                      
                      {report.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Descripción:</strong> {report.description}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        Reportado hace {Math.floor((Date.now() - report.createdAt.getTime()) / (1000 * 60 * 60))} horas
                      </p>
                      
                      {report.status === 'resolved' && report.resolvedAt && (
                        <p className="text-xs text-green-600">
                          Resuelto hace {Math.floor((Date.now() - report.resolvedAt.getTime()) / (1000 * 60 * 60))} horas
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => console.log('Ver reporte:', report.id)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    
                    {report.status === 'pending' && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolver
                        </Button>
                        <Button size="sm" variant="outline">
                          <X className="h-4 w-4 mr-1" />
                          Descartar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              <CheckCircle className="mr-2 h-4 w-4" />
              Resolver todos los pendientes
            </Button>
            <Button variant="outline" className="justify-start">
              <Flag className="mr-2 h-4 w-4" />
              Exportar reportes
            </Button>
            <Button variant="outline" className="justify-start">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Configurar auto-moderación
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}