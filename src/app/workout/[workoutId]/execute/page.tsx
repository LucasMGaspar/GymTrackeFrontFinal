'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { workoutService } from '@/services/workout.service';
import { WorkoutExecution, ExerciseExecution, SeriesExecution } from '@/types/workout';
import { 
  ArrowLeft,
  Activity,
  Target,
  Timer,
  Weight,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Zap,
  Play,
  Pause,
  Hash,
  Settings
} from 'lucide-react';

export default function ExecuteWorkoutPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workoutId = params.workoutId as string;

  const [workout, setWorkout] = useState<WorkoutExecution | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [seriesCount, setSeriesCount] = useState<number>(3);
  const [currentSeries, setCurrentSeries] = useState<{[key: number]: SeriesExecution}>({});
  const [loading, setLoading] = useState(true);
  const [restTimer, setRestTimer] = useState<number>(0);
  const [isResting, setIsResting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadWorkoutData();
  }, [isAuthenticated, workoutId, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  const loadWorkoutData = async () => {
    try {
      setLoading(true);
      const workoutDetails = await workoutService.getWorkoutDetails(workoutId);
      setWorkout(workoutDetails);
    } catch (error) {
      console.error('Erro ao carregar treino:', error);
      alert('Erro ao carregar treino. Tente novamente.');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const currentExercise = workout?.exerciseExecutions?.[currentExerciseIndex];

  const handleDefineSeriesCount = async () => {
    if (!currentExercise) return;

    try {
      await workoutService.defineSeries(workoutId, currentExercise.id, seriesCount);
      
      setWorkout(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        updated.exerciseExecutions![currentExerciseIndex].plannedSeries = seriesCount;
        return updated;
      });

      const emptySeries: {[key: number]: SeriesExecution} = {};
      for (let i = 1; i <= seriesCount; i++) {
        emptySeries[i] = {
          id: '',
          exerciseExecutionId: currentExercise.id,
          seriesNumber: i,
          weight: 0,
          reps: 0,
          restTime: 90,
          createdAt: '',
          updatedAt: '',
        };
      }
      setCurrentSeries(emptySeries);
    } catch (error) {
      console.error('Erro ao definir séries:', error);
      alert('Erro ao definir séries. Tente novamente.');
    }
  };

  const handleRegisterSeries = async (seriesNumber: number) => {
    if (!currentExercise) return;

    const seriesData = currentSeries[seriesNumber];
    if (!seriesData || seriesData.weight <= 0 || seriesData.reps <= 0) {
      alert('Preencha peso e repetições válidos!');
      return;
    }

    try {
      const registeredSeries = await workoutService.registerSeries(
        workoutId,
        currentExercise.id,
        seriesNumber,
        {
          weight: seriesData.weight,
          reps: seriesData.reps,
          restTime: seriesData.restTime,
        }
      );

      setCurrentSeries(prev => ({
        ...prev,
        [seriesNumber]: { ...registeredSeries }
      }));

      // Iniciar timer de descanso
      if ((seriesData.restTime ?? 0) > 0 && seriesNumber < currentExercise.plannedSeries) {
        setRestTimer(seriesData.restTime ?? 90);
        setIsResting(true);
      }

    } catch (error) {
      console.error('Erro ao registrar série:', error);
      alert('Erro ao registrar série. Tente novamente.');
    }
  };

  const handleCompleteExercise = async () => {
    if (!currentExercise) return;

    try {
      await workoutService.completeExercise(workoutId, currentExercise.id);
      
      if (currentExerciseIndex < (workout?.exerciseExecutions?.length || 0) - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setSeriesCount(3);
        setCurrentSeries({});
        setIsResting(false);
        setRestTimer(0);
      } else {
        await workoutService.finishWorkout(workoutId, 'Treino concluído com sucesso!');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erro ao completar exercício:', error);
      alert('Erro ao completar exercício. Tente novamente.');
    }
  };

  const updateSeriesData = (seriesNumber: number, field: 'weight' | 'reps' | 'restTime', value: number) => {
    setCurrentSeries(prev => ({
      ...prev,
      [seriesNumber]: {
        ...prev[seriesNumber],
        [field]: value
      }
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCompletedSeries = () => {
    return Object.values(currentSeries).filter(series => series.id).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando treino...</p>
        </div>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum exercício encontrado</h3>
          <p className="text-gray-600 mb-4">Não foi possível carregar os exercícios do treino.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Voltar ao Dashboard
          </Button>
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
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-green-600" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Executando Treino</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 flex items-center space-x-2">
                <Hash className="h-4 w-4" />
                <span>{currentExerciseIndex + 1} de {workout?.exerciseExecutions?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Rest Timer Alert */}
        {isResting && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Timer className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">Tempo de Descanso</h3>
                  <p className="text-sm text-blue-700">Relaxe e prepare-se para a próxima série</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{formatTime(restTimer)}</div>
                <button
                  onClick={() => setIsResting(false)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Pular descanso
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Exercise Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Weight className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentExercise.exerciseName}
                </h2>
                <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>{currentExercise.exercise?.muscleGroups?.join(', ')}</span>
                  </span>
                  {currentExercise.exercise?.equipment && (
                    <span className="flex items-center space-x-1">
                      <Settings className="h-4 w-4" />
                      <span>{currentExercise.exercise.equipment}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm font-medium text-gray-900 mb-2">
                  <span>Progresso do Treino</span>
                  <span>{Math.round(((currentExerciseIndex + 1) / (workout?.exerciseExecutions?.length || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${((currentExerciseIndex + 1) / (workout?.exerciseExecutions?.length || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Series Count Selection */}
              {currentExercise.plannedSeries === 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Hash className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Planejamento</h3>
                      <p className="text-sm text-gray-600">Quantas séries você vai fazer?</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSeriesCount(Math.max(1, seriesCount - 1))}
                        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={seriesCount}
                        onChange={(e) => setSeriesCount(parseInt(e.target.value) || 1)}
                        className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={() => setSeriesCount(Math.min(10, seriesCount + 1))}
                        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-gray-600 font-medium">séries</span>
                    <Button onClick={handleDefineSeriesCount} className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Confirmar</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Series Execution */}
              {currentExercise.plannedSeries > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Registrar Séries
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{getCompletedSeries()} de {currentExercise.plannedSeries} completas</span>
                    </div>
                  </div>
                  
                  {Array.from({ length: currentExercise.plannedSeries }, (_, i) => i + 1).map(seriesNumber => {
                    const isCompleted = currentSeries[seriesNumber]?.id;
                    const isCurrentSeries = !isCompleted && getCompletedSeries() + 1 === seriesNumber;
                    
                    return (
                      <div 
                        key={seriesNumber} 
                        className={`p-5 border-2 rounded-xl transition-all ${
                          isCompleted 
                            ? 'border-green-200 bg-green-50' 
                            : isCurrentSeries 
                              ? 'border-blue-200 bg-blue-50 shadow-sm' 
                              : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium ${
                              isCompleted 
                                ? 'bg-green-100 text-green-700' 
                                : isCurrentSeries 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-gray-100 text-gray-600'
                            }`}>
                              {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : seriesNumber}
                            </div>
                            <h4 className="font-medium text-gray-900">Série {seriesNumber}</h4>
                          </div>
                          {isCompleted && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Concluída
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Peso (kg)
                            </label>
                            <div className="relative">
                              <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                value={currentSeries[seriesNumber]?.weight || ''}
                                onChange={(e) => updateSeriesData(seriesNumber, 'weight', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                disabled={!!isCompleted}
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Repetições
                            </label>
                            <div className="relative">
                              <RotateCcw className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="number"
                                min="0"
                                value={currentSeries[seriesNumber]?.reps || ''}
                                onChange={(e) => updateSeriesData(seriesNumber, 'reps', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                disabled={!!isCompleted}
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Descanso (seg)
                            </label>
                            <div className="relative">
                              <Timer className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="number"
                                min="0"
                                value={currentSeries[seriesNumber]?.restTime || 90}
                                onChange={(e) => updateSeriesData(seriesNumber, 'restTime', parseInt(e.target.value) || 90)}
                                placeholder="90"
                                disabled={!!isCompleted}
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {!isCompleted && isCurrentSeries && (
                          <div className="mt-4 text-right">
                            <Button
                              onClick={() => handleRegisterSeries(seriesNumber)}
                              disabled={!currentSeries[seriesNumber]?.weight || !currentSeries[seriesNumber]?.reps}
                              className="flex items-center space-x-2"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Registrar Série</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Complete Exercise Button */}
                  {getCompletedSeries() === currentExercise.plannedSeries && (
                    <div className="text-center pt-6">
                      <Button
                        onClick={handleCompleteExercise}
                        size="lg"
                        className="px-8 py-4 text-lg font-medium flex items-center space-x-2"
                      >
                        {currentExerciseIndex < (workout?.exerciseExecutions?.length || 0) - 1 ? (
                          <>
                            <Play className="h-5 w-5" />
                            <span>Próximo Exercício</span>
                          </>
                        ) : (
                          <>
                            <Trophy className="h-5 w-5" />
                            <span>Finalizar Treino</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Exercise Progress */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Progresso do Exercício</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Séries completas</span>
                  <span className="font-medium">{getCompletedSeries()}/{currentExercise.plannedSeries}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: currentExercise.plannedSeries > 0 
                        ? `${(getCompletedSeries() / currentExercise.plannedSeries) * 100}%` 
                        : '0%'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Workout Overview */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Exercícios do Treino</h3>
              <div className="space-y-2">
                {workout?.exerciseExecutions?.map((exercise, index) => (
                  <div 
                    key={exercise.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      index === currentExerciseIndex 
                        ? 'border-blue-200 bg-blue-50' 
                        : index < currentExerciseIndex
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        index === currentExerciseIndex 
                          ? 'bg-blue-100 text-blue-700' 
                          : index < currentExerciseIndex
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        {index < currentExerciseIndex ? <CheckCircle2 className="h-3 w-3" /> : index + 1}
                      </div>
                      <span className={`text-sm font-medium ${
                        index === currentExerciseIndex ? 'text-blue-900' : 'text-gray-700'
                      }`}>
                        {exercise.exerciseName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}