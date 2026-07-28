"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/auth-services";
import { useAuthStore } from "@/store/auth-store";
import type { ForgotPasswordPayload, LoginPayload, ResetPasswordPayload } from "@/types";

export function useLogin() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
 
  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data: any) => {
      setSession(data.user, data.token);
      toast.success(`Welcome back!`); 
      router.push("/admin/dashboard");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Invalid email or password";
      toast.error(message);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authService.forgotPassword(payload),
    onSuccess: () => toast.success("Check your inbox for a reset link"),
    onError: () => toast.error("Could not send reset link. Try again."),
  });
}

export function useResetPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authService.resetPassword(payload),
    onSuccess: () => {
      toast.success("Password updated. Please sign in.");
      router.push("/login");
    },
    onError: () => toast.error("Reset link expired or invalid."),
  });
}

export function useLogout() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearSession();
      router.push("/login");
    },
  });
}
