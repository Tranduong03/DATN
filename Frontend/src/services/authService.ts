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

  forgotPassword: (email: string) => {
    return axiosClient.post('/Auth/forgot-password', { email });
  },

  changePassword: (data: any) => {
    return axiosClient.put('/Auth/change-password', data);
  }
};
