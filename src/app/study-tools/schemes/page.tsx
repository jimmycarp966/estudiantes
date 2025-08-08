'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  Plus, 
  FolderOpen, 
  Palette, 
  Download, 
  BookOpen
} from 'lucide-react';
import { TemplateSelector } from '@/components/schemes/TemplateSelector';
import { SchemeManager } from '@/components/schemes/SchemeManager';
import { SchemeEditor } from '@/components/schemes/SchemeEditor';
// import { useAuth } from '@/contexts/AuthContext';
import type { UserScheme, SchemeTemplate } from '@/types/schemes';

type ViewMode = 'welcome' | 'editor' | 'templates' | 'manager';

export default function SchemesPage() {
  // const { user } = useAuth(); // No se usa por ahora
  const [viewMode, setViewMode] = useState<ViewMode>('welcome');
  const [currentScheme, setCurrentScheme] = useState<UserScheme | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<SchemeTemplate | null>(null);

  const handleNewScheme = () => {
    setCurrentScheme(null);
    setSelectedTemplate(null);
    setViewMode('templates');
  };

  const handleOpenScheme = () => {
    setViewMode('manager');
  };

  const handleTemplateSelect = (template: SchemeTemplate) => {
    setSelectedTemplate(template);
    setViewMode('editor');
  };

  const handleSchemeSelect = (scheme: UserScheme) => {
    setCurrentScheme(scheme);
    setViewMode('editor');
  };

  const handleSaveScheme = (scheme: UserScheme) => {
    setCurrentScheme(scheme);
    // El esquema ya se guardó en el editor
  };

  const handleCloseEditor = () => {
    setViewMode('welcome');
    setCurrentScheme(null);
    setSelectedTemplate(null);
  };

  const handleCloseModal = () => {
    setViewMode('welcome');
  };

  // Vista de bienvenida
  if (viewMode === 'welcome') {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Editor de Esquemas
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Crea diagramas visuales, mapas mentales y esquemas para organizar tus ideas de estudio
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Crear nuevo esquema */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Crear Nuevo Esquema</h3>
                  <p className="text-sm text-gray-600">Empieza desde cero o usa una plantilla</p>
                </div>
              </div>
              <Button onClick={handleNewScheme} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Crear Esquema
              </Button>
            </div>

            {/* Abrir esquemas existentes */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <FolderOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Mis Esquemas</h3>
                  <p className="text-sm text-gray-600">Abre y edita esquemas guardados</p>
                </div>
              </div>
              <Button onClick={handleOpenScheme} variant="outline" className="w-full">
                <FolderOpen className="w-4 h-4 mr-2" />
                Abrir Esquemas
              </Button>
            </div>
          </div>

          {/* Características */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Características</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                  <Palette className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Editor Visual</h4>
                  <p className="text-sm text-gray-600">Interfaz intuitiva para crear diagramas</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                  <BookOpen className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Plantillas</h4>
                  <p className="text-sm text-gray-600">Templates predefinidos para empezar rápido</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                  <Download className="w-4 h-4 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Exportar</h4>
                  <p className="text-sm text-gray-600">Guarda tus esquemas como imágenes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tipos de esquemas */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tipos de Esquemas</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-3xl mb-2">🧠</div>
                <h4 className="font-medium text-gray-900">Mapas Mentales</h4>
                <p className="text-sm text-gray-600">Organiza ideas principales y secundarias</p>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-3xl mb-2">🔄</div>
                <h4 className="font-medium text-gray-900">Diagramas de Flujo</h4>
                <p className="text-sm text-gray-600">Procesos y decisiones secuenciales</p>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-3xl mb-2">⚖️</div>
                <h4 className="font-medium text-gray-900">Comparaciones</h4>
                <p className="text-sm text-gray-600">Compara conceptos y elementos</p>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-3xl mb-2">⏰</div>
                <h4 className="font-medium text-gray-900">Líneas de Tiempo</h4>
                <p className="text-sm text-gray-600">Eventos cronológicos</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Vista del editor
  if (viewMode === 'editor') {
    return (
      <div className="h-screen flex flex-col">
        <SchemeEditor
          initialScheme={currentScheme || undefined}
          template={selectedTemplate || undefined}
          onSave={handleSaveScheme}
          onClose={handleCloseEditor}
        />
      </div>
    );
  }

  // Vista del selector de templates
  if (viewMode === 'templates') {
    return (
      <TemplateSelector
        onTemplateSelect={handleTemplateSelect}
        onClose={handleCloseModal}
      />
    );
  }

  // Vista del gestor de esquemas
  if (viewMode === 'manager') {
    return (
      <SchemeManager
        onSchemeSelect={handleSchemeSelect}
        onNewScheme={handleNewScheme}
        onClose={handleCloseModal}
      />
    );
  }

  return null;
}



