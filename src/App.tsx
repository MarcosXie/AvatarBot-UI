import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { JSX } from 'react';
import { ToastContainer } from 'react-toastify';

// Layouts & Contexts
import ProtectedLayout from './layouts/ProtectedLayout';
import AdminLayout from './layouts/AdminLayout'; // Novo Layout
import { AuthProvider, useAuth } from './context/authContext';
import { AdminRoute } from './components/AdminRoute'; // Novo componente

// Pages - Public / User
import HomePublic from './pages/HomePublic';
import Login from './pages/Login';
import Register from './pages/Register';
import BotList from './pages/BotList';
import BotRoom from './pages/BotRoom';

// Pages - Admin
import AdminLogin from './pages/AdminLogin'; // Nova página

// Componente para proteger rotas de USER
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          theme="colored"
        />

        <Routes>
          {/* === ROTAS PÚBLICAS === */}
          <Route path="/" element={<HomePublic />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* === ROTA DE LOGIN ADMIN (Pública, mas separada) === */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* === ÁREA DO USUÁRIO (Protegida) === */}
          <Route element={<PrivateRoute><ProtectedLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Navigate to="/bots" replace />} />
            <Route path="/bots" element={<BotList />} />
          </Route>

          {/* Rota específica da sala (User) */}
          <Route 
            path="/room/:id" 
            element={
              <PrivateRoute>
                <BotRoom />
              </PrivateRoute>
            } 
          />

          {/* === ÁREA ADMINISTRATIVA (Protegida por Claim) === */}
          <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            {/* Redireciona raiz do admin para dashboard */}
            <Route path="/admin/dashboard" element={
                // Crie um componente AdminDashboard simples depois
                <div className="text-center mt-20">
                    <h1 className="text-2xl font-bold text-gray-800">Bem-vindo, Administrador</h1>
                    <p>Selecione uma opção no menu.</p>
                </div>
            } />
            
            {/* Adicione outras rotas admin aqui: */}
            {/* <Route path="/admin/users" element={<AdminUsersList />} /> */}
          </Route>

          {/* Fallback 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}