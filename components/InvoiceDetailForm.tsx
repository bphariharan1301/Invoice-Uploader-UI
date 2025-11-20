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
	Alert,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import LineItemsEditor from "@/components/LineItemsEditor";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { updateInvoice } from "@/lib/store/slices/invoiceSlice";
import { validateInvoice } from "@/lib/schemas/invoice.schema";

export default function InvoiceDetailForm({ invoice: initial }: any) {
	const dispatch = useAppDispatch();
	const { loading } = useAppSelector((state) => state.invoice);
	const [invoice, setInvoice] = useState(initial);
	console.log("Invoice is: ", invoice);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const onChange = (k: string, v: any) =>
		setInvoice((s: any) => ({ ...s, [k]: v }));

	const save = async () => {
		setMessage(null);

		// Validate with Zod
		console.log("Invoice: ", invoice);
		const validation = validateInvoice(invoice);
		console.log("Validation: ", validation);
		if (!validation.success) {
			const errors = validation.error.errors.map((e) => e.message).join(", ");
			setMessage({ type: "error", text: `Validation failed: ${errors}` });
			return;
		}

		try {
			await dispatch(
				updateInvoice({ id: invoice.id, data: validation.data })
			).unwrap();
			setMessage({ type: "success", text: "Invoice saved successfully!" });
		} catch (e: any) {
			setMessage({ type: "error", text: e?.message || "Save failed" });
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

			{/* Messages */}
			{message && (
				<Alert
					severity={message.type}
					onClose={() => setMessage(null)}
					sx={{ mb: 3 }}
				>
					{message.text}
				</Alert>
			)}

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
						value={invoice.invoice_date ?? ""}
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
							${invoice.subtotal?.toFixed?.(2) ?? "0.00"}
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
							${invoice.total?.toFixed?.(2) ?? "0.00"}
						</Typography>
					</Box>
				</Box>
			</Stack>
		</Paper>
	);
}
