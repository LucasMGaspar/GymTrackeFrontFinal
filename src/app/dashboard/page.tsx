'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { workoutService } from '@/services/workout.service';
import { exerciseService } from '@/services/exercise.service';
import { WorkoutExecution } from '@/types/workout';
import { Exercise } from '@/types/exercise';
import { 
  Play, 
  Dumbbell, 
  BarChart3, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  Activity,
  User,
  LogOut,
  ChevronRight,
  Zap,
  FileText
} from 'lucide-react';

export default function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutExecution[]>([]);
  const [totalExercises, setTotalExercises] = useState(0);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutExecution | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    weeklyWorkouts: 0,
    monthlyWorkouts: 0,
    currentStreak: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadDashboardData();
  }, [isAuthenticated, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [workouts, exercises] = await Promise.all([
        workoutService.getUserWorkouts(),
        exerciseService.getAll(),
      ]);
      
      // Verificar se tem treino em andamento
      const inProgressWorkout = workouts.find(w => w.status === 'IN_PROGRESS');
      setActiveWorkout(inProgressWorkout || null);
      
      // Calcular estatísticas
      const completedWorkouts = workouts.filter(w => w.status === 'COMPLETED');
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const weeklyWorkouts = completedWorkouts.filter(w => new Date(w.date) >= weekAgo).length;
      const monthlyWorkouts = completedWorkouts.filter(w => new Date(w.date) >= monthAgo).length;
      
      setStats({
        totalWorkouts: completedWorkouts.length,
        weeklyWorkouts,
        monthlyWorkouts,
        currentStreak: calculateStreak(completedWorkouts)
      });
      
      setRecentWorkouts(workouts.slice(0, 5));
      setTotalExercises(exercises.length);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (workouts: WorkoutExecution[]) => {
    // Implementação simplificada do cálculo de sequência
    const sortedWorkouts = workouts
      .filter(w => w.status === 'COMPLETED')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date);
      const diffDays = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        streak++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const handleStartWorkout = () => {
    router.push('/workout/start');
  };

  const handleContinueWorkout = () => {
    if (activeWorkout) {
      if (activeWorkout.exerciseExecutions && activeWorkout.exerciseExecutions.length > 0) {
        router.push(`/workout/${activeWorkout.id}/execute`);
      } else {
        router.push(`/workout/${activeWorkout.id}/exercises`);
      }
    }
  };

  const handleViewExercises = () => {
    router.push('/dashboard/exercises/create');
  };

  const handleViewHistory = () => {
    router.push('/dashboard/history');
  };

  // NOVA FUNÇÃO: Redirecionar para relatórios
  const handleViewReports = () => {
    router.push('/dashboard/reports');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GT</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Gym Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={logout}
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo de volta, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-gray-600">
            Acompanhe seu progresso e mantenha-se consistente com seus treinos.
          </p>
        </div>

        {/* Active Workout Alert */}
        {activeWorkout && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-900 mb-1">
                    Treino em Andamento
                  </h3>
                  <p className="text-orange-700 text-sm">
                    {activeWorkout.dayOfWeek} • {Array.isArray(activeWorkout.muscleGroups) ? activeWorkout.muscleGroups.join(', ') : 'N/A'}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleContinueWorkout}
                className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>Continuar Treino</span>
              </Button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Treinos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalWorkouts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold text-gray-900">{stats.weeklyWorkouts}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Este Mês</p>
                <p className="text-2xl font-bold text-gray-900">{stats.monthlyWorkouts}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sequência</p>
                <p className="text-2xl font-bold text-gray-900">{stats.currentStreak}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - MODIFICADO: Agora com 4 colunas para incluir Relatórios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Iniciar Treino</h3>
            <p className="text-gray-600 text-sm mb-4">Comece um novo treino personalizado</p>
            <Button 
              className="w-full"
              onClick={handleStartWorkout}
              disabled={!!activeWorkout}
            >
              {activeWorkout ? 'Treino em Andamento' : 'Iniciar Agora'}
            </Button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-green-600" />
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Exercícios</h3>
            <p className="text-gray-600 text-sm mb-4">{totalExercises} exercícios disponíveis</p>
            <Button 
              variant="secondary"
              className="w-full"
              onClick={handleViewExercises}
            >
              Cadastrar Exercícios
            </Button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Histórico</h3>
            <p className="text-gray-600 text-sm mb-4">Acompanhe sua evolução</p>
            <Button 
              variant="secondary"
              className="w-full"
              onClick={handleViewHistory}
            >
              Ver Histórico
            </Button>
          </div>

          {/* NOVO: Card de Relatórios */}
          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Relatórios</h3>
            <p className="text-gray-600 text-sm mb-4">Análises detalhadas e progresso</p>
            <Button 
              variant="secondary"
              className="w-full"
              onClick={handleViewReports}
            >
              Ver Relatórios
            </Button>
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Treinos Recentes
            </h3>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleViewHistory}
              className="flex items-center space-x-1"
            >
              <span>Ver todos</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {recentWorkouts.length > 0 ? (
            <div className="space-y-3">
              {recentWorkouts.map((workout) => (
                <div 
                  key={workout.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      workout.status === 'COMPLETED' ? 'bg-green-100' : 
                      workout.status === 'IN_PROGRESS' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {workout.status === 'COMPLETED' ? (
                        <Activity className="h-5 w-5 text-green-600" />
                      ) : workout.status === 'IN_PROGRESS' ? (
                        <Clock className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Activity className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">
                          {workout.dayOfWeek}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(workout.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {Array.isArray(workout.muscleGroups) ? workout.muscleGroups.join(', ') : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      workout.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                      workout.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {workout.status === 'COMPLETED' ? 'Concluído' : 
                       workout.status === 'IN_PROGRESS' ? 'Em andamento' : 'Cancelado'}
                    </span>
                    {workout.status === 'IN_PROGRESS' && (
                      <Button
                        size="sm"
                        onClick={handleContinueWorkout}
                        className="flex items-center space-x-1"
                      >
                        <Play className="h-3 w-3" />
                        <span>Continuar</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum treino realizado</h4>
              <p className="text-gray-600 mb-6">Comece sua jornada fitness hoje mesmo!</p>
              <Button onClick={handleStartWorkout}>
                Fazer Primeiro Treino
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}