import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bot, LayoutDashboard } from 'lucide-react';

export default function ProtectedLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Barra Superior */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link to="/dashboard" className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                  E
                </div>
                <span className="font-bold text-xl text-gray-800">AvatarBot</span>
              </Link>

              {/* Links de Navegação */}
              <div className="hidden sm:flex sm:space-x-8">
                <Link to="/dashboard" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-indigo-500 text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/bots" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
                  My Bots
                </Link>
              </div>
            </div>

            {/* Perfil e Logout */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Olá, <strong>{user?.name}</strong></span>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Conteúdo das Páginas */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}