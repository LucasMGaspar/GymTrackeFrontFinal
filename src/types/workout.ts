export interface WorkoutExecution {
  id: string;
  userId: string;
  date: string;
  dayOfWeek: string;
  muscleGroups: string[];
  startTime: string;
  endTime?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  exerciseExecutions?: ExerciseExecution[];
}

export interface ExerciseExecution {
  id: string;
  workoutExecutionId: string;
  exerciseId: string;
  exerciseName: string;
  order: number;
  plannedSeries: number;
  completedSeries: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  exercise?: {
    id: string;
    name: string;
    muscleGroups: string[];
    equipment?: string;
  };
  seriesExecutions?: SeriesExecution[];
}

export interface SeriesExecution {
  id: string;
  exerciseExecutionId: string;
  seriesNumber: number;
  weight: number;
  reps: number;
  restTime?: number;
  difficulty?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StartWorkoutData {
  muscleGroups: string[];
  notes?: string;
}

export interface SelectExercisesData {
  exerciseIds: string[];
}

export interface RegisterSeriesData {
  weight: number;
  reps: number;
  restTime?: number;
  difficulty?: number;
  notes?: string;
}