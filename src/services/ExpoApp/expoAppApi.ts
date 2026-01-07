// src/services/api.ts
import axios from 'axios';
import { getToken } from '../../helpers/UserHelper';

// Lê do .env (Vite usa import.meta.env)
const backendUrl = import.meta.env.VITE_EXPOAPP_BACKEND_API_URL || "https://localhost:7010";

export interface BaseError {
    message: string;
    statusCode: number;
}

const api = axios.create({
    baseURL: backendUrl,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor de Requisição (Anexa o Token)
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de Resposta (Trata Erros)
api.interceptors.response.use(
    response => response,
    error => {
        // Tenta normalizar o erro vindo do backend .NET
        if (error.response && error.response.data) {
            // Backend às vezes manda string pura no body ou um objeto ProblemDetails
            const errorMessage = typeof error.response.data === 'string' 
                ? error.response.data 
                : error.response.data.title || error.response.data.Message || "Erro desconhecido";

            const customError: BaseError = {
                message: errorMessage,
                statusCode: error.response.status
            };
            return Promise.reject(customError);
        }
        return Promise.reject(error);
    }
);


export default api;