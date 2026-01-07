// src/pages/auth/Login.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext'; 
import { userService } from '../../services/userService';
import type { LoginDto } from '../../types/auth';
import { Loader2, Smartphone, Apple, QrCode } from 'lucide-react'; 
import { showErrorToast } from '../../components/Toast/ToastUtils';
import type { BaseError } from '../../services/api';

import expoAppQrCode from '../../assets/expoapp-qrcode.png';

interface HomePublicProps {
  isDemo?: boolean;
  isExpoApp?: boolean;
}

export default function Login({ isExpoApp = false, isDemo = false }: HomePublicProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<LoginDto>({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Lógica de login extraída para ser usada tanto pelo formulário quanto pelo efeito automático
  const performLogin = useCallback(async (credentials: LoginDto) => {
    setIsLoading(true);
    try {
      const token = await userService.login(credentials);
      login(token);
      navigate('/dashboard');
    } catch (error) {
      const err = error as BaseError;
      showErrorToast(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  }, [login, navigate]);

  // Efeito para Login Automático (Modo Demo)
  // Só executa se for demo E NÃO for a versão app da feira
  useEffect(() => {
    if (isDemo && !isExpoApp) {
      const demoCredentials = { 
        email: 'expobot-demo@exposoft.com', 
        password: '1234' 
      };
      
      // Preenche visualmente o formulário
      setFormData(demoCredentials);
      
      // Executa a requisição automaticamente
      performLogin(demoCredentials);
    }
  }, [isDemo, isExpoApp, performLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      {/* Ajuste dinâmico da largura */}
      <div className={`bg-white rounded-3xl shadow-2xl w-full overflow-hidden flex flex-col md:flex-row 
        ${isExpoApp ? 'max-w-3xl' : 'max-w-md'}`}>
        
        {/* Lado Esquerdo: Formulário de Login */}
        <div className={`p-10 md:p-12 ${isExpoApp ? 'flex-[1.2]' : 'w-full'}`}>
          <h2 className="text-3xl font-extrabold mb-8 text-gray-900 tracking-tight text-center md:text-left">
            {isDemo && !isExpoApp ? 'Demo Login...' : 'Login'}
          </h2>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Email Address</label>
              <input 
                type="email" 
                placeholder="name@company.com" 
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50 focus:bg-white"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50 focus:bg-white"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex justify-center items-center gap-3 mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Lado Direito: Só exibe se isExpoApp for true */}
        {isExpoApp && (
          <div className="flex-1 bg-slate-50 p-10 md:p-12 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 animate-in fade-in slide-in-from-right duration-500">
            <div className="bg-indigo-100 p-3 rounded-2xl mb-4">
              <QrCode className="text-indigo-600" size={32} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">New to ExpoBot?</h3>
            <p className="text-sm text-gray-500 mb-8 text-center leading-relaxed">
              Scan the codes below to download our app and create your account securely.
            </p>
            
            <div className="grid grid-cols-2 gap-6 w-full max-w-[280px]">
              {/* Android QR */}
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-white border border-gray-200 rounded-2xl shadow-md hover:scale-105 transition-transform">
                  <img src={expoAppQrCode} alt="Android QR" className="w-28 h-28 object-contain" />
                </div>
                <div className="flex items-center gap-2 text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                  <Smartphone size={14} className="text-green-600" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Android</span>
                </div>
              </div>

              {/* iOS QR */}
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-white border border-gray-200 rounded-2xl shadow-md hover:scale-105 transition-transform">
                  <img src={expoAppQrCode} alt="iOS QR" className="w-28 h-28 object-contain" />
                </div>
                <div className="flex items-center gap-2 text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                  <Apple size={14} className="text-gray-900" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">iOS</span>
                </div>
              </div>
            </div>

            <p className="mt-10 text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em]">
              Available on App Store & Play Store
            </p>
          </div>
        )}
      </div>
    </div>
  );
}