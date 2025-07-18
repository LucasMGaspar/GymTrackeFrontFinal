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

// ALTERADO: Chaves agora em minúscula para compatibilidade com backend
export const MUSCLE_GROUPS = {
  chest: 'Peito',
  back: 'Costas',
  shoulders: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  legs: 'Pernas',
  glutes: 'Glúteos',
  abs: 'Abdômen',
  calves: 'Panturrilha',
  cardio: 'Cardio',
} as const;

export type MuscleGroup = keyof typeof MUSCLE_GROUPS;