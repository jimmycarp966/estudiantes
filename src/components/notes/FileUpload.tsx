'use client';

import { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import { StorageService, UploadProgress } from '@/lib/storage';

interface FileUploadProps {
  onFileUploaded: (fileData: {
    url: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }) => void;
  allowedTypes?: string[];
  maxSize?: number; // en MB
  category: 'personal' | 'shared';
  userId: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  allowedTypes = ['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx'],
  maxSize = 10, // 10MB por defecto
  category,
  userId
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some((e) => e.code === 'file-too-large')) {
        setError(`El archivo es demasiado grande. Tamaño máximo: ${maxSize}MB`);
      } else if (rejection.errors.some((e) => e.code === 'file-invalid-type')) {
        setError(`Tipo de archivo no válido. Tipos permitidos: ${allowedTypes.join(', ')}`);
      } else {
        setError('Error al seleccionar el archivo');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
    }
  }, [allowedTypes, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => {
      const mimeTypes: { [key: string]: string[] } = {
        'pdf': ['application/pdf'],
        'doc': ['application/msword'],
        'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        'txt': ['text/plain'],
        'ppt': ['application/vnd.ms-powerpoint'],
        'pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
      };
      if (mimeTypes[type]) {
        acc = { ...acc, ...mimeTypes[type].reduce((typeAcc, mimeType) => ({ ...typeAcc, [mimeType]: [] }), {}) };
      }
      return acc;
    }, {}),
    maxSize: maxSize * 1024 * 1024, // Convertir MB a bytes
    multiple: false
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setUploadProgress(null);

    try {
      const filePath = StorageService.generateFilePath(userId, category, selectedFile.name);
      
      const downloadURL = await StorageService.uploadFile(
        selectedFile,
        filePath,
        (progress) => setUploadProgress(progress)
      );

      onFileUploaded({
        url: downloadURL,
        fileName: selectedFile.name,
        fileType: StorageService.getFileExtension(selectedFile.name),
        fileSize: selectedFile.size
      });

      setSelectedFile(null);
      setUploadProgress(null);
    } catch (error: unknown) {
      console.error('Error uploading file:', error);
      setError('Error al subir el archivo. Intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
    setUploadProgress(null);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {!selectedFile && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-blue-600">Suelta el archivo aquí...</p>
          ) : (
            <div>
              <p className="text-gray-600">
                Arrastra un archivo aquí o{' '}
                <span className="text-blue-600 font-medium">haz clic para seleccionar</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Tipos permitidos: {allowedTypes.join(', ')} • Tamaño máximo: {maxSize}MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Selected File */}
      {selectedFile && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {StorageService.formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            {!uploading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Subiendo...</span>
                <span>{Math.round(uploadProgress.percentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          {!uploading && !uploadProgress && (
            <div className="mt-4">
              <Button onClick={handleUpload} className="w-full">
                Subir Archivo
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};