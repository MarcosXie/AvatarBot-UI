// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { clearToken, getToken, setToken as saveTokenHelper } from '../helpers/UserHelper';

// Interface do Payload do Token (O que vem do C#)
interface JwtPayload {
  // Claims padrões
  sub?: string;
  exp: number;
  
  // Claims do Identity .NET (pode vir de dois jeitos, garantimos os dois)
  unique_name?: string;
  email?: string;
  name?: string; // O JwtRegisteredClaimNames.Name que colocamos no backend
  
  // Mapeamento de legado do .NET (URL Claims)
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"?: string;
}

// Interface do Usuário na Aplicação
export interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void; // Login agora só pede o token!
  logout: () => void;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Função auxiliar para decodificar o token e atualizar o estado
  const decodeAndSetUser = (accessToken: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(accessToken);
      
      // Verifica se o token expirou
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        logout();
        return;
      } 
      
      // Tenta extrair o nome de várias chaves possíveis do JWT
      const userName = decoded.name || 
                       decoded.unique_name || 
                       decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || 
                       "Usuário";

      // Tenta extrair o email
      const userEmail = decoded.email || 
                        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || 
                        "";

      setUser({
        name: userName,
        email: userEmail
      });
      setToken(accessToken);
      
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      logout();
    }
  };

  // Efeito de Inicialização (F5 na página)
  useEffect(() => {
    const storedToken = getToken();
    if (storedToken) {
      decodeAndSetUser(storedToken);
    }
  }, []);

  // Ação de Login
  const login = (newToken: string) => {
    saveTokenHelper(newToken); // Salva no LocalStorage
    decodeAndSetUser(newToken); // Atualiza estado e decodifica
  };

  // Ação de Logout
  const logout = () => {
    clearToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!token, 
      token, 
      login, 
      logout, 
      user 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};