export async function apiUploadFile(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/invoices/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { id, file_url, ... }
}

export async function apiTriggerExtract(invoiceId: string) {
  const res = await fetch(`/api/invoices/${invoiceId}/extract`, { method: "POST" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Extraction failed");
  }
  return res.json();
}
