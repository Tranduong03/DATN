import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/authService';

export const useLogin = () => {
  return useMutation({
    mutationFn: (params: any) => authService.login(params),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (params: any) => authService.register(params),
  });
};

export const useGoogleLogin = () => {
  return useMutation({
    mutationFn: (token: string) => authService.googleLogin(token),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: any) => authService.changePassword(data),
  });
};
