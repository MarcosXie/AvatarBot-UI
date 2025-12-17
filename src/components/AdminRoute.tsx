import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import type { JSX } from 'react';

export function AdminRoute({ children }: { children: JSX.Element }) {
    const { isAuthenticated, user, isLoading } = useAuth(); // Assumindo que seu contexto tem isLoading

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Carregando...</div>;
    }

    // Verifica Autenticação
    if (!isAuthenticated || !user) {
        return <Navigate to="/admin" replace />; // Redireciona para login de admin
    }

    const isAdmin = user.isAdmin;

    if (!isAdmin) {
        // Se logado mas não é admin, manda para dashboard comum ou login
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}