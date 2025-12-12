
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(); // Simula login
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg" required />
          <input type="password" placeholder="Senha" className="w-full p-3 border rounded-lg" required />
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">Acessar</button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Não tem conta? <Link to="/register" className="text-indigo-600 font-bold">Registre-se</Link>
        </p>
      </div>
    </div>
  );
}