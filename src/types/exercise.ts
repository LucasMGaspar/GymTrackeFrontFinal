export interface Exercise {
  id: string;
  userId: string;
  name: string;
  muscleGroups: string[];
  equipment?: string;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseData {
  name: string;
  muscleGroups: string[];
  equipment?: string;
  instructions?: string;
}

export const MUSCLE_GROUPS = {
  CHEST: 'Peito',
  BACK: 'Costas',
  SHOULDERS: 'Ombros',
  BICEPS: 'Bíceps',
  TRICEPS: 'Tríceps',
  LEGS: 'Pernas',
  GLUTES: 'Glúteos',
  ABS: 'Abdômen',
  CALVES: 'Panturrilha',
  CARDIO: 'Cardio',
} as const;

export type MuscleGroup = keyof typeof MUSCLE_GROUPS;