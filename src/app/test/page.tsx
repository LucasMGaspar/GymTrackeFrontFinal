'use client';

import { useState } from 'react';
import { exerciseService } from '@/services/exercise.service';
import { workoutService } from '@/services/workout.service';

export default function TestPage() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testExercises = async () => {
    try {
      setLoading(true);
      const data = await exerciseService.getAll();
      setExercises(data);
      alert('✅ Exercícios carregados com sucesso!');
    } catch (error) {
      alert('❌ Erro ao carregar exercícios: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const testWorkouts = async () => {
    try {
      setLoading(true);
      const data = await workoutService.getUserWorkouts();
      setWorkouts(data);
      alert('✅ Treinos carregados com sucesso!');
    } catch (error) {
      alert('❌ Erro ao carregar treinos: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🧪 Teste de Conexão com API
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Teste de Exercícios */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Exercícios</h2>
            <button
              onClick={testExercises}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Testar Exercícios'}
            </button>
            
            {exercises.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium">Exercícios encontrados:</h3>
                <ul className="mt-2 space-y-1">
                  {exercises.map((exercise, index) => (
                    <li key={index} className="text-sm bg-gray-50 p-2 rounded">
                      {exercise.name} - {exercise.muscleGroups?.join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Teste de Treinos */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Treinos</h2>
            <button
              onClick={testWorkouts}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Testar Treinos'}
            </button>
            
            {workouts.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium">Treinos encontrados:</h3>
                <ul className="mt-2 space-y-1">
                  {workouts.map((workout, index) => (
                    <li key={index} className="text-sm bg-gray-50 p-2 rounded">
                      {workout.dayOfWeek} - {workout.status}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}