"use client";
import React, { useState, useCallback } from "react";
import { Box, Paper, Typography, Button, LinearProgress, IconButton } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { v4 as uuidv4 } from "uuid";

type UploadState = {
  file?: File;
  progress: number;
  uploading: boolean;
  error?: string;
  previewUrl?: string;
};

export default function UploadCard() {
  const [s, setS] = useState<UploadState>({ progress: 0, uploading: false });

  const onFile = useCallback((file?: File) => {
    if (!file) return;
    // validation
    if (file.size > 10 * 1024 * 1024) {
      setS({ ...s, error: "File must be <= 10MB" });
      return;
    }
    const accept = ["application/pdf", "image/png", "image/jpeg"];
    if (!accept.includes(file.type)) {
      setS({ ...s, error: "Only PDF, PNG, JPEG allowed" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setS({ ...s, file, previewUrl: typeof e.target?.result === "string" ? e.target?.result : undefined, error: undefined });
    if (file.type.startsWith("image/")) reader.readAsDataURL(file);
    else setS({ ...s, file, previewUrl: undefined, error: undefined });
  }, [s]);

  const handleDrop = (ev: React.DragEvent) => {
    ev.preventDefault();
    const f = ev.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  const handleSelect = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0];
    if (f) onFile(f);
  };

  const upload = async () => {
    if (!s.file) return;
    setS(prev => ({ ...prev, uploading: true, progress: 5 }));
    try {
      // create form data
      const fd = new FormData();
      fd.append("file", s.file, `${uuidv4()}-${s.file.name}`);

      // Basic progress simulation if backend doesn't support progress events
      const fakeProgress = () => new Promise<void>(res => {
        let p = 10;
        const t = setInterval(() => {
          p += Math.random() * 15;
          if (p >= 90) {
            clearInterval(t);
            res();
          } else setS(prev => ({ ...prev, progress: Math.min(95, Math.round(p)) }));
        }, 200);
      });

      // trigger fake progress while fetch happens
      const fetchPromise = fetch("/api/invoices/upload", { method: "POST", body: fd });
      await Promise.race([fetchPromise, fakeProgress()]);
      // if fetchPromise still in flight, await it
      const res = await fetchPromise;
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Upload failed");
      }
      const json = await res.json();
      setS({ file: undefined, progress: 100, uploading: false });
      // redirect to invoice detail (backend will create id)
      if (json?.id) {
        window.location.href = `/invoices/${json.id}`;
      } else {
        // show success state
        setTimeout(() => setS({ progress: 0, uploading: false }), 800);
      }
    } catch (err: any) {
      setS({ ...s, uploading: false, error: err?.message ?? "Upload failed" });
    }
  };

  return (
    <Paper elevation={2} className="p-4">
      <Typography variant="h6" className="mb-2">Upload Invoice</Typography>

      <Box onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} className="border-2 border-dashed border-slate-200 p-4 rounded">
        <div className="flex items-center gap-4">
          <CloudUploadIcon fontSize="large" />
          <div>
            <div className="text-sm text-slate-600">Drop PDF / PNG / JPG here or</div>
            <label className="inline-block mt-2">
              <input type="file" accept=".pdf,image/png,image/jpeg" onChange={handleSelect} hidden />
              <Button variant="contained" size="small">Select file</Button>
            </label>
          </div>
        </div>

        {s.previewUrl && (
          <div className="mt-4">
            <img src={s.previewUrl} alt="preview" className="max-h-40 object-contain border rounded" />
          </div>
        )}

        {s.file && (
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{s.file.name}</div>
              <div className="text-xs text-slate-500">{(s.file.size / 1024).toFixed(0)} KB</div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="small" onClick={() => setS({ progress: 0, uploading: false })}>Remove</Button>
              <Button size="small" variant="contained" disabled={s.uploading} onClick={upload}>Upload</Button>
            </div>
          </div>
        )}

        {s.uploading && <LinearProgress variant="determinate" value={s.progress} className="mt-3" />}
        {s.error && <div className="text-sm text-red-600 mt-3">{s.error}</div>}
      </Box>
    </Paper>
  );
}
