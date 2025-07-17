// src/components/ui/LoadingSpinner.tsx
import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

// src/components/ui/ErrorMessage.tsx
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-center">
      <div className="text-red-400">⚠️</div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">Erro</h3>
        <p className="text-sm text-red-700 mt-1">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  </div>
);