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
import Login from './pages/auth/Login';
import BotList from './pages/BotList';
import BotRoom from './pages/BotRoom';

// Pages - Admin
import AdminLogin from './pages/admin/AdminLogin'; // Nova página
import AdminDevices from './pages/admin/AdminDevices';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import RedefinePassword from './pages/auth/RedefinePassword';

// Componente para proteger rotas de USER
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      {/* O basename garante que TUDO rode abaixo de /demo_expoapp */}
      <BrowserRouter basename="/demo_expoapp">
        <ToastContainer position="top-right" autoClose={5000} theme="colored" />

        <Routes>
          {/* Agrupador de Rotas Raiz */}
          <Route path="/">

            {/* === ROTAS PÚBLICAS === */}
            <Route path="/" element={<HomePublic isDemo={true}  isExpoApp={true}/>} />

            <Route path="login" element={<Login isExpoApp={true} />} />
            {/* <Route path="register" element={<Register />} /> */}
            <Route path=":id/:code/verify_email" element={<VerifyEmail />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path=":id/:code/redefine_password" element={<RedefinePassword />} />

            {/* === RESTANTE DAS ROTAS (USER/ADMIN) === */}
            {/* Mantenha como estão, mas sem a "/" inicial nos paths internos se preferir, 
                embora o react-router trate caminhos relativos automaticamente aqui */}

            <Route path="admin" element={<AdminLogin />} />

            <Route element={<PrivateRoute><ProtectedLayout /></PrivateRoute>}>
              <Route path="dashboard" element={<Navigate to="/bots" replace />} />
              <Route path="bots" element={<BotList isDemo={true}/>} />
            </Route>

            <Route path="room/:id" element={
              <PrivateRoute><BotRoom /></PrivateRoute>
            } />

            <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route path="admin/devices" element={<AdminDevices />} />
              <Route path="admin/dashboard" element={
                <div className="text-center mt-20">
                  <h1 className="text-2xl font-bold text-gray-800">Bem-vindo, Administrador</h1>
                </div>
              } />
            </Route>

            {/* Fallback 404 redireciona para a raiz do basename */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <BrowserRouter basename="/demo">
        <ToastContainer position="top-right" autoClose={5000} theme="colored" />

        <Routes>
          {/* Agrupador de Rotas Raiz */}
          <Route path="/">

            {/* === ROTAS PÚBLICAS === */}
            <Route path="/" element={<HomePublic isDemo={true} isExpoApp={false}/>} />

            <Route path="login" element={<Login isDemo={true} isExpoApp={false}/>} />
            {/* <Route path="register" element={<Register />} /> */}
            <Route path=":id/:code/verify_email" element={<VerifyEmail />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path=":id/:code/redefine_password" element={<RedefinePassword />} />

            {/* === RESTANTE DAS ROTAS (USER/ADMIN) === */}
            {/* Mantenha como estão, mas sem a "/" inicial nos paths internos se preferir, 
                embora o react-router trate caminhos relativos automaticamente aqui */}

            <Route path="admin" element={<AdminLogin />} />

            <Route element={<PrivateRoute><ProtectedLayout /></PrivateRoute>}>
              <Route path="dashboard" element={<Navigate to="/bots" replace />} />
              <Route path="bots" element={<BotList isDemo={true}/>} />
            </Route>

            <Route path="room/:id" element={
              <PrivateRoute><BotRoom /></PrivateRoute>
            } />

            <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route path="admin/devices" element={<AdminDevices />} />
              <Route path="admin/dashboard" element={
                <div className="text-center mt-20">
                  <h1 className="text-2xl font-bold text-gray-800">Bem-vindo, Administrador</h1>
                </div>
              } />
            </Route>

            {/* Fallback 404 redireciona para a raiz do basename */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}