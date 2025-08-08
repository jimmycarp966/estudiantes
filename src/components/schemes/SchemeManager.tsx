'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Edit, Trash2, Download, Plus, FolderOpen } from 'lucide-react';
import { schemeService } from '@/lib/schemeService';
import { useAuth } from '@/contexts/AuthContext';
import type { UserScheme } from '@/types/schemes';

interface SchemeManagerProps {
  onSchemeSelect: (scheme: UserScheme) => void;
  onNewScheme: () => void;
  onClose: () => void;
}

export function SchemeManager({ onSchemeSelect, onNewScheme, onClose }: SchemeManagerProps) {
  const { user } = useAuth();
  const [schemes, setSchemes] = useState<UserScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadUserSchemes = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const userSchemes = await schemeService.getUserSchemes(user.uid);
      setSchemes(userSchemes);
    } catch (error) {
      console.error('Error loading schemes:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadUserSchemes();
    }
  }, [user?.uid, loadUserSchemes]);

  const handleDeleteScheme = async (schemeId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este esquema? Esta acción no se puede deshacer.')) {
      try {
        await schemeService.deleteScheme(schemeId);
        setSchemes(schemes.filter(s => s.id !== schemeId));
      } catch (error) {
        console.error('Error deleting scheme:', error);
        alert('Error al eliminar el esquema');
      }
    }
  };

  const handleExportScheme = async (scheme: UserScheme) => {
    try {
      // Crear un canvas para exportar el esquema como imagen
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Configurar el canvas (esto es un ejemplo básico)
      canvas.width = 800;
      canvas.height = 600;
      
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar el esquema (implementación básica)
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.fillText(scheme.name, 50, 50);
        
        // Convertir a imagen y descargar
        const link = document.createElement('a');
        link.download = `${scheme.name}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch (error) {
      console.error('Error exporting scheme:', error);
      alert('Error al exportar el esquema');
    }
  };

  const filteredSchemes = schemes.filter(scheme =>
    scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scheme.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Cargando esquemas...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Mis Esquemas</h2>
          <div className="flex gap-2">
            <Button onClick={onNewScheme}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Esquema
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar esquemas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Schemes List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredSchemes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron esquemas' : 'No tienes esquemas guardados'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Crea tu primer esquema para empezar a organizar tus ideas'
                }
              </p>
              {!searchTerm && (
                <Button onClick={onNewScheme}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Esquema
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredSchemes.map((scheme) => (
                <div
                  key={scheme.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{scheme.name}</h3>
                      {scheme.description && (
                        <p className="text-sm text-gray-600 mb-2">{scheme.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{scheme.nodes.length} nodos</span>
                        <span>{scheme.edges.length} conexiones</span>
                        <span>
                          Actualizado: {scheme.updatedAt.toLocaleDateString()}
                        </span>
                        {scheme.tags && scheme.tags.length > 0 && (
                          <div className="flex gap-1">
                            {scheme.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {scheme.tags.length > 3 && (
                              <span className="text-gray-400">+{scheme.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSchemeSelect(scheme)}
                        title="Abrir esquema"
                      >
                        <FolderOpen className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportScheme(scheme)}
                        title="Exportar como imagen"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Aquí podrías implementar la edición de metadatos
                          console.log('Edit scheme metadata:', scheme);
                        }}
                        title="Editar información"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteScheme(scheme.id)}
                        title="Eliminar esquema"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {filteredSchemes.length} esquema{filteredSchemes.length !== 1 ? 's' : ''} encontrado{filteredSchemes.length !== 1 ? 's' : ''}
            </p>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
