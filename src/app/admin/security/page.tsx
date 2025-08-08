'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { SecurityChecker, SecurityTestResult } from '@/lib/securityChecker';
import { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export default function SecurityPage() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<SecurityTestResult[]>([]);
  const [unauthorizedResults, setUnauthorizedResults] = useState<SecurityTestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const runSecurityTests = useCallback(async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const userTests = await SecurityChecker.testUserPermissions(user.uid);
      const unauthorizedTests = await SecurityChecker.testUnauthorizedAccess();
      
      setTestResults(userTests);
      setUnauthorizedResults(unauthorizedTests);
    } catch (error) {
      console.error('Error running security tests:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      runSecurityTests();
    }
  }, [user, runSecurityTests]);

  const copyRules = async () => {
    const rules = SecurityChecker.getRecommendedRules();
    try {
      await navigator.clipboard.writeText(rules);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying rules:', error);
    }
  };

  const openFirebaseConsole = () => {
    window.open('https://console.firebase.google.com/', '_blank');
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusColor = (passed: boolean) => {
    return passed ? 'text-green-700' : 'text-red-700';
  };

  const getStatusBg = (passed: boolean) => {
    return passed ? 'bg-green-50' : 'bg-red-50';
  };

  if (!user || user.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-red-600">
              Solo los administradores pueden acceder a esta página.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Verificación de Seguridad</h1>
                <p className="text-gray-600">Verifica las reglas de seguridad de Firebase</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button onClick={runSecurityTests} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Ejecutando...' : 'Ejecutar Tests'}
              </Button>
              <Button variant="outline" onClick={openFirebaseConsole}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Firebase Console
              </Button>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Permissions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Permisos de Usuario
            </h2>
            
            {testResults.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Ejecutando tests de seguridad...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getStatusBg(result.passed)} ${result.passed ? 'border-green-200' : 'border-red-200'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 flex-1">
                        {getStatusIcon(result.passed)}
                        <div className="flex-1">
                          <p className={`font-medium ${getStatusColor(result.passed)}`}>
                            {result.test}
                          </p>
                          {result.details && (
                            <p className="text-sm text-gray-600 mt-1">
                              {result.details}
                            </p>
                          )}
                          {result.error && (
                            <p className="text-sm text-red-600 mt-1">
                              Error: {result.error}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unauthorized Access */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              Acceso No Autorizado
            </h2>
            
            {unauthorizedResults.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Ejecutando tests de acceso no autorizado...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unauthorizedResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getStatusBg(result.passed)} ${result.passed ? 'border-green-200' : 'border-red-200'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 flex-1">
                        {getStatusIcon(result.passed)}
                        <div className="flex-1">
                          <p className={`font-medium ${getStatusColor(result.passed)}`}>
                            {result.test}
                          </p>
                          {result.details && (
                            <p className="text-sm text-gray-600 mt-1">
                              {result.details}
                            </p>
                          )}
                          {result.error && (
                            <p className="text-sm text-red-600 mt-1">
                              Error: {result.error}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recommended Rules */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Reglas de Seguridad Recomendadas</h2>
            <Button onClick={copyRules} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copiado!' : 'Copiar Reglas'}
            </Button>
          </div>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">
              <code>{SecurityChecker.getRecommendedRules()}</code>
            </pre>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Instrucciones:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Ve a <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
              <li>2. Selecciona tu proyecto</li>
              <li>3. Ve a <strong>Firestore Database</strong> → <strong>Rules</strong></li>
              <li>4. Copia y pega las reglas recomendadas arriba</li>
              <li>5. Haz clic en <strong>Publish</strong></li>
              <li>6. Repite el proceso para <strong>Storage</strong> → <strong>Rules</strong></li>
            </ol>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Seguridad</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {testResults.filter(r => r.passed).length}
              </div>
              <div className="text-sm text-green-700">Tests Exitosos</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {testResults.filter(r => !r.passed).length}
              </div>
              <div className="text-sm text-red-700">Tests Fallidos</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {testResults.length + unauthorizedResults.length}
              </div>
              <div className="text-sm text-blue-700">Total de Tests</div>
            </div>
          </div>
          
          {testResults.some(r => !r.passed) && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800 font-medium">
                  Se encontraron problemas de seguridad. Revisa los tests fallidos y actualiza las reglas de Firebase.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
