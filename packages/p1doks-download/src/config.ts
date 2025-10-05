export interface Team {
  id: string;
  name: string;
}

export type Config = {
  email: string;
  password: string;
  series: string;
  season: string;
  year: string;
  week: string;
  selectedTeams: (Team | string)[];
  downloadPath: string;
  runHeadless?: boolean;
  // Mapping configurations for P1Doks to iRacing conversions
  mappings?: {
    carP1DoksToIracing?: Record<string, string>;
    trackP1DoksToWBR?: Record<string, string>;
  };
};
