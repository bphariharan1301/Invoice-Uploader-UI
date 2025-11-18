This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Frontend Integration Guide

## State Management & Validation Setup

This guide covers the integration of Zustand (state management) and Zod (validation) with the Invoice Uploader frontend.

## 📦 Installation

```bash
cd Invoice-Uploader-UI
npm install
```

This will install:

- `zustand` - Lightweight state management
- `zod` - TypeScript-first schema validation
- `axios` - HTTP client for API calls

## 🗂️ Project Structure

```
lib/
├── api/
│   └── client.ts          # API client and endpoints
├── schemas/
│   └── invoice.schema.ts  # Zod validation schemas
├── store/
│   ├── invoiceStore.ts    # Invoice state management
│   └── uploadStore.ts     # Upload state management
└── hooks/
    └── useInvoices.ts     # Custom React hooks
```

## 🔧 Configuration

### 1. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 2. API Client (`lib/api/client.ts`)

Configured with:

- Base URL from environment
- Request/response interceptors
- Error handling
- 30-second timeout

## 📝 Zod Schemas

### Invoice Schema

```typescript
import { InvoiceSchema, validateInvoice } from "@/lib/schemas/invoice.schema";

// Validate invoice data
const result = validateInvoice(data);
if (result.success) {
	// Data is valid: result.data
} else {
	// Validation errors: result.error
}
```

### Line Item Schema

```typescript
import { LineItemSchema, validateLineItem } from "@/lib/schemas/invoice.schema";

const result = validateLineItem(item);
```

### Upload File Schema

```typescript
import {
	UploadFileSchema,
	validateUploadFile,
} from "@/lib/schemas/invoice.schema";

const result = validateUploadFile({ file });
```

## 🏪 Redux Store

### Using Redux Store

```typescript
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
	fetchInvoices,
	updateInvoice,
	deleteInvoice,
} from "@/lib/store/slices/invoiceSlice";

function MyComponent() {
	const dispatch = useAppDispatch();
	const { invoices, currentInvoice, loading, error } = useAppSelector(
		(state) => state.invoice
	);

	// Fetch invoices
	useEffect(() => {
		dispatch(fetchInvoices());
	}, [dispatch]);

	// Update invoice
	const handleUpdate = async (id: string, data: any) => {
		await dispatch(updateInvoice({ id, data })).unwrap();
	};

	// Delete invoice
	const handleDelete = async (id: string) => {
		await dispatch(deleteInvoice(id)).unwrap();
	};
}
```

### Upload State

```typescript
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
	setFile,
	setProgress,
	setError,
	reset,
} from "@/lib/store/slices/uploadSlice";

function UploadComponent() {
	const dispatch = useAppDispatch();
	const { file, progress, uploading, error, previewUrl } = useAppSelector(
		(state) => state.upload
	);

	// Set file
	dispatch(setFile(selectedFile));

	// Set progress
	dispatch(setProgress(50));

	// Reset state
	dispatch(reset());
}
```

## 🎣 Custom Hooks

### useInvoices Hook

```typescript
import { useInvoices } from "@/lib/hooks/useInvoices";

function InvoiceList() {
	const {
		invoices, // Invoice[]
		loading, // boolean
		error, // string | null
		refetch, // () => Promise<void>
		deleteInvoice, // (id) => Promise<void>
		clearError, // () => void
	} = useInvoices();

	// Automatically fetches invoices on mount
}
```

### useInvoice Hook

```typescript
import { useInvoice } from "@/lib/hooks/useInvoices";

function InvoiceDetail({ id }: { id: string }) {
	const {
		invoice, // Invoice | null
		loading, // boolean
		error, // string | null
		updateInvoice, // (data) => Promise<void>
		refetch, // () => Promise<void>
		clearError, // () => void
	} = useInvoice(id);

	// Automatically fetches invoice on mount
}
```

## 🔄 Usage Examples

### 1. Upload File with Validation

