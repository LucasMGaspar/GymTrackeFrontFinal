import api from '@/lib/api';
import { Exercise, CreateExerciseData, MUSCLE_GROUPS, MuscleGroup } from '@/types/exercise';

// Função auxiliar para converter grupos musculares português -> inglês
const convertMuscleGroupsToEnglish = (muscleGroups: string[]): string[] => {
  const reverseMap: Record<string, MuscleGroup> = {};
  Object.entries(MUSCLE_GROUPS).forEach(([key, value]) => {
    reverseMap[value] = key as MuscleGroup;
  });
  
  return muscleGroups.map(group => reverseMap[group] || group);
};

// Função auxiliar para converter grupos musculares inglês -> português
const convertMuscleGroupsToPortuguese = (muscleGroups: string[]): string[] => {
  return muscleGroups.map(group => MUSCLE_GROUPS[group as MuscleGroup] || group);
};

export const exerciseService = {
  async getAll(): Promise<Exercise[]> {
    const response = await api.get('/exercises');
    // Converter grupos musculares para português na resposta
    return response.data.map((exercise: Exercise) => ({
      ...exercise,
      muscleGroups: convertMuscleGroupsToPortuguese(exercise.muscleGroups)
    }));
  },

  async getByMuscleGroups(muscleGroups: string[]): Promise<Exercise[]> {
    // Converter para inglês antes de enviar
    const muscleGroupsInEnglish = convertMuscleGroupsToEnglish(muscleGroups);
    const params = muscleGroupsInEnglish.join(',');
    const response = await api.get(`/exercises?muscleGroups=${params}`);
    
    // Converter grupos musculares para português na resposta
    return response.data.map((exercise: Exercise) => ({
      ...exercise,
      muscleGroups: convertMuscleGroupsToPortuguese(exercise.muscleGroups)
    }));
  },

  async create(data: CreateExerciseData): Promise<Exercise> {
    // Converter grupos musculares para inglês antes de enviar
    const dataToSend = {
      ...data,
      muscleGroups: convertMuscleGroupsToEnglish(data.muscleGroups)
    };
    
    const response = await api.post('/exercises', dataToSend);
    
    // Converter grupos musculares para português na resposta
    return {
      ...response.data,
      muscleGroups: convertMuscleGroupsToPortuguese(response.data.muscleGroups)
    };
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/exercises/${id}`);
  },

  // NOVOS MÉTODOS ADICIONADOS:

  async getById(id: string): Promise<Exercise> {
    const response = await api.get(`/exercises/${id}`);
    
    // Converter grupos musculares para português na resposta
    return {
      ...response.data,
      muscleGroups: convertMuscleGroupsToPortuguese(response.data.muscleGroups)
    };
  },

  async update(id: string, data: Partial<CreateExerciseData>): Promise<Exercise> {
    // Converter grupos musculares para inglês antes de enviar (se existir)
    const dataToSend = {
      ...data,
      ...(data.muscleGroups && {
        muscleGroups: convertMuscleGroupsToEnglish(data.muscleGroups)
      })
    };
    
    const response = await api.put(`/exercises/${id}`, dataToSend);
    
    // Converter grupos musculares para português na resposta
    return {
      ...response.data,
      muscleGroups: convertMuscleGroupsToPortuguese(response.data.muscleGroups)
    };
  },

  // Método de validação local (não faz chamada à API)
  validateExercise(data: CreateExerciseData): string[] {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length < 3) {
      errors.push('Nome deve ter pelo menos 3 caracteres');
    }

    if (!data.muscleGroups || data.muscleGroups.length === 0) {
      errors.push('Selecione pelo menos um grupo muscular');
    }

    return errors;
  }
};