// src/components/ui/OverviewCard.tsx
import React from 'react';

interface OverviewCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="text-3xl" style={{ color }}>
        {icon}
      </div>
    </div>
  </div>
);