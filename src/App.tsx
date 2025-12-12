import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedLayout from './layouts/ProtectedLayout';
import HomePublic from './pages/HomePublic';
import Login from './pages/Login';
import BotList from './pages/BotList';
import BotRoom from './pages/BotRoom';
import { AuthProvider, useAuth } from './context/authContext';
import type { JSX } from 'react';
import Register from './pages/Register';
import { ToastContainer } from 'react-toastify';

// Componente para proteger rotas
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
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />

        <Routes>
          <Route path="/" element={<HomePublic />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<PrivateRoute><ProtectedLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Navigate to="/bots" replace />} />
            <Route path="/bots" element={<BotList />} />
          </Route>

          <Route 
            path="/room/:thingCode" 
            element={
              <PrivateRoute>
                <BotRoom />
              </PrivateRoute>
            } 
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}