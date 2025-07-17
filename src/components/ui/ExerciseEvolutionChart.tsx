// src/components/ui/ExerciseEvolutionChart.tsx
import React from 'react';

interface ExerciseEvolutionChartProps {
  data: Array<{
    date: string;
    maxWeight?: { weight: number; reps: number };
    maxReps?: { weight: number; reps: number };
  }>;
  exerciseName: string;
}

export const ExerciseEvolutionChart: React.FC<ExerciseEvolutionChartProps> = ({ 
  data, 
  exerciseName 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Evolução - {exerciseName}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de Peso */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Peso Máximo (kg)</h4>
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {new Date(item.date).toLocaleDateString('pt-BR')}
                </span>
                <span className="font-medium">
                  {item.maxWeight?.weight}kg x {item.maxWeight?.reps} reps
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Repetições */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Repetições Máximas</h4>
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {new Date(item.date).toLocaleDateString('pt-BR')}
                </span>
                <span className="font-medium">
                  {item.maxReps?.reps} reps x {item.maxReps?.weight}kg
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};