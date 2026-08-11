import { ApiResponse, CreateTemplatePayload, Template } from "@/types";
import { apiClient } from "@/services/api-client";

export const templatesApi = {
  template: (payload: CreateTemplatePayload) =>
    apiClient
      .post<ApiResponse<Template>>("/templates", payload)
      .then((res) => res.data),

  getTemplates: (params?: { search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    
    return apiClient
      .get<{ templates: any[], totalItems: number, currentPage: number, totalPages: number }>(`/templates?${query.toString()}`)
      .then((res) => res.data);
  },

  getTemplateById: (id: string) =>
    apiClient
      .get<{ template: Template }>(`/templates/${id}`)
      .then((res) => res.data.template),

  deleteTemplate: (id: string) =>
    apiClient
      .delete(`/templates/${id}`)
      .then((res) => res.data),

  updateTemplate: (id: string, payload: CreateTemplatePayload) =>
    apiClient
      .put<ApiResponse<Template>>(`/templates/${id}`, payload)
      .then((res) => res.data),

  toggleTemplateStatus: ({ id, status }: { id: string; status: string }) =>
    apiClient
      .patch(`/templates/${id}/status`, { status })
      .then((res) => res.data),
};

export const recordsApi = {
  createRecord: (payload: { templateId: string; data: any } | FormData) =>
    apiClient
      .post("/records", payload, payload instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined)
      .then((res) => res.data),

  getRecords: (params?: { templateId?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.templateId) query.append("templateId", params.templateId);
    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    return apiClient
      .get<{ records: any[], totalItems: number, currentPage: number, totalPages: number }>(`/records?${query.toString()}`)
      .then((res) => res.data);
  }
};