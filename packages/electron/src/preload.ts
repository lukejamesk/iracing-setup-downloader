import {contextBridge, ipcRenderer} from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  downloadSetups: (config: any) =>
    ipcRenderer.invoke("download-setups", config),
  cancelDownload: () => ipcRenderer.invoke("cancel-download"),
  selectFolder: () => ipcRenderer.invoke("select-folder"),
  openFolder: (path: string) => ipcRenderer.invoke("open-folder", path),
  renameFoldersForMapping: (params: any) => ipcRenderer.invoke("rename-folders-for-mapping", params),
  onDownloadProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on("download-progress", (event, progress) =>
      callback(progress)
    );
  },
  removeDownloadProgressListener: () => {
    ipcRenderer.removeAllListeners("download-progress");
  },
});
