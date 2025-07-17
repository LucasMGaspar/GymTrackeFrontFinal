// src/components/ui/StatsCard.tsx
import React from 'react';

interface StatsCardProps {
  title: string;
  current: number;
  previous: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  current, 
  previous, 
  unit, 
  trend 
}) => {
  const percentage = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const isPositive = percentage > 0;
  
  const getTrendColor = () => {
    if (trend === 'up' || isPositive) return 'text-green-600';
    if (trend === 'down' || percentage < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = () => {
    if (trend === 'up' || isPositive) return '↗️';
    if (trend === 'down' || percentage < 0) return '↘️';
    return '➡️';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-gray-900">
          {current.toLocaleString()}{unit}
        </span>
        <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
          <span>{getTrendIcon()}</span>
          <span className="text-sm font-medium">
            {Math.abs(percentage).toFixed(1)}%
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Anterior: {previous.toLocaleString()}{unit}
      </p>
    </div>
  );
};