```typescript
"use client";
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { uploadFile, clearError } from '@/lib/store/slices/invoiceSlice';
import { validateUploadFile } from '@/lib/schemas/invoice.schema';

function UploadCard() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.invoice);

  const handleUpload = async (file: File) => {
    // Validate file
    const validation = validateUploadFile({ file });
    if (!validation.success) {
      console.error(validation.error.errors);
      return;
    }

    try {
      const result = await dispatch(uploadFile(file)).unwrap();
      window.location.href = \`/invoices/\${result.id}\`;
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      {/* Your upload UI */}
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

### 2. Update Invoice with Validation

```typescript
"use client";
import { useInvoice } from "@/lib/hooks/useInvoices";
import { validateInvoice } from "@/lib/schemas/invoice.schema";

function InvoiceForm({ id }: { id: string }) {
	const { invoice, updateInvoice, loading, error } = useInvoice(id);

	const handleSave = async (formData: any) => {
		// Validate data
		const validation = validateInvoice(formData);
		if (!validation.success) {
			console.error(validation.error.errors);
			return;
		}

		try {
			await updateInvoice(validation.data);
			alert("Invoice saved successfully!");
		} catch (err) {
			console.error("Save failed:", err);
		}
	};

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;
	if (!invoice) return <div>Invoice not found</div>;

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				handleSave(invoice);
			}}
		>
			{/* Your form fields */}
		</form>
	);
}
```

### 3. List Invoices

```typescript
"use client";
import { useInvoices } from "@/lib/hooks/useInvoices";

function InvoiceList() {
	const { invoices, loading, error, deleteInvoice } = useInvoices();

	const handleDelete = async (id: string) => {
		if (confirm("Delete this invoice?")) {
			try {
				await deleteInvoice(id);
				alert("Invoice deleted!");
			} catch (err) {
				console.error("Delete failed:", err);
			}
		}
	};

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<div>
			{invoices.map((invoice) => (
				<div key={invoice.id}>
					<h3>{invoice.supplier_name}</h3>
					<p>{invoice.invoice_number}</p>
					<button onClick={() => handleDelete(invoice.id!)}>Delete</button>
				</div>
			))}
		</div>
	);
}
```

## 🛠️ API Methods

Available through `invoiceApi`:

```typescript
import { invoiceApi } from "@/lib/api/client";

// Upload file
await invoiceApi.uploadFile(file);

// Get all invoices
await invoiceApi.getAll();

// Get single invoice
await invoiceApi.getById(id);

// Update invoice
await invoiceApi.update(id, data);

// Delete invoice
await invoiceApi.delete(id);

// Trigger extraction
await invoiceApi.extract(id);
```

## 🎯 Best Practices

1. **Always validate user input** with Zod schemas before sending to API
2. **Use custom hooks** (`useInvoices`, `useInvoice`) for common patterns
3. **Handle errors** gracefully with try/catch blocks
4. **Clear errors** when appropriate using `clearError()`
5. **Use TypeScript types** exported from schemas for type safety

## 🔍 TypeScript Types

```typescript
import type { Invoice, LineItem } from "@/lib/schemas/invoice.schema";

const invoice: Invoice = {
	supplier_name: "Acme Inc.",
	invoice_number: "INV-001",
	// ... TypeScript will ensure all required fields
};
```

## 🚀 Next Steps

1. **Install dependencies**: `npm install`
2. **Start backend**: `cd ../Invoice-Uploader-Backend && npm run dev`
3. **Start frontend**: `cd ../Invoice-Uploader-UI && npm run dev`
4. **Update components** to use Zustand stores and Zod validation
5. **Test the integration** with real API calls

## 📚 Additional Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Redux Documentation](https://react-redux.js.org/)
- [Zod Documentation](https://zod.dev/)
- [Axios Documentation](https://axios-http.com/)

# Redux Migration Summary

## Overview

All UI components have been successfully migrated from local state and direct fetch calls to use Redux Toolkit for centralized state management.

## Components Updated

### 1. **UploadCard.tsx**

**Before:**

- Local `UploadState` with useState
- Direct fetch to `/api/invoices/upload`
- Manual file validation in component

**After:**

- Uses `useAppDispatch` and `useAppSelector` hooks
- Calls `uploadFile` async thunk from invoiceSlice
- Zod validation with `validateUploadFile` before dispatch
- Progress tracking with local state (UI-only concern)
- Error handling via Redux state

**Key Changes:**

```typescript
// Redux hooks
const dispatch = useAppDispatch();
const { loading, error } = useAppSelector((state) => state.invoice);

