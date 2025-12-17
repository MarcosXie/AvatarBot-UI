import { Outlet, Link, useNavigate } from 'react-router-dom';
// 1. ADICIONEI O ÍCONE 'Bot' AQUI NA IMPORTAÇÃO
import { LogOut, ShieldCheck, LayoutDashboard, Bot } from 'lucide-react';
import { useAuth } from '../context/authContext';

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin'); // Admin volta para login de admin ao sair
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Bar Escura para diferenciar do Usuário Comum */}
      <nav className="bg-slate-900 shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              {/* Logo Admin */}
              <Link to="/admin/dashboard" className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">
                  A
                </div>
                <span className="font-bold text-xl text-white">ExpoBot <span className="text-red-500 font-mono text-sm">ADMIN</span></span>
              </Link>

              {/* Links de Navegação */}
              <div className="hidden sm:flex sm:space-x-8">
 

                {/* 2. ADICIONEI O LINK PARA DEVICES AQUI */}
                <Link 
                  to="/admin/devices" 
                  className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Bot size={18} />
                  Devices
                </Link>
                
              </div>
            </div>

            {/* Perfil Admin */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-white">{user?.name}</span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <ShieldCheck size={10} /> Administrador
                </span>
              </div>
              <div className="h-8 w-px bg-slate-700 mx-1"></div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-slate-800"
                title="Sair do Admin"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Conteúdo das Páginas Admin */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}