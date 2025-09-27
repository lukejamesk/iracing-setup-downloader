export type Config = {
  email: string;
  password: string;
  series: string;
  season: string;
  year: string;
  week: string;
  teamName: string;
  downloadPath: string;
  runHeadless?: boolean;
  // Last used values for convenience
  lastUsed?: {
    series?: string;
    season?: string;
    week?: string;
    year?: string;
  };
};
