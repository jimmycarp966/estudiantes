'use client';

import { useState } from 'react';
import { SearchFilters } from '@/types';
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  Star,
  FileText,
  User,
  BookOpen,
  Sliders
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AdvancedFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  subjects: string[];
  universities: string[];
  onClearFilters: () => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  subjects,
  universities,
  onClearFilters
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: unknown) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => {
    if (value === null || value === undefined || value === '') return false;
    if (typeof value === 'object' && 'start' in value) {
      return value.start || value.end;
    }
    return true;
  });

  const getFileTypeOptions = () => [
    { value: 'pdf', label: 'PDF' },
    { value: 'doc', label: 'Word (DOC)' },
    { value: 'docx', label: 'Word (DOCX)' },
    { value: 'ppt', label: 'PowerPoint (PPT)' },
    { value: 'pptx', label: 'PowerPoint (PPTX)' },
    { value: 'txt', label: 'Texto (TXT)' },
    { value: 'jpg', label: 'Imagen (JPG)' },
    { value: 'png', label: 'Imagen (PNG)' }
  ];

  const getCurrentYear = () => new Date().getFullYear();
  const getYearOptions = () => {
    const currentYear = getCurrentYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 10; i--) {
      years.push(i);
    }
    return years;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Basic Search */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Search className="h-5 w-5" />
            Búsqueda y Filtros
          </h3>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Sliders className="h-4 w-4 mr-1" />
              {showAdvanced ? 'Básico' : 'Avanzado'}
            </Button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar en título, descripción, tags..."
            value={filters.subject || ''}
            onChange={(e) => updateFilter('subject', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Basic Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <BookOpen className="h-4 w-4 inline mr-1" />
              Materia
            </label>
            <select
              value={filters.subject || ''}
              onChange={(e) => updateFilter('subject', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las materias</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          {/* University Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="h-4 w-4 inline mr-1" />
              Universidad
            </label>
            <select
              value={filters.university || ''}
              onChange={(e) => updateFilter('university', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las universidades</option>
              {universities.map(university => (
                <option key={university} value={university}>{university}</option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Star className="h-4 w-4 inline mr-1" />
              Rating mínimo
            </label>
            <select
              value={filters.rating || ''}
              onChange={(e) => updateFilter('rating', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Cualquier rating</option>
              <option value="4">4+ estrellas</option>
              <option value="3">3+ estrellas</option>
              <option value="2">2+ estrellas</option>
              <option value="1">1+ estrellas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros Avanzados
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Career Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carrera
              </label>
              <Input
                placeholder="Ej: Ingeniería"
                value={filters.career || ''}
                onChange={(e) => updateFilter('career', e.target.value)}
              />
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Año
              </label>
              <select
                value={filters.year || ''}
                onChange={(e) => updateFilter('year', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Cualquier año</option>
                {getYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* File Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="h-4 w-4 inline mr-1" />
                Tipo de archivo
              </label>
              <select
                value={filters.fileType || ''}
                onChange={(e) => updateFilter('fileType', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                {getFileTypeOptions().map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Uploader Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subido por
              </label>
              <Input
                placeholder="Nombre del usuario"
                value={filters.uploadedBy || ''}
                onChange={(e) => updateFilter('uploadedBy', e.target.value)}
              />
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Rango de fechas
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Desde</label>
                <Input
                  type="date"
                  value={filters.dateRange?.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
                  onChange={(e) => updateFilter('dateRange', {
                    ...filters.dateRange,
                    start: e.target.value ? new Date(e.target.value) : undefined
                  })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                <Input
                  type="date"
                  value={filters.dateRange?.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
                  onChange={(e) => updateFilter('dateRange', {
                    ...filters.dateRange,
                    end: e.target.value ? new Date(e.target.value) : undefined
                  })}
                />
              </div>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtros rápidos
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilter('dateRange', {
                  start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  end: new Date()
                })}
              >
                Última semana
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilter('dateRange', {
                  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  end: new Date()
                })}
              >
                Último mes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilter('rating', 4)}
              >
                Solo 4+ estrellas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilter('fileType', 'pdf')}
              >
                Solo PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filtros activos:</span>
            {filters.subject && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Materia: {filters.subject}
                <button
                  onClick={() => updateFilter('subject', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.university && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Universidad: {filters.university}
                <button
                  onClick={() => updateFilter('university', '')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.rating && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Rating: {filters.rating}+ estrellas
                <button
                  onClick={() => updateFilter('rating', undefined)}
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.fileType && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Tipo: {filters.fileType.toUpperCase()}
                <button
                  onClick={() => updateFilter('fileType', '')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};