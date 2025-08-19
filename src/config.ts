type Config = {
  email: string;
  password: string;
  series: string;
  seasons: string[];
  years: string[];
  weeks: string[];
  teamName: string;
  iracingDocumentsPath: string;
};

export const CONFIG: Config = {
  email: process.env.P1DOKS_EMAIL as string,
  password: process.env.P1DOKS_PASSWORD as string,
  series: process.env.P1DOKS_SERIES as string,
  teamName: process.env.G61_TEAMNAME as string,
  iracingDocumentsPath: process.env.IRACING_DOCUMENTS_PATH as string,
  seasons: (process.env.P1DOKS_SEASONS as string)?.split(",") ?? [],
  years: (process.env.P1DOKS_YEARS as string)?.split(",") ?? [],
  weeks: (process.env.P1DOKS_WEEKS as string)?.split(",") ?? [],
};
