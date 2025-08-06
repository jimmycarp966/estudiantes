'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileUpload } from '@/components/notes/FileUpload';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CheckCircle, BookOpen } from 'lucide-react';

export default function UploadPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    university: '',
    career: '',
    year: new Date().getFullYear(),
    tags: '',
    isPublic: false
  });
  const [fileData, setFileData] = useState<{
    url: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileData || !user) return;

    setLoading(true);

    try {
      const noteData = {
        title: formData.title,
        description: formData.description,
        fileName: fileData.fileName,
        fileType: fileData.fileType,
        fileSize: fileData.fileSize,
        fileUrl: fileData.url,
        uploadedBy: user.uid,
        uploadedAt: serverTimestamp(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        subject: formData.subject,
        university: formData.university,
        career: formData.career,
        year: formData.year,
        downloads: 0,
        rating: 0,
        ratingCount: 0,
        isPublic: formData.isPublic,
        category: formData.isPublic ? 'shared' : 'personal'
      };

      await addDoc(collection(db, 'notes'), noteData);
      
      setSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: '',
        university: '',
        career: '',
        year: new Date().getFullYear(),
        tags: '',
        isPublic: false
      });
      setFileData(null);

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error al guardar el apunte. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Subir Apuntes</h1>
              <p className="text-gray-600">Comparte tus apuntes con la comunidad o guárdalos para tu uso personal</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-700">¡Apunte subido exitosamente!</p>
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivo
              </label>
              <FileUpload
                onFileUploaded={setFileData}
                category={formData.isPublic ? 'shared' : 'personal'}
                userId={user.uid}
              />
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <Input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ej: Cálculo I - Derivadas"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descripción breve del contenido..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Materia *
              </label>
              <Input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Ej: Cálculo I, Física II, Química Orgánica"
                required
              />
            </div>

            {/* University and Career */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
                  Universidad
                </label>
                <Input
                  id="university"
                  name="university"
                  type="text"
                  value={formData.university}
                  onChange={handleInputChange}
                  placeholder="Ej: Universidad de Buenos Aires"
                />
              </div>
              <div>
                <label htmlFor="career" className="block text-sm font-medium text-gray-700 mb-1">
                  Carrera
                </label>
                <Input
                  id="career"
                  name="career"
                  type="text"
                  value={formData.career}
                  onChange={handleInputChange}
                  placeholder="Ej: Ingeniería en Sistemas"
                />
              </div>
            </div>

            {/* Year */}
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Año
              </label>
              <Input
                id="year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
                min="2020"
                max={new Date().getFullYear() + 1}
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Etiquetas
              </label>
              <Input
                id="tags"
                name="tags"
                type="text"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Ej: derivadas, límites, funciones (separadas por comas)"
              />
              <p className="text-xs text-gray-500 mt-1">Separa las etiquetas con comas</p>
            </div>

            {/* Public/Private Toggle */}
            <div className="flex items-start space-x-3">
              <input
                id="isPublic"
                name="isPublic"
                type="checkbox"
                checked={formData.isPublic}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                  Hacer público
                </label>
                <p className="text-xs text-gray-500">
                  Si está marcado, otros estudiantes podrán ver y descargar este apunte
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !fileData || !formData.title || !formData.subject}
              >
                {loading ? 'Guardando...' : 'Guardar Apunte'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}