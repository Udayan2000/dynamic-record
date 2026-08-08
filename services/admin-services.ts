import { apiClient } from "@/services/api-client";

export const adminApi = {
  getProfile: () =>
    apiClient
      .get("/admin/profile")
      .then((res) => res.data),

  updateGoogleDriveCredentials: (payload: { clientId: string; clientSecret: string }) =>
    apiClient
      .put("/admin/profile/google-drive", payload)
      .then((res) => res.data),
};
