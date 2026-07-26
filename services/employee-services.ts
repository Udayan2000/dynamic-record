import { apiClient } from "@/services/api-client";

export interface EmployeePayload {
  employee_name: string;
  employee_email: string;
  employee_address: string;
  status: "active" | "inactive";
}

export interface GetEmployeesResponse {
  employees: EmployeePayload[];
  limit: number;
  page: number;
  total: number;
  totalPage: number;
}

export const employeeService = {
  createEmployee: async (payload: EmployeePayload) => {
    const response = await apiClient.post("/employees", payload);
    return response.data;
  },
  
  getEmployees: async (page: number = 1, limit: number = 10) => {
    const response = await apiClient.get<GetEmployeesResponse>("/employees", {
      params: { page, limit }
    });
    return response.data;
  }
};
