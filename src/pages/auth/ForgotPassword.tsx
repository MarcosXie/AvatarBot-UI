// src/pages/auth/ForgotPassword.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import { Loader2, Mail, ArrowLeft, MailCheck } from 'lucide-react';
import { showErrorToast } from '../../components/Toast/ToastUtils';
import type { BaseError } from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Calls the API. Se falhar, vai pro catch.
      await userService.forgotPassword({ email });
      
      // Se chegou aqui, deu certo
      setIsSuccess(true);
      
    } catch (error) {
      const err = error as BaseError;
      showErrorToast(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm text-center animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-4 rounded-full">
                    <MailCheck size={48} className="text-green-600" />
                </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Check your email</h2>
            <p className="text-gray-600 mb-6">
                We have sent password recovery instructions to: <br/>
                <span className="font-semibold text-black">{email}</span>
            </p>
            <Link 
                to="/login"
                className="block w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
            >
                Back to Login
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <Link to="/login" className="flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to Login
        </Link>

        <div className="flex justify-center mb-4">
            <div className="bg-indigo-50 p-3 rounded-full">
                <Mail size={32} className="text-indigo-600" />
            </div>
        </div>

        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Forgot Password?</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
            Enter your email and we'll send you a link to reset your password.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required 
          />
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}