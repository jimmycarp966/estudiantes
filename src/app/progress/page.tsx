'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TrendingUp, Target, Award, BarChart3 } from 'lucide-react';

export default function ProgressPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Seguimiento de Progreso</h1>
              <p className="text-gray-600">Visualiza tu evolución académica y logros</p>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="max-w-md mx-auto">
            <BarChart3 className="h-16 w-16 text-green-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics de Estudio</h2>
            <p className="text-gray-600 mb-6">
              Próximamente podrás visualizar métricas detalladas de tu progreso:
            </p>
            
            <div className="space-y-3 text-left">
              <div className="flex items-center text-gray-700">
                <TrendingUp className="h-5 w-5 text-green-500 mr-3" />
                <span>Gráficos de tiempo de estudio por materia</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Target className="h-5 w-5 text-green-500 mr-3" />
                <span>Seguimiento de metas y objetivos</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Award className="h-5 w-5 text-green-500 mr-3" />
                <span>Sistema de logros y gamificación</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <p className="text-green-700 font-medium">📊 En desarrollo activo</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}