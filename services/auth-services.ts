import { apiClient } from "@/services/api-client";
import type {
  ApiResponse,
  AuthTokens,
  CreateTemplatePayload,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  Template,
  User,
} from "@/types"

export const authService = {
  login: (payload: LoginPayload) =>
    apiClient
      .post<ApiResponse<{ user: User } & AuthTokens>>("/auth/login", payload)
      .then((res) => res.data),

  logout: () => apiClient.post("/auth/logout"),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiClient.post<ApiResponse<null>>("/auth/forgot-password", payload).then((res) => res.data),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient.post<ApiResponse<null>>("/auth/reset-password", payload).then((res) => res.data),

  me: () => apiClient.get<ApiResponse<User>>("/auth/me").then((res) => res.data.data),
};

