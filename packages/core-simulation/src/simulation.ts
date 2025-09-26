import {DownloadProgress, Config} from "./types";

export const runDownloadSimulation = async (
  config: Config,
  onProgress?: (progress: DownloadProgress) => void,
  signal?: AbortSignal
): Promise<void> => {
  // Check for cancellation before starting
  if (signal?.aborted) {
    throw new Error("Download cancelled");
  }

  onProgress?.({
    type: "info",
    message: "Starting download simulation...",
    timestamp: new Date(),
  });

  // Simulate login process
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, 1000);
    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new Error("Download cancelled"));
    });
  });

  if (signal?.aborted) return;

  onProgress?.({
    type: "success",
    message: "Login successful!",
    timestamp: new Date(),
  });

  // Simulate applying filters
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, 500);
    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new Error("Download cancelled"));
    });
  });

  if (signal?.aborted) return;

  onProgress?.({
    type: "info",
    message: `Applying filters: ${config.series} - Season ${config.season}, Week ${config.week}, ${config.year}`,
    timestamp: new Date(),
  });

  // Simulate finding cards
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, 800);
    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new Error("Download cancelled"));
    });
  });

  if (signal?.aborted) return;

  onProgress?.({
    type: "info",
    message: "Found 3 setup cards",
    timestamp: new Date(),
  });

  // Simulate downloading files
  const files = [
    "setup_gt3_week1.sto",
    "setup_gt3_week1_qual.sto",
    "setup_gt3_week1_race.sto",
  ];

  for (const filename of files) {
    if (signal?.aborted) return;

    onProgress?.({
      type: "info",
      message: `Processing: ${config.series} at Silverstone`,
      timestamp: new Date(),
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, 600);
      signal?.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new Error("Download cancelled"));
      });
    });

    if (signal?.aborted) return;

    onProgress?.({
      type: "info",
      message: `Downloading: ${filename}`,
      timestamp: new Date(),
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, 800);
      signal?.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new Error("Download cancelled"));
      });
    });

    if (signal?.aborted) return;

    onProgress?.({
      type: "success",
      message: `Saved: ${filename}`,
      timestamp: new Date(),
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, 250);
      signal?.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new Error("Download cancelled"));
      });
    });
  }

  // Check for cancellation one final time before showing completion
  if (signal?.aborted) {
    throw new Error("Download cancelled");
  }

  // Only show completion if we're absolutely sure we're not cancelled
  if (!signal?.aborted) {
    onProgress?.({
      type: "success",
      message: "Download simulation completed!",
      timestamp: new Date(),
    });
  }
};
