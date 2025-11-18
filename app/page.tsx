import Image from "next/image";
import UploadCard from "@/components/UploadCard";
// import InvoiceCard from "@/components/InvoiceCard";

export default function Home() {
  const sampleInvoices = [
    { id: "1", supplier_name: "Acme Inc.", invoice_number: "INV-1001", total: 1200, status: "EXTRACTED" },
    { id: "2", supplier_name: "Globex", invoice_number: "2025-204", total: 450.5, status: "NEEDS_REVIEW" }
  ];
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <div className="text-sm text-slate-500">Upload, review and save extracted invoices</div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <UploadCard />
        </div>

        {/* <div className="md:col-span-2">
          <div className="space-y-4">
            {sampleInvoices.map(inv => (
              <InvoiceCard key={inv.id} invoice={inv} />
            ))}
          </div>
        </div> */}
      </section>
    </div>
  );
}
