import apiClient from "./axios";

export interface SignUpRequest {
  login: string;
  name: string;
  password: string;
}

export interface SignUpResponse {
  successful: boolean;
  login: string;
  name: string;
}

export interface SignInRequest {
  login: string;
  password: string;
}

export interface SignInResponse {
  successful: boolean;
  token: string;
}

export interface SignOutResponse {
  successful: boolean;
}

const authApi = {
  signUp: async (data: SignUpRequest): Promise<SignUpResponse> => {
    const response = await apiClient.post(`/auth/sign-up`, data);
    return response.data;
  },

  signIn: async (data: SignInRequest): Promise<SignInResponse> => {
    const response = await apiClient.post(`/auth/sign-in`, data);
    return response.data;
  },

  signOut: async (token: string): Promise<SignOutResponse> => {
    const response = await apiClient.get(`/auth/sign-out?token=${token}`);
    return response.data;
  },
};

export default authApi;
