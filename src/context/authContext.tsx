import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { clearToken, getToken, setToken as saveTokenHelper } from '../helpers/UserHelper';

// ... (Interfaces JwtPayload e User continuam iguais) ...
interface JwtPayload {
  id: string;
  sub?: string;
  exp: number;
  unique_name?: string;
  email?: string;
  name?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  user: User | null;
  isLoading: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  // === NOVO ESTADO: Começa true para bloquear a renderização inicial ===
  const [isLoading, setIsLoading] = useState(true); 

  const decodeAndSetUser = (accessToken: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(accessToken);
      
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        logout();
        return;
      }

      const userId = decoded.id || "";
      const userName = decoded.name || 
                       decoded.unique_name || 
                       decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || 
                       "Usuário";
      const userEmail = decoded.email || 
                        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || 
                        "";

      setUser({ id: userId, name: userName, email: userEmail });
      setToken(accessToken);
      
    } catch (error) {
      console.error("Token inválido", error);
      logout();
    }
  };

  useEffect(() => {
    const storedToken = getToken();
    
    if (storedToken) {
      decodeAndSetUser(storedToken);
    }
    
    // === O PULO DO GATO ===
    // Avisamos que o carregamento terminou, independente se achou token ou não
    setIsLoading(false); 
  }, []);

  const login = (newToken: string) => {
    saveTokenHelper(newToken);
    decodeAndSetUser(newToken);
  };

  const logout = () => {
    clearToken();
    setToken(null);
    setUser(null);
  };

  // === BLOQUEIO DE RENDERIZAÇÃO ===
  // Se estiver carregando, mostra um spinner ou tela branca
  // Isso impede que o PrivateRoute redirecione antes da hora
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 font-medium">Carregando sessão...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!token, 
      token, 
      login, 
      logout, 
      user,
      isLoading 
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