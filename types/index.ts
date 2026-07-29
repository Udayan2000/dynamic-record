export type Role = "admin" | "employee";

export type Permission =
  | "view_dashboard"
  | "manage_employees"
  | "manage_templates"
  | "view_all_records"
  | "view_reports"
  | "manage_settings"
  | "upload_documents"
  | "view_own_records"
  | "manage_profile";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  department?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export type TemplateFieldType  = "text" | "textarea" | "dropdown" | "radio" | "multiselect";
export type TemplateStatus = "active" | "inactive";


export interface TemplateAccess {
    id: string;
  name: string;
  email: string;
}

export interface TemplateField {
    id: string;
  label: string;
  type: string;
  required: boolean;
  options: string[];
}

export interface CreateTemplatePayload {
  name: string;
  status: string;
  image: string;
  imageHeight: number;
  access: TemplateAccess[];
  fields: TemplateField[];
}

export interface Template {
  id: string;
  name: string;
  status: string;
  image: string;
  imageHeight: number;
  access: TemplateAccess[];
  fields: TemplateField[];
  createdAt: string;
}