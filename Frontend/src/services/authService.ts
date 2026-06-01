import axiosClient from '../api/axiosClient';

export const authService = {
  login: (data: any) => {
    return axiosClient.post('/Auth/login', data);
  },
  
  register: (data: any) => {
    return axiosClient.post('/Auth/register', data);
  },
  
  googleLogin: (token: string) => {
    return axiosClient.post('/Auth/google-login', { token });
  },

  forgotPassword: (data: { email?: string; phone?: string }) => {
    return axiosClient.post('/Auth/forgot-password', data);
  },

  changePassword: (data: any) => {
    return axiosClient.put('/Auth/change-password', data);
  }
};
