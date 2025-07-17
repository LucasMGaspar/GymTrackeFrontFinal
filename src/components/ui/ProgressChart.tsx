// src/components/ui/ProgressChart.tsx
import React from 'react';

interface ProgressChartProps {
  data: Array<{
    date: string;
    value: number;
    label?: string;
  }>;
  title: string;
  color?: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ 
  data, 
  title, 
  color = '#3B82F6' 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 min-w-[80px]">
              {new Date(item.date).toLocaleDateString('pt-BR', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
            <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: color,
                  width: `${(item.value / maxValue) * 100}%`
                }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900 min-w-[60px] text-right">
              {item.value}{item.label || 'kg'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};