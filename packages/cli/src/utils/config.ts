import {Config} from "@iracing-setup-downloader/p1doks-download";
import {loadConfig} from "./config-file";
import {DEFAULT_CAR_MAPPINGS, DEFAULT_TRACK_MAPPINGS} from "../constants/default-mappings";

export const getConfig = (options: any): Config => {
  // Load config from file
  const fileConfig = loadConfig(options.config);

  // Check for required fields
  const requiredFields = [
    "email",
    "password",
    "series",
    "season",
    "week",
    "team",
    "year",
  ];

  const missingFields = requiredFields.filter((field) => {
    if (field === "team") {
      return !options.team && (!fileConfig?.selectedTeams || fileConfig.selectedTeams.length === 0);
    }
    return !options[field] && !fileConfig?.[field as keyof Config];
  });

  if (missingFields.length > 0) {
    console.log(`Missing required fields: ${missingFields.join(", ")}`);
    console.log(
      "Please provide them as options or run 'p1doks setup' to configure."
    );
    process.exit(1);
  }

  // Handle team conversion from CLI option to selectedTeams array
  // Also handle underscore-to-space conversion for PowerShell compatibility
  const teamName = options.team ? options.team.replace(/_/g, ' ') : '';
  const selectedTeams = teamName
    ? [{ id: teamName.toLowerCase().replace(/\s+/g, '-'), name: teamName }]
    : fileConfig?.selectedTeams || [];

  // Merge config sources: command line options > lastUsed values > config file defaults
  return {
    email: options.email || fileConfig?.email || "",
    password: options.password || fileConfig?.password || "",
    series:
      (options.series ? options.series.replace(/_/g, ' ') : '') ||
      fileConfig?.lastUsed?.series ||
      fileConfig?.series ||
      "",
    season:
      options.season ||
      fileConfig?.lastUsed?.season ||
      fileConfig?.season ||
      "",
    week: options.week || fileConfig?.lastUsed?.week || fileConfig?.week || "",
    selectedTeams: selectedTeams,
    year: options.year || fileConfig?.lastUsed?.year || fileConfig?.year || "",
    downloadPath:
      options.downloadPath || fileConfig?.downloadPath || "./setups",
    runHeadless: options.headless ?? fileConfig?.runHeadless ?? true,
    mappings: {
      carP1DoksToIracing: {
        ...DEFAULT_CAR_MAPPINGS,
        ...fileConfig?.mappings?.carP1DoksToIracing,
      },
      trackP1DoksToWBR: {
        ...DEFAULT_TRACK_MAPPINGS,
        ...fileConfig?.mappings?.trackP1DoksToWBR,
      },
    },
  };
};
