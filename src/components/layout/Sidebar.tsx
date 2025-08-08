'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { 
  BookOpen, 
  Home, 
  Upload, 
  Library, 
  Clock, 
  Settings, 
  LogOut,
  Menu,
  X,
  User,
  Calendar,
  Target,
  Shield,
  Flag,
  TrendingUp,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const getNavigation = (isAdmin: boolean, isModerator: boolean) => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Mi Biblioteca', href: '/my-library', icon: BookOpen },
    { name: 'Biblioteca Colaborativa', href: '/shared-library', icon: Library },
    { name: 'Subir Apuntes', href: '/upload', icon: Upload },
    { name: 'Herramientas de Estudio', href: '/study-tools', icon: Clock },
    { name: 'Esquemas', href: '/study-tools/schemes', icon: Target },
    { name: 'Calendario', href: '/calendar', icon: Calendar },
    { name: 'Materias', href: '/subjects', icon: BookOpen },
    { name: 'Planificador', href: '/planner', icon: Calendar },
    { name: 'Progreso', href: '/progress', icon: Target },
  ];

  const adminNavigation = [
    { name: 'Panel de Admin', href: '/admin', icon: Shield },
    { name: 'Reportes', href: '/admin/reports', icon: Flag },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
  ];

  const moderatorNavigation = [
    { name: 'Moderación', href: '/moderation', icon: Flag },
  ];

  const settingsNav = [
    { name: 'Configuración', href: '/settings', icon: Settings },
  ];

  return [
    ...baseNavigation,
    ...(isAdmin ? adminNavigation : isModerator ? moderatorNavigation : []),
    ...settingsNav
  ];
};

export const Sidebar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isAdmin, isModerator } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <BookOpen className="h-8 w-8 text-blue-600 mr-2" />
        <span className="text-xl font-bold text-gray-900">E-Estudiantes</span>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {user?.photoURL ? (
              <Image
                className="h-8 w-8 rounded-full"
                src={user.photoURL}
                alt={user.displayName || 'Usuario'}
                width={32}
                height={32}
              />
            ) : (
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900">
                {user?.displayName || 'Usuario'}
              </p>
              {isAdmin && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </span>
              )}
              {isModerator && !isAdmin && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Flag className="h-3 w-3 mr-1" />
                  Mod
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {getNavigation(isAdmin, isModerator).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link
          href="/settings"
          className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <Settings className="mr-3 h-5 w-5" />
          Configuración
        </Link>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="relative flex flex-col w-64 bg-white">
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};