// Zod validation
const validation = validateUploadFile({ file: selectedFile });

// Upload via Redux thunk
await dispatch(uploadFile(file)).unwrap();
```

---

### 2. **InvoiceDetailForm.tsx**

**Before:**

- Local `invoice` state with useState
- Direct PUT fetch to `/api/invoices/:id`
- Local `saving` state

**After:**

- Redux `currentInvoice` from state (passed as prop)
- `updateInvoice` async thunk with `{id, data}` payload
- Zod validation with `validateInvoice` before dispatch
- Loading state from Redux

**Key Changes:**

```typescript
// Redux hooks
const dispatch = useAppDispatch();
const { loading } = useAppSelector((state) => state.invoice);

// Zod validation
const validation = validateInvoice(invoice);

// Update via Redux thunk
await dispatch(
	updateInvoice({ id: invoice.id, data: validation.data })
).unwrap();
```

---

### 3. **app/page.tsx** (Home)

**Before:**

- Hardcoded `sampleInvoices` array
- No real API calls
- Static data

**After:**

- Uses `useInvoices()` custom hook
- Auto-fetches on mount via `fetchInvoices` thunk
- Loading spinner during fetch
- Error alert from Redux state
- Maps Redux `invoices` array to InvoiceCard components

**Key Changes:**

```typescript
// Custom hook with auto-fetch
const { invoices, loading, error } = useInvoices();

// Conditional rendering
{
	loading ? (
		<CircularProgress />
	) : error ? (
		<Alert>{error}</Alert>
	) : (
		invoices.map((inv) => <InvoiceCard key={inv.id} invoice={inv} />)
	);
}
```

---

### 4. **app/invoices/[id]/page.tsx** (Detail Page)

**Before:**

- Local state for `loading`, `invoice`, `error`
- useEffect with direct fetch
- Fallback demo data on 404

**After:**

- Uses `useInvoice(id)` custom hook
- Auto-fetches via `fetchInvoiceById` thunk
- All state from Redux (loading, error, invoice)
- No fallback data needed

**Key Changes:**

```typescript
// Custom hook with auto-fetch by ID
const { invoice, loading, error } = useInvoice(id);

// Simplified rendering
{
	loading ? (
		<CircularProgress />
	) : error ? (
		<Alert>{error}</Alert>
	) : !invoice ? (
		<Alert>Not found</Alert>
	) : (
		<InvoiceDetailForm invoice={invoice} />
	);
}
```

---

## Redux Store Structure

### State Shape

```typescript
{
  invoice: {
    invoices: Invoice[],      // All invoices
    currentInvoice: Invoice | null,  // Selected invoice
    loading: boolean,         // API request in progress
    error: string | null      // Error message
  }
}
```

### Async Thunks Used

1. **uploadFile(file: File)** - Upload new invoice
2. **fetchInvoices()** - Get all invoices
3. **fetchInvoiceById(id: string)** - Get single invoice
4. **updateInvoice({id, data})** - Update invoice
5. **deleteInvoice(id: string)** - Delete invoice

### Custom Hooks

- **useInvoices()** - Auto-fetches all invoices on mount
- **useInvoice(id)** - Auto-fetches single invoice by ID

---

## Validation Integration

All components now use Zod schemas before dispatching:

```typescript
// Upload validation
const validation = validateUploadFile({ file });

// Invoice validation
const validation = validateInvoice(invoice);

