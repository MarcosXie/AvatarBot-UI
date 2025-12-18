import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/authContext';

export default function ProtectedLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Verifica se a rota atual é a de bots para destacar o link
  const isBotsActive = location.pathname.includes('/bots') || location.pathname.includes('/dashboard');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link to="/bots" className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                  E
                </div>
                <span className="font-bold text-xl text-gray-800">ExpoBot</span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden sm:flex sm:space-x-8">
                <Link 
                  to="/bots" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isBotsActive 
                      ? 'border-indigo-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <LayoutDashboard size={18} className="mr-2" />
                  My Devices
                </Link>
              </div>
            </div>

            {/* Profile & Logout */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Hello, <strong>{user?.name}</strong>
              </span>
              <div className="h-6 w-px bg-gray-300 mx-1"></div>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-gray-100"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}