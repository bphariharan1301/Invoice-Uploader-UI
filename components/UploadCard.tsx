"use client";
import React, { useState, useCallback, useRef } from "react";
import { Box, Paper, Typography, Button, LinearProgress, Alert, Stack } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { uploadFile, clearError } from "@/lib/store/slices/invoiceSlice";
import { validateUploadFile } from "@/lib/schemas/invoice.schema";

export default function UploadCard() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.invoice);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onFile = useCallback((selectedFile?: File) => {
    if (!selectedFile) return;

    // Validate with Zod
    const validation = validateUploadFile({ file: selectedFile });
    if (!validation.success) {
      const errorMsg = validation.error.errors[0].message;
      dispatch(clearError());
      alert(errorMsg);
      return;
    }

    setFile(selectedFile);
    dispatch(clearError());

    // Preview for images
    const reader = new FileReader();
    reader.onload = (e) => {
      if (selectedFile.type.startsWith("image/")) {
        setPreviewUrl(e.target?.result as string);
      }
    };
    if (selectedFile.type.startsWith("image/")) {
      reader.readAsDataURL(selectedFile);
    }
  }, [dispatch]);

  const handleDrop = (ev: React.DragEvent) => {
    ev.preventDefault();
    const f = ev.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  const handleSelect = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0];
    if (f) onFile(f);
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setProgress(0);
    dispatch(clearError());
    if (inputRef.current) inputRef.current.value = "";
  };

  const upload = async () => {
    if (!file) return;

    setProgress(5);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const result = await dispatch(uploadFile(file)).unwrap();
      clearInterval(progressInterval);
      setProgress(100);

      // Redirect to invoice detail page
      if (result?.id) {
        setTimeout(() => {
          window.location.href = `/invoices/${result.id}`;
        }, 500);
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setProgress(0);
      console.error("Upload failed:", err);
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: "#fff",
        transition: "all 0.2s ease",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        📄 Upload Invoice
      </Typography>

      <Box
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        sx={{
          border: "2px dashed",
          borderColor: error ? "error.main" : "primary.light",
          borderRadius: 2,
          p: 3,
          textAlign: "center",
          backgroundColor: error ? "error.lighter" : "primary.lighter",
          transition: "all 0.2s ease",
          cursor: "pointer",
        }}
      >
        {!file ? (
          <Stack spacing={2} alignItems="center">
            <CloudUploadIcon sx={{ fontSize: 48, color: "primary.main" }} />
            <Box>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                Drop your invoice here or
              </Typography>
              <label htmlFor="invoice-file-input">
                <input
                  id="invoice-file-input"
                  ref={inputRef}
                  type="file"
                  accept=".pdf,image/png,image/jpeg"
                  onChange={handleSelect}
                  hidden
                  disabled={loading}
                />
                <Button
                  component="span"
                  variant="contained"
                  size="small"
                  disabled={loading}
                  sx={{ mt: 1 }}
                >
                  Select file
                </Button>
              </label>
            </Box>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              PDF, PNG, or JPEG • Max 10MB
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2}>
            {previewUrl && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <img
                  src={previewUrl}
                  alt="preview"
                  style={{
                    maxHeight: "160px",
                    maxWidth: "100%",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                  }}
                />
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {file.name}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {(file.size / 1024).toFixed(0)} KB
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={removeFile}
                disabled={loading}
                startIcon={<CloseIcon />}
              >
                Remove
              </Button>
            </Box>

            {loading && (
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="caption">Uploading...</Typography>
                  <Typography variant="caption">{Math.round(progress)}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
              </Box>
            )}

            {!loading && (
              <Button
                fullWidth
                variant="contained"
                size="medium"
                onClick={upload}
                startIcon={<CheckCircleIcon />}
              >
                Upload & Process
              </Button>
            )}
          </Stack>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}
    </Paper>
  );
}
