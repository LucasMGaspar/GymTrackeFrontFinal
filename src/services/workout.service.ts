import api from '@/lib/api';
import { 
  WorkoutExecution, 
  StartWorkoutData, 
  SelectExercisesData, 
  RegisterSeriesData 
} from '@/types/workout';
import { Exercise } from '@/types/exercise';

export const workoutService = {
  // Iniciar treino
  async startWorkout(data: StartWorkoutData): Promise<WorkoutExecution> {
    const response = await api.post('/workout-executions/start', data);
    return response.data;
  },

  // Obter exercícios disponíveis
  async getAvailableExercises(workoutId: string): Promise<Exercise[]> {
    const response = await api.get(`/workout-executions/${workoutId}/available-exercises`);
    return response.data;
  },

  // Selecionar exercícios
  async selectExercises(workoutId: string, data: SelectExercisesData) {
    const response = await api.post(`/workout-executions/${workoutId}/select-exercises`, data);
    return response.data;
  },

  // Definir quantas séries
  async defineSeries(workoutId: string, exerciseExecutionId: string, plannedSeries: number) {
    const response = await api.put(
      `/workout-executions/${workoutId}/exercises/${exerciseExecutionId}/series-count`,
      { plannedSeries }
    );
    return response.data;
  },

  // Registrar série
  async registerSeries(
    workoutId: string, 
    exerciseExecutionId: string, 
    seriesNumber: number, 
    data: RegisterSeriesData
  ) {
    const response = await api.post(
      `/workout-executions/${workoutId}/exercises/${exerciseExecutionId}/series/${seriesNumber}`,
      data
    );
    return response.data;
  },

  // Marcar exercício como completo
  async completeExercise(workoutId: string, exerciseExecutionId: string) {
    const response = await api.put(
      `/workout-executions/${workoutId}/exercises/${exerciseExecutionId}/complete`
    );
    return response.data;
  },

  // Finalizar treino
  async finishWorkout(workoutId: string, notes?: string) {
    const response = await api.post(`/workout-executions/${workoutId}/finish`, { notes });
    return response.data;
  },

  // Obter detalhes do treino
  async getWorkoutDetails(workoutId: string): Promise<WorkoutExecution> {
    const response = await api.get(`/workout-executions/${workoutId}`);
    return response.data;
  },

  // Listar treinos do usuário
  async getUserWorkouts(): Promise<WorkoutExecution[]> {
    const response = await api.get('/workout-executions');
    return response.data;
  },

  // Deletar treino
  async deleteWorkout(workoutId: string): Promise<void> {
    await api.delete(`/workout-executions/${workoutId}`);
  },

  // Verificar se tem treino ativo hoje
  async getActiveWorkout(): Promise<WorkoutExecution | null> {
    try {
      const workouts = await this.getUserWorkouts();
      const today = new Date().toISOString().split('T')[0];
      
      // Procurar treino de hoje que está em progresso
      const activeWorkout = workouts.find(w => 
        w.status === 'IN_PROGRESS' && 
        new Date(w.date).toISOString().split('T')[0] === today
      );
      
      return activeWorkout || null;
    } catch {
      return null;
    }
  },

  // Verificar se já tem treino hoje
  async getTodayWorkout(): Promise<WorkoutExecution | null> {
    try {
      const workouts = await this.getUserWorkouts();
      const today = new Date().toISOString().split('T')[0];
      
      return workouts.find(w => 
        new Date(w.date).toISOString().split('T')[0] === today
      ) || null;
    } catch {
      return null;
    }
  },
};