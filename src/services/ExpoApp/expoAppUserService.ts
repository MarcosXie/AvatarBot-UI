import api from "../ExpoApp/expoAppApi";

const BASE_PATH = "/Api/User";

export const expoAppUserService = {
  // POST /Api/User/Login
  isValidEmail: async (email: string): Promise<boolean | undefined> => {
    return (await api.get(`${BASE_PATH}/IsValidEmail/${email}`)).data as boolean;
  },
};