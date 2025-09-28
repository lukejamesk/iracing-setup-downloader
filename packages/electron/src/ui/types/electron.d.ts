// Type definitions for Electron API exposed through preload script

interface DownloadProgress {
  type: "info" | "success" | "error";
  message: string;
  timestamp: Date;
}

interface DownloadResult {
  success: boolean;
  completed?: boolean;
  error?: string;
  cancelled?: boolean;
}

interface FolderResult {
  success: boolean;
  path?: string;
  error?: string;
}

interface ElectronAPI {
  downloadSetups: (config: any) => Promise<DownloadResult>;
  cancelDownload: () => Promise<{success: boolean; error?: string}>;
  selectFolder: () => Promise<FolderResult>;
  openFolder: (path: string) => Promise<{success: boolean; error?: string}>;
  onDownloadProgress: (callback: (progress: DownloadProgress) => void) => void;
  removeDownloadProgressListener: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Type declarations for static assets
declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.jpeg" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

export {};
