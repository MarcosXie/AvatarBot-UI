// src/services/userService.ts
import type { LoginDto, RegisterDto } from "../types/auth";
import api, { callApi } from "./api";

const BASE_PATH = "/Api/User";

export const userService = {
  // POST /Api/User (Registro)
  register: async (data: RegisterDto): Promise<string | undefined> => {
    // callApi já trata o try/catch e exibe o toast de erro
    return await callApi<string>(async () => await api.post(BASE_PATH, data));
  },

  // POST /Api/User/Login
  login: async (data: LoginDto): Promise<string | undefined> => {
    return await callApi<string>(async () => await api.post(`${BASE_PATH}/Login`, data));
  },
};