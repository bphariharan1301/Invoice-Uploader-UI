"use client";
import React, { use } from "react";
import { Container, Box, Typography, CircularProgress, Alert, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InvoiceDetailForm from "@/components/InvoiceDetailForm";
import { useInvoice } from "@/lib/hooks/useInvoices";

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { invoice, loading, error } = useInvoice(id);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header with Back Button */}
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
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : !invoice ? (
          <Alert severity="warning">Invoice not found</Alert>
        ) : (
          <InvoiceDetailForm invoice={invoice} />
        )}
      </Container>
    </Box>
  );
}
