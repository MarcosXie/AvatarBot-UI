// src/services/userService.ts
import type { ForgotPasswordDto, LoginDto, RedefinePasswordDto, RegisterDto } from "../types/auth";
import api from "./api";

const BASE_PATH = "/Api/User";

export const userService = {
  // POST /Api/User (Registro) -> Retorna o ID do usuário criado
  register: async (data: RegisterDto): Promise<string> => {
    const response = await api.post<string>(BASE_PATH, data);
    return response.data;
  },

  // POST /Api/User/Login -> Retorna o Token JWT
  login: async (data: LoginDto): Promise<string> => {
    const response = await api.post<string>(`${BASE_PATH}/Login`, data);
    return response.data;
  },

  // POST /Api/User/Verify/{id}/{code}
  verifyEmail: async (id: string, code: string): Promise<void> => {
    await api.post(`${BASE_PATH}/Verify/${id}/${code}`);
  },

  // POST /Api/User/ForgotPassword
  forgotPassword: async (data: ForgotPasswordDto): Promise<void> => {
    await api.post(`${BASE_PATH}/ForgotPassword`, data);
  },

  // POST /Api/User/RedefinePassword/{id}B
  redefinePassword: async (id: string, data: RedefinePasswordDto): Promise<void> => {
    await api.post(`${BASE_PATH}/RedefinePassword/${id}`, data);
  },
};