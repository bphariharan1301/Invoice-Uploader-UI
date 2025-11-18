import { z } from "zod";

// Line Item Schema
export const LineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0, "Quantity must be positive").or(z.string().transform(Number)),
  unit_price: z.number().min(0, "Unit price must be positive").or(z.string().transform(Number)),
  line_total: z.number().min(0).or(z.string().transform(Number)),
});

// Invoice Schema
export const InvoiceSchema = z.object({
  id: z.string().or(z.number()).optional(),
  supplier_name: z.string().min(1, "Supplier name is required").max(255),
  invoice_number: z.string().min(1, "Invoice number is required").max(100),
  invoice_date: z.string().optional().nullable(),
  currency: z.string().default("USD").optional(),
  subtotal: z.number().min(0).or(z.string().transform(Number)),
  total: z.number().min(0).or(z.string().transform(Number)),
  status: z.enum(["UPLOADED", "EXTRACTED", "NEEDS_REVIEW", "SAVED"]).optional(),
  line_items: z.array(LineItemSchema).optional().default([]),
  file_path: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Upload Schema
export const UploadFileSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, "File size must be less than 10MB")
    .refine(
      (file) => ["application/pdf", "image/png", "image/jpeg"].includes(file.type),
      "Only PDF, PNG, and JPEG files are allowed"
    ),
});

// Types
export type LineItem = z.infer<typeof LineItemSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type UploadFile = z.infer<typeof UploadFileSchema>;

// Validation helpers
export const validateInvoice = (data: unknown) => {
  return InvoiceSchema.safeParse(data);
};

export const validateLineItem = (data: unknown) => {
  return LineItemSchema.safeParse(data);
};

export const validateUploadFile = (data: unknown) => {
  return UploadFileSchema.safeParse(data);
};
