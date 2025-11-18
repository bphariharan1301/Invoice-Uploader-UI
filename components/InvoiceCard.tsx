"use client";
import React from "react";
import { Paper, Typography, Chip, Button, Box, Stack } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const statusConfig: any = {
  EXTRACTED: { color: "success", label: "✓ Extracted" },
  NEEDS_REVIEW: { color: "warning", label: "⚠ Needs Review" },
  PENDING: { color: "info", label: "⏳ Pending" },
  FAILED: { color: "error", label: "✕ Failed" },
};

export default function InvoiceCard({ invoice }: any) {
  const { id, supplier_name, invoice_number, total, status } = invoice;
  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2.5,
        borderRadius: 2,
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "all 0.3s ease",
        border: "1px solid",
        borderColor: "divider",
        "&:hover": {
          boxShadow: 3,
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Left Section - Supplier Info */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary" }}>
          {supplier_name ?? "Unknown supplier"}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Invoice #{invoice_number ?? "—"}
        </Typography>
      </Box>

      {/* Right Section - Amount, Status, Action */}
      <Stack direction="row" spacing={3} alignItems="center">
        {/* Amount */}
        <Box sx={{ textAlign: "right", minWidth: 80 }}>
          <Typography variant="body1" sx={{ fontWeight: 700, color: "primary.main" }}>
            ${typeof total === "number" ? total.toFixed(2) : "0.00"}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            USD
          </Typography>
        </Box>

        {/* Status Chip */}
        <Chip
          label={config.label}
          color={config.color as any}
          variant="outlined"
          size="small"
          sx={{ fontWeight: 600, minWidth: 140 }}
        />

        {/* Open Button */}
        <Button
          size="small"
          variant="contained"
          endIcon={<OpenInNewIcon fontSize="small" />}
          onClick={() => (window.location.href = `/invoices/${id}`)}
          sx={{ whiteSpace: "nowrap" }}
        >
          Review
        </Button>
      </Stack>
    </Paper>
  );
}
