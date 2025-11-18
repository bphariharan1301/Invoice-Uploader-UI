
export type UploadState = {
  file?: File;
  progress: number;
  uploading: boolean;
  error?: string;
  previewUrl?: string;
};
