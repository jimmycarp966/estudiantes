'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Download,
  Trash2,
  Save
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    university: '',
    career: '',
    year: new Date().getFullYear()
  });

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'privacy', name: 'Privacidad', icon: Shield },
    { id: 'data', name: 'Datos', icon: Download },
  ];

  const handleSaveProfile = async () => {
    setLoading(true);
    // Aquí iría la lógica para actualizar el perfil
    setTimeout(() => {
      setLoading(false);
      alert('Perfil actualizado exitosamente');
    }, 1000);
  };

  const TabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo
                  </label>
                  <Input
                    id="displayName"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Tu nombre completo"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    value={profileData.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                
                <div>
                  <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
                    Universidad
                  </label>
                  <Input
                    id="university"
                    value={profileData.university}
                    onChange={(e) => setProfileData(prev => ({ ...prev, university: e.target.value }))}
                    placeholder="Tu universidad"
                  />
                </div>
                
                <div>
                  <label htmlFor="career" className="block text-sm font-medium text-gray-700 mb-1">
                    Carrera
                  </label>
                  <Input
                    id="career"
                    value={profileData.career}
                    onChange={(e) => setProfileData(prev => ({ ...prev, career: e.target.value }))}
                    placeholder="Tu carrera"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <Button onClick={handleSaveProfile} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </div>
          </div>
        );
        
      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preferencias de Notificación</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Recordatorios de estudio</p>
                    <p className="text-sm text-gray-500">Recibe notificaciones para tus sesiones planificadas</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Nuevos apuntes compartidos</p>
                    <p className="text-sm text-gray-500">Notificaciones cuando se publiquen apuntes de tus materias</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Resumen semanal</p>
                    <p className="text-sm text-gray-500">Recibe un resumen de tu actividad cada semana</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Privacidad</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Perfil público</p>
                    <p className="text-sm text-gray-500">Permitir que otros estudiantes vean tu perfil</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Mostrar estadísticas</p>
                    <p className="text-sm text-gray-500">Compartir tus estadísticas de estudio con la comunidad</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Gestión de Datos</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Exportar mis datos</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Descarga una copia de todos tus datos almacenados en E-Estudiantes.
                  </p>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Solicitar Exportación
                  </Button>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Eliminar cuenta</h4>
                  <p className="text-sm text-red-800 mb-3">
                    Esta acción eliminará permanentemente tu cuenta y todos los datos asociados.
                  </p>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Cuenta
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-gray-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
              <p className="text-gray-600">Personaliza tu experiencia en E-Estudiantes</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <TabContent />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}