import { ApiResponse, CreateTemplatePayload, Template } from "@/types";
import { apiClient } from "@/services/api-client";

export const templatesApi = {
  template: (payload: CreateTemplatePayload) =>
    apiClient
      .post<ApiResponse<Template>>("/template", payload)
      .then((res) => res.data),
};