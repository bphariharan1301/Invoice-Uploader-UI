import axios from "axios";
import type { Invoice } from "../schemas/invoice.schema";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here in the future
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    if (error.response) {
      // Server responded with error status
      console.error("API Error:", error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error("Network Error:", error.message);
    } else {
      // Something else happened
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// API Methods
export const invoiceApi = {
  // Upload invoice file
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<{ id: string | number; message: string }>(
      "/api/invoices/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Get all invoices
  getAll: async () => {
    const response = await apiClient.get<Invoice[]>("/api/invoices");
    return response.data;
  },

  // Get single invoice by ID
  getById: async (id: string | number) => {
    const response = await apiClient.get<Invoice>(`/api/invoices/${id}`);
    return response.data;
  },

  // Update invoice
  update: async (id: string | number, data: Partial<Invoice>) => {
    const response = await apiClient.put<Invoice>(`/api/invoices/${id}`, data);
    return response.data;
  },

  // Delete invoice
  delete: async (id: string | number) => {
    const response = await apiClient.delete<{ message: string; id: string | number }>(
      `/api/invoices/${id}`
    );
    return response.data;
  },

  // Trigger extraction
  extract: async (id: string | number) => {
    const response = await apiClient.post<{ message: string; invoice: Invoice }>(
      `/api/invoices/${id}/extract`
    );
    return response.data;
  },
};
