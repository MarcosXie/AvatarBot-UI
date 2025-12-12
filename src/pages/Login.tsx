// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext'; // Ajuste o nome do arquivo se for authContext
import { userService } from '../services/userService';
import type { LoginDto } from '../types/auth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<LoginDto>({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // O userService já trata erro e exibe Toast se falhar
    const token = await userService.login(formData);

    if (token) {
      // Passamos APENAS o token. O Contexto se vira para achar o nome/email dentro dele.
      login(token);
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            required 
          />
          <input 
            type="password" 
            placeholder="Senha" 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
            required 
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Autenticando...' : 'Acessar'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Não tem conta? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Registre-se</Link>
        </p>
      </div>
    </div>
  );
}