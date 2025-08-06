'use client';

import { useServiceWorker } from '@/hooks/useServiceWorker';
import { Button } from '@/components/ui/Button';
import { RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

export const UpdatePrompt: React.FC = () => {
  const { updateAvailable, updateServiceWorker } = useServiceWorker();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) {
    return null;
  }

  const handleUpdate = () => {
    updateServiceWorker();
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-blue-600 text-white rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5" />
            <div>
              <h3 className="font-medium">
                ¡Nueva versión disponible!
              </h3>
              <p className="text-sm text-blue-100">
                Actualiza para obtener las últimas mejoras
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-blue-200 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleUpdate}
            size="sm"
            variant="outline"
            className="flex-1 bg-white text-blue-600 hover:bg-blue-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar Ahora
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="outline"
            className="bg-transparent border-blue-300 text-blue-100 hover:bg-blue-700"
          >
            Después
          </Button>
        </div>
      </div>
    </div>
  );
};