"use client";
import React, { useState } from "react";
import {
	Paper,
	TextField,
	Button,
	Typography,
	Box,
	Stack,
	Divider,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import LineItemsEditor from "@/components/LineItemsEditor";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { updateInvoice } from "@/lib/store/slices/invoiceSlice";
import { validateInvoice } from "@/lib/schemas/invoice.schema";
import { showAlert } from "@/lib/store/slices/alertSlice";
import { useRouter } from "next/navigation";

export default function InvoiceDetailForm({ invoice: initial }: any) {
	const dispatch = useAppDispatch();
	const { loading } = useAppSelector((state) => state.invoice);
	const [invoice, setInvoice] = useState(initial);
	const router = useRouter();

	// Helper function to convert ISO date to YYYY-MM-DD format for date input
	const formatDateForInput = (dateString: string | null | undefined) => {
		if (!dateString) return "";
		try {
			const date = new Date(dateString);
			return date.toISOString().split("T")[0];
		} catch {
			return "";
		}
	};

	const onChange = (k: string, v: any) => {
		setInvoice((s: any) => {
			const updated = { ...s, [k]: v };

			// Recalculate totals when line items change
			if (k === "line_items") {
				const subtotal = (v || []).reduce(
					(sum: number, item: any) => sum + Number(item.line_total ?? 0),
					0
				);
				updated.subtotal = subtotal;
				updated.total = subtotal;
			}

			return updated;
		});
	};

	const save = async () => {
		// Validate with Zod
		const validation = validateInvoice(invoice);
		if (!validation.success) {
			const errors = validation.error.errors.map((e) => e.message).join(", ");
			dispatch(showAlert({ message: `Validation failed: ${errors}`, severity: "error" }));
			return;
		}

		try {
			const result = await dispatch(
				updateInvoice({ id: invoice.id, data: validation.data })
			).unwrap();

			// Update local invoice with the returned data
			setInvoice(result);

			dispatch(showAlert({ message: "Invoice saved successfully!", severity: "success" }));
			router.push('/');
		} catch (e: any) {
			dispatch(showAlert({ message: e?.message || "Save failed", severity: "error" }));
		}
	};

	return (
		<Paper
			elevation={2}
			sx={{
				p: 4,
				borderRadius: 2,
				backgroundColor: "#fff",
			}}
		>
			{/* Header */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					mb: 3,
				}}
			>
				<Box>
					<Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
						Invoice {invoice.invoice_number ?? ""}
					</Typography>
					<Typography variant="body2" sx={{ color: "text.secondary" }}>
						Status: <strong>{invoice.status || "PENDING"}</strong>
					</Typography>
					<Typography variant="body2" sx={{ color: "text.secondary" }}>
						Confidence: <strong>{invoice.confidence || "0.01"}</strong>
					</Typography>
				</Box>
				<Button
					variant="contained"
					startIcon={<SaveIcon />}
					onClick={save}
					disabled={loading}
					size="large"
				>
					{loading ? "Saving..." : "Save Changes"}
				</Button>
			</Box>

			<Divider sx={{ mb: 3 }} />

			{/* Form Fields */}
			<Stack spacing={3}>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
						gap: 2,
					}}
				>
					<TextField
						label="Supplier Name"
						value={invoice.supplier_name ?? ""}
						onChange={(e) => onChange("supplier_name", e.target.value)}
						fullWidth
						size="small"
					/>
					<TextField
						label="Invoice Number"
						value={invoice.invoice_number ?? ""}
						onChange={(e) => onChange("invoice_number", e.target.value)}
						fullWidth
						size="small"
					/>
					<TextField
						label="Invoice Date"
						value={formatDateForInput(invoice.invoice_date)}
						onChange={(e) => onChange("invoice_date", e.target.value)}
						fullWidth
						size="small"
						type="date"
						InputLabelProps={{ shrink: true }}
					/>
				</Box>

				<Divider />

				{/* Line Items Section */}
				<Box>
					<Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
						Line Items
					</Typography>
					<LineItemsEditor
						lineItems={invoice.line_items ?? []}
						onChange={(items: any) => onChange("line_items", items)}
					/>
				</Box>

				<Divider />

				{/* Totals */}
				<Box sx={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
					<Box>
						<Typography
							variant="body2"
							sx={{ color: "text.secondary", mb: 0.5 }}
						>
							Subtotal
						</Typography>
						<Typography
							variant="body1"
							sx={{ fontWeight: 600, fontSize: "1.1rem" }}
						>
							${Number(invoice.subtotal || 0).toFixed(2)}
						</Typography>
					</Box>
					<Box sx={{ borderLeft: "2px solid", borderColor: "divider", pl: 4 }}>
						<Typography
							variant="body2"
							sx={{ color: "text.secondary", mb: 0.5 }}
						>
							Total Amount
						</Typography>
						<Typography
							variant="h6"
							sx={{
								fontWeight: 700,
								color: "primary.main",
								fontSize: "1.3rem",
							}}
						>
							${Number(invoice.total || 0).toFixed(2)}
						</Typography>
					</Box>
				</Box>
			</Stack>
		</Paper>
	);
}
