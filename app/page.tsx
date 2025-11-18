"use client";

import UploadCard from "@/components/UploadCard";
import InvoiceCard from "@/components/InvoiceCard";
import { Container, Box, Typography, Stack, CircularProgress, Alert } from "@mui/material";
import { useInvoices } from "@/lib/hooks/useInvoices";

export default function Home() {
  const { invoices, loading, error } = useInvoices();

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h1" sx={{ mb: 1 }}>
            Invoices
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Upload, review and save extracted invoices seamlessly
          </Typography>
        </Box>

        {/* Main Grid */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "350px 1fr" }, gap: 3 }}>
          {/* Upload Section */}
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <UploadCard />
          </Box>

          {/* Invoice List Section */}
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Recent Invoices
            </Typography>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : (
              <Stack spacing={2}>
                {invoices.length > 0 ? (
                  invoices.map((inv) => <InvoiceCard key={inv.id} invoice={inv} />)
                ) : (
                  <Typography variant="body2" sx={{ color: "text.secondary", py: 4, textAlign: "center" }}>
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
