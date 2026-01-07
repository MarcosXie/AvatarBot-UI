
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean | string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface RedefinePasswordDto {
  password: string;
  confirmPassword: string;
  code: string;
}