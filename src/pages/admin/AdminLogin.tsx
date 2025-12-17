import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/authContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Função login do contexto que salva o token
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Chama API de Login de Admin
      const token = await adminService.login(formData);
      
      if (token) {
        // 2. Salva no contexto (decodifica o token e atualiza estado)
        login(token); 
        
        // 3. Redireciona para área admin
        toast.success("Acesso administrativo concedido.");
        navigate('/admin/devices');
      }
    } catch (error) {
      console.error(error);
      // O toast de erro já é tratado no adminService/api call
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
        
        {/* Header */}
        <div className="bg-slate-950 p-6 text-center border-b border-slate-700">
          <div className="mx-auto w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
            <ShieldCheck size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Portal Administrativo</h2>
          <p className="text-slate-400 text-sm mt-2">Acesso restrito a pessoal autorizado</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">E-mail Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
              <input
                type="email"
                required
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                placeholder="admin@expobot.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Senha de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
              <input
                type="password"
                required
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Acessar Painel'}
          </button>
        </form>
        
        <div className="bg-slate-950 p-4 text-center">
            <button 
                onClick={() => navigate('/login')}
                className="text-xs text-slate-500 hover:text-slate-300 underline"
            >
                Voltar para Login de Usuário
            </button>
        </div>
      </div>
    </div>
  );
}