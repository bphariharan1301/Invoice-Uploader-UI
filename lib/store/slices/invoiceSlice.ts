import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Invoice } from '../../schemas/invoice.schema';
import { invoiceApi } from '../../api/client';

interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  loading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  invoices: [],
  currentInvoice: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchInvoices = createAsyncThunk(
  'invoice/fetchInvoices',
  async (_, { rejectWithValue }) => {
    try {
      const data = await invoiceApi.getAll();
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
  'invoice/uploadFile',
  async (file: File, { rejectWithValue, dispatch }) => {
    try {
      const result = await invoiceApi.uploadFile(file);
      // Refresh invoice list after upload
      dispatch(fetchInvoices());
      return result;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to upload file'
      );
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
        state.invoices = action.payload;
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
