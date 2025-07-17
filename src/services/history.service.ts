// src/services/history.service.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface HistoryFilters {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  muscleGroup?: string;
  search?: string;
}

export interface WorkoutHistoryItem {
  id: string;
  date: string;
  dayOfWeek: string;
  muscleGroups: string[];
  status: 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
  startTime: string;
  endTime?: string;
  notes?: string;
  exerciseExecutions: Array<{
    id: string;
    exerciseName: string;
    isCompleted: boolean;
    seriesExecutions: Array<{
      weight: number;
      reps: number;
    }>;
  }>;
  stats: {
    totalExercises: number;
    completedExercises: number;
    totalSeries: number;
    totalVolume: number;
    duration: number;
    completionRate: number;
  };
}

export interface HistoryStats {
  period: string;
  totals: {
    workouts: number;
    completedWorkouts: number;
    cancelledWorkouts: number;
    inProgressWorkouts: number;
    exercises: number;
    series: number;
    volume: number;
    duration: number;
  };
  averages: {
    workoutsPerWeek: number;
    exercisesPerWorkout: number;
    seriesPerWorkout: number;
    volumePerWorkout: number;
    durationPerWorkout: number;
  };
  completionRate: number;
}

export interface WeeklyPattern {
  dayOfWeek: string;
  count: number;
  percentage: number;
}

export interface MuscleGroupStat {
  name: string;
  count: number;
  percentage: number;
}

export class HistoryService {
  private static async fetchWithParams(endpoint: string, params?: Record<string, any>) {
    const url = new URL(`${API_BASE_URL}/history/${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.statusText}`);
    }
    return response.json();
  }

  // Listar histórico de treinos
  static async getWorkoutHistory(filters?: HistoryFilters) {
    // Filtrar valores vazios e preparar parâmetros
    const cleanFilters: Record<string, any> = {};
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanFilters[key] = value;
        }
      });
    }
    
    return this.fetchWithParams('', cleanFilters);
  }

  // Detalhes de um treino específico
  static async getWorkoutDetails(workoutId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/history/${workoutId}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar detalhes: ${response.statusText}`);
    }
    return response.json();
  }

  // Estatísticas do histórico
  static async getHistoryStats(period: 'week' | 'month' | 'year' | 'all' = 'month', startDate?: string, endDate?: string) {
    return this.fetchWithParams('stats/overview', { period, startDate, endDate });
  }

  // Padrão semanal
  static async getWeeklyPattern(startDate?: string, endDate?: string): Promise<WeeklyPattern[]> {
    return this.fetchWithParams('stats/weekly-pattern', { startDate, endDate });
  }

  // Estatísticas de grupos musculares
  static async getMuscleGroupStats(startDate?: string, endDate?: string): Promise<MuscleGroupStat[]> {
    return this.fetchWithParams('stats/muscle-groups', { startDate, endDate });
  }

  // Deletar treino
  static async deleteWorkout(workoutId: string) {
    const response = await fetch(`${API_BASE_URL}/history/${workoutId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao deletar treino: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Duplicar treino
  static async duplicateWorkout(workoutId: string) {
    return this.fetchWithParams(`${workoutId}/duplicate`);
  }
}