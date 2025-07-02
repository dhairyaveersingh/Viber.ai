import React from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface StatusBarProps {
  status: 'ready' | 'building' | 'error';
  message: string;
  aiProvider?: string;
  model?: string;
}

export function StatusBar({ status, message, aiProvider, model }: StatusBarProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'ready': return CheckCircle;
      case 'building': return Loader;
      case 'error': return AlertCircle;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'ready': return 'text-green-500';
      case 'building': return 'text-orange-500';
      case 'error': return 'text-red-500';
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="h-8 bg-gray-50 border-t border-gray-200 flex items-center justify-between px-6 text-xs">
      <div className="flex items-center space-x-2">
        <StatusIcon className={`w-3 h-3 ${getStatusColor()} ${status === 'building' ? 'animate-spin' : ''}`} />
        <span className="text-gray-600 font-light">{message}</span>
      </div>
      
      {aiProvider && model && (
        <div className="flex items-center space-x-4 text-gray-500 font-light">
          <span>AI: {aiProvider}</span>
          <span>Model: {model}</span>
        </div>
      )}
    </div>
  );
}