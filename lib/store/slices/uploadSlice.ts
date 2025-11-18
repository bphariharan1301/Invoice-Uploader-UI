import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UploadState {
  file: File | null;
  progress: number;
  uploading: boolean;
  error: string | null;
  previewUrl: string | null;
}

const initialState: UploadState = {
  file: null,
  progress: 0,
  uploading: false,
  error: null,
  previewUrl: null,
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    setFile: (state, action: PayloadAction<File | null>) => {
      state.file = action.payload;
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    setUploading: (state, action: PayloadAction<boolean>) => {
      state.uploading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPreviewUrl: (state, action: PayloadAction<string | null>) => {
      state.previewUrl = action.payload;
    },
    reset: () => initialState,
  },
});

export const { setFile, setProgress, setUploading, setError, setPreviewUrl, reset } =
  uploadSlice.actions;
export default uploadSlice.reducer;
