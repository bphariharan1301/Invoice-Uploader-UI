
import type { Invoice } from '@/lib/schemas/invoice.schema'

export interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  loading: boolean;
  error: string | null;
  // pagination
  page: number;
  limit: number;
  total: number;
}

export interface UploadState {
  file: File | null;
  progress: number;
  uploading: boolean;
  error: string | null;
  previewUrl: string | null;
}
