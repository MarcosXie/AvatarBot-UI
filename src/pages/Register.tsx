// src/pages/Register.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '../services/userService';
import { showSuccessToast, showErrorToast } from '../components/Toast/ToastUtils'; // Importe os toasts
import type { RegisterDto } from '../types/auth';

export default function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<RegisterDto>({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação no front
    if (formData.password !== formData.confirmPassword) {
      showErrorToast('As senhas não conferem.'); // Toast bonito de erro
      return;
    }

    setIsLoading(true);

    // O userService usa callApi internamente.
    // Se der erro (500, 400), ele mostra o Toast e retorna undefined.
    // Se der sucesso, retorna o ID (string).
    const result = await userService.register(formData);

    setIsLoading(false);

    // Se result for undefined, significa que falhou. Paramos aqui.
    if (!result) return; 

    // Se chegou aqui, foi sucesso!
    showSuccessToast("Conta criada com sucesso! Faça login."); // Toast bonito de sucesso
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Criar Conta</h2>
        
        {/* Removemos a div de erro vermelha, pois o Toast vai cuidar disso */}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Nome Completo" 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required 
          />
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            required 
          />
          <input 
            type="password" 
            placeholder="Senha" 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
            required 
          />
          <input 
            type="password" 
            placeholder="Confirmar Senha" 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.confirmPassword}
            onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
            required 
          />
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Registrando...
              </span>
            ) : 'Criar Conta'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Já tem conta? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Faça Login</Link>
        </p>
      </div>
    </div>
  );
}