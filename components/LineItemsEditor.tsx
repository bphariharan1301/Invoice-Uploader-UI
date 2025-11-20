"use client";
import React from "react";
import {
	Button,
	TextField,
	IconButton,
	Box,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Paper,
	Typography,
	Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { v4 as uuidv4 } from "uuid";

export default function LineItemsEditor({ lineItems, onChange }: any) {
	console.log("Line Items: ", lineItems);
	const updateItem = (index: number, key: string, value: any) => {
		const newItems = [...lineItems];
		newItems[index] = { ...newItems[index], [key]: value };
		// recalc line total if possible
		const q = parseFloat(newItems[index].quantity) || 0;
		const p = parseFloat(newItems[index].unit_price) || 0;
		newItems[index].line_total = +(q * p);
		onChange(newItems);
	};

	const add = () =>
		onChange([
			...(lineItems || []),
			{
				id: uuidv4(),
				description: "",
				quantity: 1,
				unit_price: 0,
				line_total: 0,
			},
		]);

	const remove = (index: number) => {
		const arr = [...lineItems];
		arr.splice(index, 1);
		onChange(arr);
	};

	const totalLineItems = (lineItems || []).reduce(
		(sum: number, item: any) => sum + Number(item.line_total ?? 0),
		0
	);

	return (
		<Box>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
				}}
			>
				<Typography
					variant="body2"
					sx={{ fontWeight: 600, color: "text.secondary" }}
				>
					{(lineItems || []).length} item
					{(lineItems || []).length !== 1 ? "s" : ""}
				</Typography>
				<Button
					size="small"
					startIcon={<AddIcon />}
					onClick={add}
					variant="outlined"
				>
					Add Line Item
				</Button>
			</Box>

			{(lineItems || []).length > 0 ? (
				<Paper variant="outlined" sx={{ overflow: "auto" }}>
					<Table size="small">
						<TableHead sx={{ backgroundColor: "#f5f5f5" }}>
							<TableRow>
								<TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
								<TableCell align="right" sx={{ fontWeight: 700, width: 100 }}>
									Quantity
								</TableCell>
								<TableCell align="right" sx={{ fontWeight: 700, width: 120 }}>
									Unit Price
								</TableCell>
								<TableCell align="right" sx={{ fontWeight: 700, width: 120 }}>
									Line Total
								</TableCell>
								<TableCell align="center" sx={{ fontWeight: 700, width: 50 }}>
									Action
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{(lineItems || []).map((li: any, idx: number) => (
								<TableRow
									key={li.id}
									sx={{ "&:hover": { backgroundColor: "#fafafa" } }}
								>
									<TableCell>
										<TextField
											value={li.description}
											onChange={(e) =>
												updateItem(idx, "description", e.target.value)
											}
											fullWidth
											size="small"
											variant="outlined"
											placeholder="Item description"
										/>
									</TableCell>
									<TableCell align="right">
										<TextField
											type="number"
											value={li.quantity}
											onChange={(e) =>
												updateItem(idx, "quantity", e.target.value)
											}
											size="small"
											variant="outlined"
											inputProps={{ min: 0, step: 0.01 }}
										/>
									</TableCell>
									<TableCell align="right">
										<TextField
											type="number"
											value={li.unit_price}
											onChange={(e) =>
												updateItem(idx, "unit_price", e.target.value)
											}
											size="small"
											variant="outlined"
											inputProps={{ min: 0, step: 0.01 }}
											InputProps={{ startAdornment: "$" }}
										/>
									</TableCell>
									<TableCell
										align="right"
										sx={{ fontWeight: 600, color: "primary.main" }}
									>
										${li.line_total || 0}
									</TableCell>
									<TableCell align="center">
										<IconButton
											size="small"
											onClick={() => remove(idx)}
											color="error"
										>
											<DeleteIcon fontSize="small" />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
							{/* Total Row */}
							<TableRow
								sx={{
									backgroundColor: "#f9f9f9",
									borderTop: "2px solid",
									borderColor: "divider",
								}}
							>
								<TableCell colSpan={3} align="right" sx={{ fontWeight: 700 }}>
									Subtotal:
								</TableCell>
								<TableCell
									align="right"
									sx={{
										fontWeight: 700,
										color: "primary.main",
										fontSize: "1.1rem",
									}}
								>
									${totalLineItems?.toFixed(2)}
								</TableCell>
								<TableCell />
							</TableRow>
						</TableBody>
					</Table>
				</Paper>
			) : (
				<Paper
					variant="outlined"
					sx={{ p: 3, textAlign: "center", backgroundColor: "#fafafa" }}
				>
					<Typography variant="body2" sx={{ color: "text.secondary" }}>
						No line items yet. Click "Add Line Item" to get started.
					</Typography>
				</Paper>
			)}
		</Box>
	);
}
