import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import {
  fetchInvoices,
  fetchInvoiceById,
  updateInvoice,
  deleteInvoice,
  clearError,
} from "../store/slices/invoiceSlice";

/**
 * Custom hook to fetch and manage invoices
 */
export const useInvoices = (autoFetch = true) => {
  const dispatch = useAppDispatch();
  const { invoices, loading, error } = useAppSelector((state) => state.invoice);

  useEffect(() => {
    if (autoFetch) {
      dispatch(fetchInvoices());
    }
  }, [autoFetch, dispatch]);

  return {
    invoices,
    loading,
    error,
    refetch: () => dispatch(fetchInvoices()),
    deleteInvoice: (id: string | number) => dispatch(deleteInvoice(id)),
    clearError: () => dispatch(clearError()),
  };
};

/**
 * Custom hook to fetch and manage a single invoice
 */
export const useInvoice = (id: string | number) => {
  const dispatch = useAppDispatch();
  const { currentInvoice, loading, error } = useAppSelector((state) => state.invoice);

  useEffect(() => {
    if (id) {
      dispatch(fetchInvoiceById(id));
    }
  }, [id, dispatch]);

  return {
    invoice: currentInvoice,
    loading,
    error,
    updateInvoice: (data: any) => dispatch(updateInvoice({ id, data })),
    refetch: () => dispatch(fetchInvoiceById(id)),
    clearError: () => dispatch(clearError()),
  };
};
