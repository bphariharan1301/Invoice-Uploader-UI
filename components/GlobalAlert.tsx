"use client";
import React, { useEffect } from "react";
import { Alert, Snackbar } from "@mui/material";
import { useAppSelector, useAppDispatch } from "@/lib/store";
import { hideAlert, clearAlert } from "@/lib/store/slices/alertSlice";

export default function GlobalAlert() {
  const dispatch = useAppDispatch();
  const { open, message, severity } = useAppSelector((state) => state.alert);

  const handleClose = () => {
    dispatch(hideAlert());
  };

  const handleExited = () => {
    dispatch(clearAlert());
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={handleClose}
      TransitionProps={{ onExited: handleExited }}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%", minWidth: "300px" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
