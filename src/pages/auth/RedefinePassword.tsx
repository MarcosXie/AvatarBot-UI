import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { showErrorToast, showSuccessToast } from '../../components/Toast/ToastUtils';
import { Loader2, LockKeyhole } from 'lucide-react';
import type { BaseError } from '../../services/api';
// Importamos a interface de erro para tipagem (opcional, ajuda no autocomplete)

export default function RedefinePassword() {
  const { id, code } = useParams(); 
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !code) {
        showErrorToast("Invalid link. Missing parameters.");
        return;
    }

    if (password !== confirmPassword) {
        showErrorToast("Passwords do not match.");
        return;
    }

    if (password.length < 4) {
        showErrorToast("Password must be at least 4 characters.");
        return;
    }

    setIsLoading(true);

    try {
        // Agora a chamada lança erro se falhar, então não retorna 'success' booleano
        await userService.redefinePassword(id, {
            password,
            confirmPassword,
            code
        });

        // Se chegou aqui, funcionou
        showSuccessToast("Password reset successfully!");
        navigate('/login');

    } catch (error) {
        const err = error as BaseError;
        // Exibe a mensagem vinda do backend ou uma genérica
        showErrorToast(err.message || "Failed to reset password.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        
        <div className="flex justify-center mb-4">
            <div className="bg-indigo-50 p-3 rounded-full">
                <LockKeyhole size={32} className="text-indigo-600" />
            </div>
        </div>

        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Reset Password</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
            Please enter your new password below.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password" 
            placeholder="New Password" 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required 
          />

          <input 
            type="password" 
            placeholder="Confirm New Password" 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required 
          />
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}