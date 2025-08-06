'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { User } from '@/types';
import { 
  Users, 
  Shield, 
  Flag, 
  Ban, 
  Search,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const { isAdmin, promoteToModerator, banUser } = useAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'user' | 'moderator' | 'admin'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    loadUsers();
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      const { getFirestore, collection, getDocs, orderBy, query } = await import('firebase/firestore');
      const { initializeApp, getApps } = await import('firebase/app');
      
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };
      
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const db = getFirestore(app);

      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(q);
      
      const usersData = usersSnapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastLoginAt: doc.data().lastLoginAt?.toDate() || new Date(),
      })) as User[];

      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToModerator = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres promover este usuario a moderador?')) return;
    
    setActionLoading(userId);
    try {
      await promoteToModerator(userId);
      await loadUsers(); // Recargar lista
      alert('Usuario promovido a moderador exitosamente');
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Error al promover usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanUser = async (userId: string) => {
    const reason = prompt('Motivo del baneo:');
    if (!reason) return;
    
    if (!confirm('¿Estás seguro de que quieres banear este usuario?')) return;
    
    setActionLoading(userId);
    try {
      await banUser(userId, reason);
      await loadUsers(); // Recargar lista
      alert('Usuario baneado exitosamente');
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Error al banear usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Acceso Denegado</h3>
          <p className="text-gray-500">No tienes permisos para ver esta página.</p>
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
            <Users className="h-8 w-8 text-blue-600" />
            Gestión de Usuarios
          </h1>
          <p className="mt-2 text-gray-600">
            Administra roles, permisos y estado de los usuarios
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar usuarios
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por email o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por rol
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'all' | 'user' | 'moderator' | 'admin')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los roles</option>
                <option value="user">Usuario</option>
                <option value="moderator">Moderador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Usuarios ({filteredUsers.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Cargando usuarios...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estadísticas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((userData) => (
                    <tr key={userData.uid}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {userData.photoURL ? (
                              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-300">
                                <div 
                                  className="h-full w-full bg-cover bg-center"
                                  style={{ backgroundImage: `url(${userData.photoURL})` }}
                                  title={userData.displayName || 'Usuario'}
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {userData.displayName || 'Sin nombre'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {userData.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          userData.role === 'admin' ? 'bg-red-100 text-red-800' :
                          userData.role === 'moderator' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {userData.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                          {userData.role === 'moderator' && <Flag className="h-3 w-3 mr-1" />}
                          {userData.role === 'user' && <UserCheck className="h-3 w-3 mr-1" />}
                          {userData.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div>Subidas: {userData.stats?.totalUploads || 0}</div>
                          <div>Descargas: {userData.stats?.totalDownloads || 0}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userData.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {userData.role === 'user' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePromoteToModerator(userData.uid)}
                              disabled={actionLoading === userData.uid}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Promover
                            </Button>
                          )}
                          
                          {userData.uid !== user?.uid && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleBanUser(userData.uid)}
                              disabled={actionLoading === userData.uid}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Banear
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}