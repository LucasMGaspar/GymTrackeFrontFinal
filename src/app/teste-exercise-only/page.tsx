'use client';

import { useState } from 'react';
import { exerciseService } from '@/services/exercise.service';
import { MUSCLE_GROUPS } from '@/types/exercise';

export default function TestExerciseOnlyPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkToken = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    setResult({
      type: 'token_check',
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 30)}...` : 'Nenhum',
      hasUser: !!user,
      userInfo: user ? JSON.parse(user) : null,
    });
  };

  const testDirectFetch = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Teste direto com fetch
      const response = await fetch('http://localhost:3000/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: 'Teste Direto',
          muscleGroups: ['CHEST'],
          equipment: 'Teste',
          instructions: 'Teste direto'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setResult({ type: 'direct_fetch', success: true, data });
    } catch (error: any) {
      setResult({ type: 'direct_fetch', success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testService = async () => {
    setLoading(true);
    try {
      const data = await exerciseService.create({
        name: 'Teste Service',
        muscleGroups: ['Peito'], // Em português
        equipment: 'Barra',
        instructions: 'Teste via service'
      });

      setResult({ type: 'service', success: true, data });
    } catch (error: any) {
      setResult({ type: 'service', success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testList = async () => {
    setLoading(true);
    try {
      const data = await exerciseService.getAll();
      setResult({ type: 'list', success: true, data, count: data.length });
    } catch (error: any) {
      setResult({ type: 'list', success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    setResult({ type: 'clear', message: 'Storage limpo. Faça login novamente.' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🏋️ Teste de Exercícios - Específico
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Grupos Musculares</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
            {Object.entries(MUSCLE_GROUPS).map(([key, value]) => (
              <div key={key} className="p-2 bg-gray-100 rounded text-sm">
                <strong>{key}</strong>: {value}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Testes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={checkToken}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              🔍 Verificar Token
            </button>
            
            <button
              onClick={testDirectFetch}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Testando...' : '🔗 Teste Direto (Fetch)'}
            </button>
            
            <button
              onClick={testService}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {loading ? 'Testando...' : '⚙️ Teste Service'}
            </button>
            
            <button
              onClick={testList}
              disabled={loading}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Testando...' : '📋 Listar Exercícios'}
            </button>
            
            <button
              onClick={clearStorage}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              🧹 Limpar Storage
            </button>
          </div>
        </div>

        {result && (
          <div className={`p-6 rounded-lg border ${
            result.success === false ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
          }`}>
            <h3 className="font-semibold mb-4">
              Resultado - {result.type}
            </h3>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}