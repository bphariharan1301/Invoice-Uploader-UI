# Invoice Uploader - Frontend

Modern Next.js application for uploading, reviewing, and managing invoices with AI-powered data extraction.

## Features

- 📤 File upload with drag-and-drop (PDF, PNG, JPEG)
- 🤖 AI-powered invoice data extraction
- ✏️ Edit and review extracted invoice details
- 📊 Line items management with auto-calculation
- 🔔 Global notification system
- 💾 Redux state management with persistence
- ✅ Client-side validation with Zod
- 📱 Responsive Material-UI design

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running (see `../backend/README.md`)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Material-UI** - Component library
- **Redux Toolkit** - State management
- **Zod** - Schema validation
- **Axios** - HTTP client

## Project Structure

```
frontend/
├── app/                    # Next.js pages (App Router)
│   ├── page.tsx           # Home page with invoice list
│   ├── layout.tsx         # Root layout with providers
│   └── invoices/[id]/     # Invoice detail pages
├── components/            # React components
│   ├── GlobalAlert.tsx    # Notification system
│   ├── InvoiceCard.tsx    # Invoice list item
│   ├── InvoiceDetailForm.tsx  # Invoice editor
│   ├── LineItemsEditor.tsx    # Line items table
│   └── UploadCard.tsx     # File upload
├── lib/
│   ├── api/              # API client and endpoints
│   ├── hooks/            # Custom React hooks
│   ├── schemas/          # Zod validation schemas
│   └── store/            # Redux store and slices
└── public/               # Static assets
```

## Usage

### Upload Invoice

1. Drag and drop a file or click to select
2. Click "Upload" button
3. Wait for AI extraction
4. Redirected to invoice details

### Edit Invoice

1. Click on an invoice card
2. Modify fields as needed
3. Add/edit/remove line items
4. Click "Save Changes"
5. Success notification appears

## API Integration

All API calls are centralized in `lib/api/client.ts`:

- `POST /api/invoices/upload` - Upload file
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/:id` - Get invoice details
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `POST /api/invoices/:id/extract` - Re-extract data

## State Management

Redux store structure:

```typescript
{
  invoice: {
    invoices: Invoice[],
    currentInvoice: Invoice | null,
    loading: boolean,
    error: string | null
  },
  alert: {
    open: boolean,
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info'
  }
}
```

## Development

Key files:

- `lib/store/slices/invoiceSlice.ts` - Invoice state management
- `lib/store/slices/alertSlice.ts` - Global notifications
- `lib/schemas/invoice.schema.ts` - Validation schemas
- `lib/hooks/useInvoices.ts` - Custom hooks for data fetching

To add new features:

1. Create components in `components/`
2. Add API methods to `lib/api/client.ts`
3. Update Redux slices in `lib/store/slices/`
4. Add validation in `lib/schemas/`
