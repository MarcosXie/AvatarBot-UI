// src/pages/auth/Login.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext'; 
import { userService } from '../../services/userService';
import type { LoginDto } from '../../types/auth';
import { Loader2, Smartphone } from 'lucide-react';
import { showErrorToast } from '../../components/Toast/ToastUtils';
import type { BaseError } from '../../services/api';

// Importação do QR Code
import expoAppQrCode from '../../assets/expoapp-qrcode.png';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<LoginDto>({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = await userService.login(formData);
      login(token);
      navigate('/dashboard');
    } catch (error) {
      const err = error as BaseError;
      showErrorToast(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col md:flex-row gap-8">
        
        {/* Lado Esquerdo: Formulário de Login */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Login</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <input 
                type="email" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required 
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
              <input 
                type="password" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required 
              />
              <div className="flex justify-end mt-2">
                  <Link to="/forgot-password" size-12 className="text-sm text-indigo-600 hover:underline">
                      Forgot password?
                  </Link>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Divisor Vertical (apenas em desktop) */}
        <div className="hidden md:block w-px bg-gray-200" />

        {/* Lado Direito: Seção de Cadastro via Mobile */}
        <div className="flex-1 flex flex-col items-center justify-center text-center bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300">
          <Smartphone className="text-indigo-600 mb-3" size={32} />
          <h3 className="text-lg font-bold text-gray-800 mb-2">New here?</h3>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            Registration is only available through our <strong>ExpoApp</strong> mobile application.
          </p>
          
          <div className="bg-white p-2 rounded-lg shadow-sm mb-4 border border-gray-200">
            <img 
              src={expoAppQrCode} 
              alt="Scan to Register" 
              className="w-28 h-28 md:w-32 md:h-32 object-contain"
            />
          </div>
          
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
            Scan to Download & Register
          </p>
        </div>

      </div>
    </div>
  );
}