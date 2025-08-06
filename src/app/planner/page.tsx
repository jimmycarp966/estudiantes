'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Calendar, Plus, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PlannerPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Planificador de Estudio</h1>
                <p className="text-gray-600">Organiza tus sesiones de estudio y nunca olvides un examen</p>
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Evento
            </Button>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="max-w-md mx-auto">
            <Calendar className="h-16 w-16 text-purple-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Planificador Inteligente</h2>
            <p className="text-gray-600 mb-6">
              Estamos desarrollando un sistema completo de planificación que incluirá:
            </p>
            
            <div className="space-y-3 text-left">
              <div className="flex items-center text-gray-700">
                <Calendar className="h-5 w-5 text-purple-500 mr-3" />
                <span>Calendario interactivo con vista mensual/semanal</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Clock className="h-5 w-5 text-purple-500 mr-3" />
                <span>Planificación automática de sesiones de estudio</span>
              </div>
              <div className="flex items-center text-gray-700">
                <AlertCircle className="h-5 w-5 text-purple-500 mr-3" />
                <span>Recordatorios inteligentes para exámenes</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-purple-50 rounded-lg">
              <p className="text-purple-700 font-medium">🚀 Disponible en la próxima actualización</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}