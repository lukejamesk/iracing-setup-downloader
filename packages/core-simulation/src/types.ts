export interface DownloadProgress {
  type: "info" | "success" | "error";
  message: string;
  timestamp: Date;
}

export interface Config {
  email: string;
  password: string;
  series: string;
  season: string;
  year: string;
  week: string;
  teamName: string;
  downloadPath: string;
  runHeadless?: boolean;
}