// Check result
if (!validation.success) {
	const errors = validation.error.errors.map((e) => e.message).join(", ");
	// Handle error
}
```

---

## Benefits Achieved

✅ **Single Source of Truth** - All invoice data in Redux store  
✅ **Type Safety** - Full TypeScript support with RootState and AppDispatch  
✅ **Consistent State** - No stale data across components  
✅ **Automatic Loading States** - Centralized loading/error handling  
✅ **Validation** - Zod schemas enforce data integrity  
✅ **DevTools** - Redux DevTools for debugging  
✅ **Code Reusability** - Custom hooks eliminate duplication

---

## Testing Checklist

- [ ] Upload invoice file (PDF/PNG/JPEG)
- [ ] View uploaded invoice in list
- [ ] Click invoice to view details
- [ ] Edit invoice fields and save
- [ ] Validate error handling (invalid file, network errors)
- [ ] Check Redux DevTools state updates
- [ ] Verify loading spinners appear during API calls
- [ ] Test error alerts display correctly

---

## Next Steps

1. **Backend Integration** - Ensure backend API matches Redux thunk expectations
2. **Error Handling** - Add toast notifications for better UX
3. **Optimistic Updates** - Update UI before API response for faster feel
4. **Caching** - Implement RTK Query for advanced caching (optional)
5. **Testing** - Write unit tests for Redux slices and thunks

---

## File Changes Summary

| File                               | Lines Changed | Type     |
| ---------------------------------- | ------------- | -------- |
| `components/UploadCard.tsx`        | ~80           | Refactor |
| `components/InvoiceDetailForm.tsx` | ~30           | Refactor |
| `app/page.tsx`                     | ~25           | Refactor |
| `app/invoices/[id]/page.tsx`       | ~40           | Refactor |

**Total:** ~175 lines refactored across 4 files

---

## API Endpoints Used

All endpoints defined in `lib/api/client.ts`:

- `POST /api/invoices/upload` - Upload file
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get single invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `POST /api/invoices/:id/extract` - Re-extract data

---

**Migration Completed:** ✅  
**Date:** 2025  
**Status:** All components using Redux + Zod validation

# 🚀 Quick Start Guide - State Management & Validation Integration

## Step-by-Step Setup

### Step 1: Install Dependencies

```bash
cd Invoice-Uploader-UI
npm install
```

This installs:

- ✅ `@reduxjs/toolkit` & `react-redux` - State management
- ✅ `zod` - Schema validation
- ✅ `axios` - HTTP client

### Step 2: Configure Environment

Your `.env.local` file is already created with:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Step 3: Start Backend Server

```bash
cd ../Invoice-Uploader-Backend
npm install  # Install uuid package
npm run dev
```

Backend runs on: `http://localhost:4000`

### Step 4: Setup Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE invoice_app;"

# Run schema
psql -U postgres -d invoice_app -f db/schema.sql
```

### Step 5: Start Frontend

```bash
cd ../Invoice-Uploader-UI
npm run dev
```

Frontend runs on: `http://localhost:3000`

---

## 📁 What Was Created

### 1. Zod Schemas (`lib/schemas/invoice.schema.ts`)

- ✅ `InvoiceSchema` - Validates invoice data
- ✅ `LineItemSchema` - Validates line items
- ✅ `UploadFileSchema` - Validates file uploads
- ✅ TypeScript types exported
- ✅ Validation helper functions

### 2. API Client (`lib/api/client.ts`)

- ✅ Axios instance with interceptors
- ✅ All invoice API endpoints
- ✅ Error handling
- ✅ TypeScript typed responses

### 3. Redux Store

**Redux Store** (`lib/store/index.ts`)

- ✅ Configured with Redux Toolkit
- ✅ Typed hooks (useAppDispatch, useAppSelector)
- ✅ DevTools integration

**Invoice Slice** (`lib/store/slices/invoiceSlice.ts`)

- ✅ Invoice state & async thunks
- ✅ CRUD operations
- ✅ Loading & error states

**Upload Slice** (`lib/store/slices/uploadSlice.ts`)

- ✅ Upload progress tracking
- ✅ File preview management
- ✅ Error handling

**Redux Provider** (`lib/store/provider.tsx`)

- ✅ Client-side Redux provider wrapper

### 4. Custom Hooks (`lib/hooks/useInvoices.ts`)

- ✅ `useInvoices()` - List invoices with auto-fetch
- ✅ `useInvoice(id)` - Single invoice with auto-fetch
- ✅ Simplified state management

