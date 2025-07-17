// src/components/ui/PersonalRecordsTable.tsx
import React from 'react';

interface PersonalRecordsTableProps {
  records: Array<{
    exerciseName: string;
    record: {
      value: number;
      date: string;
      reps?: number;
      weight?: number;
    };
    type: string;
  }>;
}

export const PersonalRecordsTable: React.FC<PersonalRecordsTableProps> = ({ records }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Recordes Pessoais</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Exercício
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Recorde
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {records.map((record, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {record.exerciseName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className="font-bold text-blue-600">{record.record.value}kg</span>
                {record.record.reps && (
                  <span className="text-gray-500 ml-1">x {record.record.reps} reps</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(record.record.date).toLocaleDateString('pt-BR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);