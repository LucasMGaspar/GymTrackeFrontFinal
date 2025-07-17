// src/services/reports.service.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ReportParams {
  startDate?: string;
  endDate?: string;
  exerciseId?: string;
  exerciseIds?: string[];
  metric?: 'weight' | 'reps' | 'volume';
  seriesType?: 'max' | 'average' | 'all';
  type?: 'weight' | 'reps' | 'volume';
  period?: 'week' | 'month' | 'year';
  format?: 'json' | 'summary';
}

export interface WorkoutOverview {
  period: { startDate: string; endDate: string };
  totals: { workouts: number; exercises: number; series: number; volume: number };
  averages: { exercisesPerWorkout: number; seriesPerWorkout: number; durationMinutes: number };
  workoutDates: string[];
}

export interface ExerciseEvolution {
  exerciseName: string;
  exerciseId: string;
  seriesType: string;
  period: { startDate: string; endDate: string; totalSessions: number };
  data: Array<{
    date: string;
    dayOfWeek: string;
    maxWeight?: { weight: number; reps: number; volume: number };
    maxReps?: { weight: number; reps: number; volume: number };
    bestVolume?: { weight: number; reps: number; volume: number };
  }>;
  analysis: {
    weightProgress: { initial: number; current: number; difference: number; percentage: number };
    repsProgress: { initial: number; current: number; difference: number; percentage: number };
    volumeProgress: { initial: number; current: number; difference: number; percentage: number };
    overallTrend: 'improving' | 'mixed' | 'declining';
    sessionsAnalyzed: number;
  };
}

export interface ExerciseComparison {
  metric: string;
  period: { startDate: string; endDate: string };
  exercises: Array<{
    exerciseId: string;
    exerciseName: string;
    totalSessions: number;
    improvement: { difference: number; percentage: number; initialValue: number; currentValue: number };
  }>;
  ranking: Array<{
    position: number;
    exerciseName: string;
    improvement: { percentage: number };
  }>;
}

export interface PersonalRecord {
  exerciseName: string;
  record: {
    value: number;
    date: string;
    reps?: number;
    weight?: number;
    basedOn?: string;
  };
  type: string;
}

export interface MuscleGroupAnalysis {
  muscleGroups: Array<{
    name: string;
    workouts: number;
    exercises: number;
    series: number;
    volume: number;
    lastWorkout: string;
  }>;
  total: number;
}

export interface WorkoutFrequency {
  period: string;
  data: Array<{
    period: string;
    count: number;
    dates: string[];
  }>;
  summary: {
    total: number;
    average: number;
  };
}

export class ReportsService {
  private static async fetchWithParams(endpoint: string, params?: ReportParams) {
    const url = new URL(`${API_BASE_URL}/reports/${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            url.searchParams.append(key, value.join(','));
          } else {
            url.searchParams.append(key, value.toString());
          }
        }
      });
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.statusText}`);
    }
    return response.json();
  }

  // Relatório geral
  static async getWorkoutOverview(params?: ReportParams): Promise<WorkoutOverview> {
    return this.fetchWithParams('overview', params);
  }

  // Evolução detalhada de exercício
  static async getExerciseEvolution(exerciseId: string, params?: ReportParams): Promise<ExerciseEvolution> {
    return this.fetchWithParams('evolution', { ...params, exerciseId });
  }

  // Comparar exercícios
  static async compareExercises(exerciseIds: string[], metric: 'weight' | 'reps' | 'volume' = 'weight', params?: ReportParams): Promise<ExerciseComparison> {
    return this.fetchWithParams('compare-exercises', { ...params, exerciseIds, metric });
  }

  // Recordes pessoais
  static async getPersonalRecords(params?: ReportParams): Promise<PersonalRecord[]> {
    return this.fetchWithParams('personal-records', params);
  }

  // Progresso de exercícios
  static async getExerciseProgress(params?: ReportParams) {
    return this.fetchWithParams('exercise-progress', params);
  }

  // Frequência de treinos
  static async getWorkoutFrequency(params?: ReportParams): Promise<WorkoutFrequency> {
    return this.fetchWithParams('frequency', params);
  }

  // Análise por grupo muscular
  static async getMuscleGroupAnalysis(params?: ReportParams): Promise<MuscleGroupAnalysis> {
    return this.fetchWithParams('muscle-groups', params);
  }

  // Análise de volume
  static async getVolumeAnalysis(params?: ReportParams) {
    return this.fetchWithParams('volume', params);
  }

  // Duração dos treinos
  static async getWorkoutDuration(params?: ReportParams) {
    return this.fetchWithParams('duration', params);
  }

  // Consistência
  static async getWorkoutConsistency(params?: ReportParams) {
    return this.fetchWithParams('consistency', params);
  }

  // Análise de força
  static async getStrengthAnalysis(params?: ReportParams) {
    return this.fetchWithParams('strength-analysis', params);
  }

  // Relatório completo
  static async getCompleteReport(params?: ReportParams) {
    return this.fetchWithParams('complete', params);
  }
}