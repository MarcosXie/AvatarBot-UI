// src/services/api.ts
import axios from 'axios';
import { getToken } from '../helpers/UserHelper';
import { showErrorToast } from '../components/Toast/ToastUtils';

// Lê do .env (Vite usa import.meta.env)
const backendUrl = import.meta.env.VITE_BACKEND_API_URL || "https://localhost:7010";

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
                : error.response.data.title || error.response.data.message || "Erro desconhecido";

            const customError: BaseError = {
                message: errorMessage,
                statusCode: error.response.status
            };
            return Promise.reject(customError);
        }
        return Promise.reject(error);
    }
);

// Wrapper Genérico para Chamadas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function callApi<T>(exec: () => Promise<any>): Promise<T | undefined> {
    try {
        const response = await exec();
        // Axios retorna os dados dentro de 'data'. 
        // Se a chamada retornar apenas o ID (string) ou Token, retornamos direto.
        return response.data;
    } catch (e) {
        const error = e as BaseError;

        if (error.message) {
            showErrorToast(error.message);
        } else {
            showErrorToast("Server unexpected error!");
        }
        return undefined;
    }
}

export default api;