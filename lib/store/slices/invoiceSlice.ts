import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { invoiceApi } from '../../api/client';
import { InvoiceState } from '@/constants';
import type { Invoice } from '@/lib/schemas/invoice.schema'
import { apiUploadFile, apiTriggerExtract } from '@/lib/api/invoices';

const initialState: InvoiceState = {
  invoices: [],
  currentInvoice: null,
  loading: false,
  error: null,
  page: 1,
  limit: 25,
  total: 0,
};

// Async Thunks
export const fetchInvoices = createAsyncThunk(
  'invoice/fetchInvoices',
  async (
    params: { page?: number; limit?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const data = await invoiceApi.getAll(params);
      console.log('Thunk Recieved data: ', data);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to fetch invoices'
      );
    }
  }
);

export const fetchInvoiceById = createAsyncThunk(
  'invoice/fetchInvoiceById',
  async (id: string | number, { rejectWithValue }) => {
    try {
      const data = await invoiceApi.getById(id);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to fetch invoice'
      );
    }
  }
);

export const updateInvoice = createAsyncThunk(
  'invoice/updateInvoice',
  async (
    { id, data }: { id: string | number; data: Partial<Invoice> },
    { rejectWithValue }
  ) => {
    try {
      const updated = await invoiceApi.update(id, data);
      return updated;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to update invoice'
      );
    }
  }
);

export const deleteInvoice = createAsyncThunk(
  'invoice/deleteInvoice',
  async (id: string | number, { rejectWithValue }) => {
    try {
      await invoiceApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to delete invoice'
      );
    }
  }
);

export const uploadFile = createAsyncThunk(
  "invoice/uploadFile",
  async (file: File, { rejectWithValue }) => {
    try {
      // 1) Upload
      const uploadResult = await invoiceApi.uploadFile(file);

      const invoiceId =
        uploadResult?.id ??
        null;

      if (!invoiceId) {
        return rejectWithValue({
          message: "Upload succeeded but no invoice ID returned from server.",
        });
      }

      // 2) BLOCKING extraction
      let extractResult;
      try {
        extractResult = await invoiceApi.extract(invoiceId);
      } catch (err: any) {
        return rejectWithValue({
          message: err?.response?.data || err?.message || "Extraction failed",
          upload: uploadResult,
        });
      }

      // 3) Final consistent return shape
      return {
        id: invoiceId,
        upload: uploadResult,
        extract: extractResult,
      };
    } catch (err: any) {
      return rejectWithValue({
        message: err?.response?.data || err?.message || "Upload failed",
      });
    }
  }
);

// Slice
const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    setCurrentInvoice: (state, action: PayloadAction<Invoice | null>) => {
      state.currentInvoice = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Invoices
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        // Normalize payload: API may return either an array or a paginated object { page, limit, total, invoices }
        const payload: any = action.payload;
        if (Array.isArray(payload)) {
          state.invoices = payload as Invoice[];
          // leave pagination defaults
        } else if (payload && Array.isArray(payload.invoices)) {
          state.invoices = payload.invoices as Invoice[];
          state.page = payload.page ?? state.page;
          state.limit = payload.limit ?? state.limit;
          state.total = payload.total ?? state.total;
        } else {
          state.invoices = [];
        }
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Invoice By ID
    builder
      .addCase(fetchInvoiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentInvoice = null;
      });

    // Update Invoice
    builder
      .addCase(updateInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload;
        // Update in list
        const index = state.invoices.findIndex((inv) => inv.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Invoice
    builder
      .addCase(deleteInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = state.invoices.filter((inv) => inv.id !== action.payload);
        if (state.currentInvoice?.id === action.payload) {
          state.currentInvoice = null;
        }
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Upload File
    builder
      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentInvoice, clearError, reset } = invoiceSlice.actions;
export default invoiceSlice.reducer;