---

## 🎯 Usage Examples

### Example 1: Update UploadCard Component

Replace your current UploadCard with integrated version:

```typescript
"use client";
import React, { useState, useCallback } from "react";
import { Box, Paper, Typography, Button, LinearProgress, Alert } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { uploadFile } from "@/lib/store/slices/invoiceSlice";
import { clearError } from "@/lib/store/slices/invoiceSlice";
import { validateUploadFile } from "@/lib/schemas/invoice.schema";

export default function UploadCard() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.invoice);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    // Validate file
    const validation = validateUploadFile({ file: selectedFile });

    if (!validation.success) {
      const errorMsg = validation.error.errors[0].message;
      alert(errorMsg);
      return;
    }

    setFile(selectedFile);
    dispatch(clearError());

    // Preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    }
  }, [clearError]);

  const handleUpload = async () => {
    if (!file) return;

    try {
      const result = await dispatch(uploadFile(file)).unwrap();
      window.location.href = \`/invoices/\${result.id}\`;
    } catch (err) {
      // Error is handled by store
      console.error("Upload failed:", err);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>📄 Upload Invoice</Typography>

      {/* File drop zone */}
      <Box
        sx={{
          border: "2px dashed",
          borderColor: error ? "error.main" : "primary.light",
          borderRadius: 2,
          p: 3,
          textAlign: "center",
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const droppedFile = e.dataTransfer.files?.[0];
          if (droppedFile) handleFileSelect(droppedFile);
        }}
      >
        {!file ? (
          <>
            <CloudUploadIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
            <Typography variant="body2" sx={{ mb: 2 }}>
              Drop your invoice here or
            </Typography>
            <Button variant="contained" component="label">
              Select File
              <input
                type="file"
                hidden
                accept=".pdf,image/png,image/jpeg"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) handleFileSelect(selectedFile);
                }}
              />
            </Button>
          </>
        ) : (
          <>
            {previewUrl && (
              <img src={previewUrl} alt="preview" style={{ maxHeight: 160, marginBottom: 16 }} />
            )}
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{file.name}</Typography>
            <Typography variant="caption">{(file.size / 1024).toFixed(0)} KB</Typography>
            <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "center" }}>
              <Button onClick={() => { setFile(null); setPreviewUrl(null); }}>
                Remove
              </Button>
              <Button variant="contained" onClick={handleUpload} disabled={loading}>
                {loading ? "Uploading..." : "Upload"}
              </Button>
            </Box>
          </>
        )}
      </Box>

      {loading && <LinearProgress sx={{ mt: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}
    </Paper>
  );
}
```

### Example 2: Update Home Page to Use State Management

```typescript
"use client";
import {
	Container,
	Box,
	Typography,
	Stack,
	CircularProgress,
} from "@mui/material";
import UploadCard from "@/components/UploadCard";
import InvoiceCard from "@/components/InvoiceCard";
import { useInvoices } from "@/lib/hooks/useInvoices";

export default function Home() {
	const { invoices, loading, error } = useInvoices();

	return (
		<Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", py: 4 }}>
			<Container maxWidth="lg">
				<Box sx={{ mb: 4 }}>
					<Typography variant="h1" sx={{ mb: 1 }}>
						Invoices
					</Typography>
					<Typography variant="body1" sx={{ color: "text.secondary" }}>
						Upload, review and save extracted invoices seamlessly
					</Typography>
				</Box>

				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", md: "350px 1fr" },
						gap: 3,
					}}
				>
					<Box>
						<UploadCard />
					</Box>

					<Box>
						<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
							Recent Invoices
						</Typography>

						{loading ? (
							<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
								<CircularProgress />
							</Box>
						) : error ? (
							<Typography color="error">{error}</Typography>
						) : (
							<Stack spacing={2}>
								{invoices.length > 0 ? (
									invoices.map((inv) => (
										<InvoiceCard key={inv.id} invoice={inv} />
									))
								) : (
									<Typography
										variant="body2"
										sx={{ color: "text.secondary", py: 4, textAlign: "center" }}
									>
										No invoices yet. Upload one to get started!
									</Typography>
								)}
							</Stack>
						)}
					</Box>
				</Box>
			</Container>
		</Box>
	);
}
```

