import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmail() {
  const { id, code } = useParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('loading');
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function verify() {
      if (!id || !code) {
        setStatus('error');
        return;
      }

      try {
        // Tenta validar. Se o backend retornar 200, passa pra próxima linha.
        // Se retornar 400/500, o axios joga pro catch.
        await userService.verifyEmail(id, code);
        
        setStatus('success');
        
        setTimeout(() => {
             navigate('/login');
        }, 3000);

      } catch (error) {
        console.error("Verification failed:", error);
        setStatus('error');
      }
    }

    verify();
  }, [id, code, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm text-center">
        
        {/* ESTADO: CARREGANDO */}
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-800">Verifying Email...</h2>
            <p className="text-gray-600">Please wait while we validate your account.</p>
          </div>
        )}

        {/* ESTADO: SUCESSO */}
        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Email Verified!</h2>
            <p className="text-gray-600">
              Your account has been successfully activated.
            </p>
            <p className="text-sm text-indigo-600 font-medium animate-pulse">
              Redirecting to login...
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="mt-2 w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition"
            >
              Go to Login Now
            </button>
          </div>
        )}

        {/* ESTADO: ERRO */}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 animate-in shake duration-300">
            <div className="bg-red-100 p-3 rounded-full">
                <XCircle className="w-16 h-16 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Verification Failed</h2>
            <p className="text-gray-600">
              The link is invalid or has expired. Please try registering again or contact support.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="mt-2 w-full bg-gray-800 text-white py-2 rounded-lg font-bold hover:bg-gray-900 transition"
            >
              Back to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}