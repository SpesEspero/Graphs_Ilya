import { makeAutoObservable } from "mobx";
import authApi from "../api/auth";
import type { SignInRequest, SignUpRequest } from "../api/auth";

class AuthStore {
  token: string | null = localStorage.getItem("token");
  username: string | null = localStorage.getItem("username");
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  setUsername(username: string | null) {
    this.username = username;
    if (username) {
      localStorage.setItem("username", username);
    } else {
      localStorage.removeItem("username");
    }
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }

  get isAuthenticated() {
    return !!this.token;
  }

  async signUp(data: SignUpRequest) {
    this.setLoading(true);
    this.setError(null);
    try {
      // First, try to sign up
      await authApi.signUp(data);

      // If sign up is successful, automatically sign in
      return await this.signIn({
        login: data.login,
        password: data.password,
      });
    } catch (error) {
      this.setError(
        error instanceof Error ? error.message : "Ошибка регистрации"
      );
      return false;
    } finally {
      this.setLoading(false);
    }
  }

  async signIn(data: SignInRequest) {
    this.setLoading(true);
    this.setError(null);
    try {
      const response = await authApi.signIn(data);
      this.setToken(response.token);
      this.setUsername(data.login);
      return true;
    } catch (error) {
      this.setError(error instanceof Error ? error.message : "Ошибка входа");
      return false;
    } finally {
      this.setLoading(false);
    }
  }

  async signOut() {
    if (!this.token) return;

    this.setLoading(true);
    this.setError(null);
    try {
      await authApi.signOut(this.token);
      this.setToken(null);
      this.setUsername(null);
    } catch (error) {
      this.setError(error instanceof Error ? error.message : "Ошибка выхода");
    } finally {
      this.setLoading(false);
    }
  }

  // Method for clearing auth data without API call
  // This is used when receiving 401 unauthorized errors
  logout() {
    this.setToken(null);
    this.setUsername(null);
  }
}

const authStore = new AuthStore();
export default authStore;
