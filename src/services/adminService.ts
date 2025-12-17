import type { LoginDto } from "../types/auth"; // Reutilizando o tipo de Login existente
import api, { callApi } from "./api";

const BASE_PATH = "/api/Admin";

export const adminService = {
  // POST /api/Admin/Login
  login: async (data: LoginDto): Promise<string | undefined> => {
    return await callApi<string>(async () => await api.post(`${BASE_PATH}/Login`, data));
  },
};