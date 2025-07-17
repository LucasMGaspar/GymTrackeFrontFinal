'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { workoutService } from '@/services/workout.service';
import { Exercise } from '@/types/exercise';
import { WorkoutExecution } from '@/types/workout';
import { 
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Dumbbell,
  Target,
  Settings,
  Calendar,
  Play,
  Plus,
  Info,
  Clock
} from 'lucide-react';

export default function SelectExercisesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workoutId = params.workoutId as string;

  const [workout, setWorkout] = useState<WorkoutExecution | null>(null);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMuscle, setFilterMuscle] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadWorkoutData();
  }, [isAuthenticated, workoutId, router]);

  useEffect(() => {
    filterExercises();
  }, [availableExercises, searchTerm, filterMuscle]);

  const loadWorkoutData = async () => {
    try {
      setLoading(true);
      
      const [workoutDetails, exercises] = await Promise.all([
        workoutService.getWorkoutDetails(workoutId),
        workoutService.getAvailableExercises(workoutId),
      ]);

      setWorkout(workoutDetails);
      setAvailableExercises(exercises);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar treino. Tente novamente.');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = availableExercises;

    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.muscleGroups.some(muscle => 
          muscle.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (filterMuscle) {
      filtered = filtered.filter(exercise =>
        exercise.muscleGroups.includes(filterMuscle)
      );
    }

    setFilteredExercises(filtered);
  };

  const handleExerciseToggle = (exerciseId: string) => {
    setSelectedExercises(prev => 
      prev.includes(exerciseId)
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedExercises.length === filteredExercises.length) {
      setSelectedExercises([]);
    } else {
      setSelectedExercises(filteredExercises.map(e => e.id));
    }
  };

  const handleContinue = async () => {
    if (selectedExercises.length === 0) {
      alert('Selecione pelo menos um exercício!');
      return;
    }

    try {
      setLoading(true);
      
      await workoutService.selectExercises(workoutId, {
        exerciseIds: selectedExercises,
      });

      router.push(`/workout/${workoutId}/execute`);
    } catch (error) {
      console.error('Erro ao selecionar exercícios:', error);
      alert('Erro ao selecionar exercícios. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getUniqueAcMuscleGroups = () => {
    const muscles = availableExercises.flatMap(e => e.muscleGroups);
    return [...new Set(muscles)];
  };

  const getExerciseIcon = (exercise: Exercise) => {
    if (exercise.equipment?.toLowerCase().includes('halteres')) return '🏋️';
    if (exercise.equipment?.toLowerCase().includes('barra')) return '🥇';
    if (exercise.equipment?.toLowerCase().includes('cabo')) return '🔗';
    if (exercise.equipment?.toLowerCase().includes('máquina')) return '⚙️';
    if (!exercise.equipment || exercise.equipment.toLowerCase().includes('corpo')) return '💪';
    return '🏋️';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando exercícios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Dumbbell className="h-4 w-4 text-green-600" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Selecionar Exercícios</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">Configurar</span>
            </div>
            <div className="w-12 h-0.5 bg-green-500"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">2</span>
              </div>
              <span className="text-sm font-medium text-blue-600">Exercícios</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">3</span>
              </div>
              <span className="text-sm text-gray-500">Executar</span>
            </div>
          </div>
        </div>

        {/* Workout Info */}
        {workout && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {workout.dayOfWeek}
                  </h2>
                  <p className="text-blue-700 font-medium">
                    Músculos: {Array.isArray(workout.muscleGroups) ? workout.muscleGroups.join(', ') : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-600 font-medium">Status</div>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {workout.status === 'IN_PROGRESS' ? 'Em Progresso' : workout.status}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
              </h3>
              
              {/* Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nome do exercício..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Muscle Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grupo Muscular
                </label>
                <select
                  value={filterMuscle}
                  onChange={(e) => setFilterMuscle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  {getUniqueAcMuscleGroups().map(muscle => (
                    <option key={muscle} value={muscle}>{muscle}</option>
                  ))}
                </select>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSelectAll}
                  className="w-full justify-center"
                >
                  {selectedExercises.length === filteredExercises.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </Button>
                
                {selectedExercises.length > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm font-medium text-green-900 mb-1">
                      {selectedExercises.length} selecionado{selectedExercises.length > 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-green-700">
                      Pronto para começar o treino!
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Exercise List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Exercícios Disponíveis
                  </h3>
                  <p className="text-sm text-gray-600">
                    {filteredExercises.length} exercício{filteredExercises.length !== 1 ? 's' : ''} encontrado{filteredExercises.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push('/exercises')}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Novo Exercício</span>
                </Button>
              </div>

              {filteredExercises.length > 0 ? (
                <div className="grid gap-4">
                  {filteredExercises.map((exercise) => {
                    const isSelected = selectedExercises.includes(exercise.id);
                    
                    return (
                      <div
                        key={exercise.id}
                        onClick={() => handleExerciseToggle(exercise.id)}
                        className={`
                          p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] group
                          ${isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="text-3xl">{getExerciseIcon(exercise)}</div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                {exercise.name}
                              </h4>
                              <div className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center space-x-1 text-sm">
                                  <Target className="h-4 w-4 text-gray-400" />
                                  <span className={isSelected ? 'text-blue-700' : 'text-gray-600'}>
                                    {exercise.muscleGroups.join(', ')}
                                  </span>
                                </div>
                                {exercise.equipment && (
                                  <div className="flex items-center space-x-1 text-sm">
                                    <Settings className="h-4 w-4 text-gray-400" />
                                    <span className={isSelected ? 'text-blue-600' : 'text-gray-500'}>
                                      {exercise.equipment}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                            ${isSelected
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 group-hover:border-blue-400'
                            }
                          `}>
                            {isSelected ? (
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            ) : (
                              <Circle className="h-4 w-4 text-transparent" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Dumbbell className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || filterMuscle ? 'Nenhum exercício encontrado' : 'Nenhum exercício disponível'}
                  </h4>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || filterMuscle 
                      ? 'Tente ajustar os filtros de busca.'
                      : 'Cadastre exercícios para os grupos musculares selecionados.'
                    }
                  </p>
                  <Button 
                    variant="secondary"
                    onClick={() => router.push('/exercises')}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Cadastrar Exercícios</span>
                  </Button>
                </div>
              )}

              {/* Selected Summary */}
              {selectedExercises.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900 mb-2">
                        {selectedExercises.length} exercício{selectedExercises.length > 1 ? 's' : ''} selecionado{selectedExercises.length > 1 ? 's' : ''}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedExercises.map(id => {
                          const exercise = availableExercises.find(e => e.id === id);
                          return exercise ? (
                            <span 
                              key={id}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {exercise.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="mt-8 text-center">
              <Button
                onClick={handleContinue}
                disabled={loading || selectedExercises.length === 0}
                size="lg"
                className="px-8 py-4 text-lg font-medium flex items-center space-x-2 mx-auto"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    <span>Começar Treino</span>
                  </>
                )}
              </Button>
              
              {selectedExercises.length === 0 && (
                <p className="text-sm text-gray-500 mt-3 flex items-center justify-center space-x-1">
                  <Info className="h-4 w-4" />
                  <span>Selecione pelo menos um exercício para continuar</span>
                </p>
              )}

              {selectedExercises.length > 0 && (
                <p className="text-sm text-green-600 mt-3 flex items-center justify-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Tempo estimado: {selectedExercises.length * 8}-{selectedExercises.length * 12} minutos</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}