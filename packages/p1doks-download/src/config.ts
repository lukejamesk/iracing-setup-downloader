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
  // Mapping configurations for P1Doks to iRacing conversions
  mappings?: {
    carP1DoksToIracing?: Record<string, string>;
    trackP1DoksToWBR?: Record<string, string>;
    seasonP1DoksToWBR?: Record<string, string>;
  };
  // Last used values for convenience
  lastUsed?: {
    series?: string;
    season?: string;
    week?: string;
    year?: string;
  };
};
