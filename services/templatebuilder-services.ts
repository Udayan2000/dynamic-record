import { ApiResponse, CreateTemplatePayload, Template } from "@/types";
import { apiClient } from "@/services/api-client";

export const templatesApi = {
  template: (payload: CreateTemplatePayload) =>
    apiClient
      .post<ApiResponse<Template>>("/templates", payload)
      .then((res) => res.data),

  getTemplates: () =>
    apiClient
      .get<{ templates: any[] }>("/templates")
      .then((res) => res.data.templates),
};