import { Exercise, CreateExerciseData, MUSCLE_GROUPS, MuscleGroup } from '@/types/exercise';

const API_BASE_URL = 'http://localhost:3000';

const getToken = () => localStorage.getItem('token');

const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  
  if (!token) {
    throw new Error('Token não encontrado. Faça login novamente.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  // LOG ADICIONAL para debug
  console.log('📤 Request URL:', `${API_BASE_URL}${url}`);
  console.log('📤 Request body:', options.body);

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Token expirado');
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Erro na requisição:', response.status, errorText);
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }

  return response.json();
};

export const exerciseService = {
  async create(data: CreateExerciseData): Promise<Exercise> {
    try {
      console.log('🔍 Dados recebidos:', data);
      
      // REMOVIDO: A conversão não é mais necessária pois as chaves já estão em minúscula
      // Agora apenas validamos se os grupos existem
      const validMuscleGroups = data.muscleGroups.filter(group => 
        Object.keys(MUSCLE_GROUPS).includes(group)
      );

      if (validMuscleGroups.length !== data.muscleGroups.length) {
        console.warn('⚠️ Alguns grupos musculares não são válidos:', data.muscleGroups);
      }

      // PAYLOAD LIMPO - apenas campos que tem valor
      const payload: any = {
        name: data.name.trim(),
        muscleGroups: validMuscleGroups, // Já em formato correto
      };

      // Adicionar campos opcionais apenas se tiverem valor
      if (data.equipment && data.equipment.trim()) {
        payload.equipment = data.equipment.trim();
      }

      if (data.instructions && data.instructions.trim()) {
        payload.instructions = data.instructions.trim();
      }

      console.log('📤 Payload final:', payload);

      const result = await authenticatedFetch('/exercises', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log('✅ Exercício criado com sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro completo:', error);
      throw error;
    }
  },

  async getAll(): Promise<Exercise[]> {
    try {
      return await authenticatedFetch('/exercises');
    } catch (error) {
      console.error('Erro ao buscar exercícios:', error);
      throw error;
    }
  },

  async getByMuscleGroups(muscleGroups: string[]): Promise<Exercise[]> {
    try {
      const params = muscleGroups.join(',');
      return await authenticatedFetch(`/exercises?muscleGroups=${params}`);
    } catch (error) {
      console.error('Erro ao buscar por grupo muscular:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Exercise> {
    try {
      return await authenticatedFetch(`/exercises/${id}`);
    } catch (error) {
      console.error('Erro ao buscar exercício:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<CreateExerciseData>): Promise<Exercise> {
    try {
      const payload: any = {};
      
      if (data.name) payload.name = data.name.trim();
      
      if (data.muscleGroups) {
        // ALTERADO: Não precisa mais converter, apenas validar
        const validMuscleGroups = data.muscleGroups.filter(group => 
          Object.keys(MUSCLE_GROUPS).includes(group)
        );
        payload.muscleGroups = validMuscleGroups;
      }
      
      if (data.equipment && data.equipment.trim()) {
        payload.equipment = data.equipment.trim();
      }
      
      if (data.instructions && data.instructions.trim()) {
        payload.instructions = data.instructions.trim();
      }
      
      return await authenticatedFetch(`/exercises/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Erro ao atualizar exercício:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await authenticatedFetch(`/exercises/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Erro ao deletar exercício:', error);
      throw error;
    }
  },

  validateExercise(data: CreateExerciseData): string[] {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length < 3) {
      errors.push('Nome deve ter pelo menos 3 caracteres');
    }

    if (!data.muscleGroups || data.muscleGroups.length === 0) {
      errors.push('Selecione pelo menos um grupo muscular');
    }

    // ADICIONADO: Validar se os grupos musculares são válidos
    const validGroups = Object.keys(MUSCLE_GROUPS);
    const invalidGroups = data.muscleGroups.filter(group => !validGroups.includes(group));
    if (invalidGroups.length > 0) {
      errors.push(`Grupos musculares inválidos: ${invalidGroups.join(', ')}`);
    }

    return errors;
  }
};