### Example 3: Update Invoice Detail Page

```typescript
"use client";
import { use } from "react";
import {
	Container,
	Box,
	Typography,
	CircularProgress,
	Alert,
	Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InvoiceDetailForm from "@/components/InvoiceDetailForm";
import { useInvoice } from "@/lib/hooks/useInvoices";

export default function InvoiceDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const { invoice, loading, error } = useInvoice(id);

	return (
		<Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", py: 4 }}>
			<Container maxWidth="lg">
				<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
					<Button
						startIcon={<ArrowBackIcon />}
						onClick={() => window.history.back()}
						variant="text"
					>
						Back
					</Button>
					<Typography variant="h5" sx={{ fontWeight: 600 }}>
						Invoice Details
					</Typography>
				</Box>

				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
						<CircularProgress />
					</Box>
				) : error ? (
					<Alert severity="error">{error}</Alert>
				) : !invoice ? (
					<Alert severity="warning">Invoice not found</Alert>
				) : (
					<InvoiceDetailForm invoice={invoice} />
				)}
			</Container>
		</Box>
	);
}
```

### Example 4: Update InvoiceDetailForm with Validation

```typescript
"use client";
import { useState } from "react";
import { Paper, TextField, Button, Typography, Box, Stack, Alert } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import LineItemsEditor from "@/components/LineItemsEditor";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { updateInvoice } from "@/lib/store/slices/invoiceSlice";
import { validateInvoice } from "@/lib/schemas/invoice.schema";

export default function InvoiceDetailForm({ invoice: initial }: any) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.invoice);
  const [invoice, setInvoice] = useState(initial);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const onChange = (k: string, v: any) => setInvoice((s: any) => ({ ...s, [k]: v }));

  const save = async () => {
    // Validate invoice
    const validation = validateInvoice(invoice);

    if (!validation.success) {
      const errors = validation.error.errors.map(e => e.message).join(", ");
      setMessage({ type: "error", text: \`Validation failed: \${errors}\` });
      return;
    }

    try {
      await dispatch(updateInvoice({ id: invoice.id, data: validation.data })).unwrap();
      setMessage({ type: "success", text: "Invoice saved successfully!" });
    } catch (e: any) {
      setMessage({ type: "error", text: e?.message || "Save failed" });
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h6">Invoice {invoice.invoice_number ?? ""}</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Status: <strong>{invoice.status || "PENDING"}</strong>
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={save}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </Box>

      {message && (
        <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      {/* Form fields remain the same */}
      <Stack spacing={3}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
          <TextField
            label="Supplier Name"
            value={invoice.supplier_name ?? ""}
            onChange={(e) => onChange("supplier_name", e.target.value)}
            fullWidth
            size="small"
          />
          {/* ... other fields ... */}
        </Box>

        <LineItemsEditor
          lineItems={invoice.line_items ?? []}
          onChange={(items: any) => onChange("line_items", items)}
        />
      </Stack>
    </Paper>
  );
}
```

---

## ✅ Checklist

- [ ] Install dependencies: `npm install`
- [ ] Backend running on port 4000
- [ ] Database created and schema loaded
- [ ] Frontend running on port 3000
- [ ] Test file upload
- [ ] Test invoice list
- [ ] Test invoice update
- [ ] Test validation errors

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'zustand'"

**Solution**: Run `npm install` in the frontend directory

### Error: "Network Error"

**Solution**: Ensure backend is running on port 4000

### Error: "Database connection failed"

**Solution**: Check PostgreSQL is running and DATABASE_URL in `.env`

### CORS Error

**Solution**: Backend already configured for `http://localhost:3000`

---

## 📚 Next Steps

1. **Test the integration** - Upload files and save invoices
2. **Add authentication** - Implement user login/logout
3. **Add AI extraction** - Integrate OCR/LLM for invoice data extraction
4. **Deploy** - Deploy to production (Vercel + Railway/Render)

For detailed documentation, see `INTEGRATION_GUIDE.md`
