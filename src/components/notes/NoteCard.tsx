'use client';

import { useState } from 'react';
import { Note } from '@/types';
import { Button } from '@/components/ui/Button';
import { 
  Download, 
  Star, 
  Calendar, 
  User, 
  FileText, 
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { StorageService } from '@/lib/storage';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface NoteCardProps {
  note: Note;
  showActions?: boolean;
  onEdit?: (note: Note) => void;
  onDelete?: (noteId: string) => void;
  onDownload?: (note: Note) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  showActions = false,
  onEdit,
  onDelete,
  onDownload
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    
    setDownloading(true);
    try {
      // Crear un elemento de enlace temporal para la descarga
      const link = document.createElement('a');
      link.href = note.fileUrl;
      link.download = note.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Llamar callback si existe
      if (onDownload) {
        onDownload(note);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setDownloading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'ppt':
      case 'pptx':
        return '📊';
      case 'txt':
        return '📄';
      default:
        return '📁';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <div className="text-2xl">{getFileIcon(note.fileType)}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{note.title}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{note.description}</p>
          </div>
        </div>
        
        {showActions && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      // Ver/previsualizar
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </button>
                  {onEdit && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(note);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(note.id);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <FileText className="h-4 w-4 mr-2" />
          <span className="font-medium">{note.subject}</span>
          {note.career && (
            <>
              <span className="mx-2">•</span>
              <span>{note.career}</span>
            </>
          )}
        </div>
        
        {note.university && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2" />
            <span>{note.university}</span>
            {note.year && (
              <>
                <span className="mx-2">•</span>
                <span>{note.year}</span>
              </>
            )}
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          <span>
            {format(note.uploadedAt, "d 'de' MMMM, yyyy", { locale: es })}
          </span>
        </div>
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex items-center mb-4">
          <Tag className="h-4 w-4 text-gray-400 mr-2" />
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{note.tags.length - 3} más</span>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <Download className="h-4 w-4 mr-1" />
            {note.downloads}
          </span>
          {note.rating > 0 && (
            <span className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              {note.rating.toFixed(1)} ({note.ratingCount})
            </span>
          )}
        </div>
        <span className="text-xs">
          {StorageService.formatFileSize(note.fileSize)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          {downloading ? 'Descargando...' : 'Descargar'}
        </Button>
        
        {note.category === 'shared' && (
          <Button
            variant="outline"
            size="sm"
            className="px-3"
          >
            <Star className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};