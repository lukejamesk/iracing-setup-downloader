export type Config = {
  login: string;
  password: string;
  series?: string;
  season?: string;
  year?: string;
  week?: string;
  selectedTeams: string[];
  downloadPath: string;
  runHeadless?: boolean;
  // Mapping configurations for Hymo to iRacing conversions
  mappings?: {
    carHymoToIracing?: Record<string, string>;
    trackHymoToIracing?: Record<string, string>;
  };
};
