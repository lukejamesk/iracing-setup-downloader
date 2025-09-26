import {Config} from "@p1doks-downloader/core";
import {loadConfig} from "./config-file";

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
    const optionKey = field === "team" ? "team" : field;
    const configKey = field === "team" ? "teamName" : field;
    return !options[optionKey] && !fileConfig?.[configKey as keyof Config];
  });

  if (missingFields.length > 0) {
    console.log(`Missing required fields: ${missingFields.join(", ")}`);
    console.log(
      "Please provide them as options or run 'p1doks setup' to configure."
    );
    process.exit(1);
  }

  // Merge config sources: command line options > lastUsed values > config file defaults
  return {
    email: options.email || fileConfig?.email || "",
    password: options.password || fileConfig?.password || "",
    series:
      options.series ||
      fileConfig?.lastUsed?.series ||
      fileConfig?.series ||
      "",
    season:
      options.season ||
      fileConfig?.lastUsed?.season ||
      fileConfig?.season ||
      "",
    week: options.week || fileConfig?.lastUsed?.week || fileConfig?.week || "",
    teamName: options.team || fileConfig?.teamName || "",
    year: options.year || fileConfig?.lastUsed?.year || fileConfig?.year || "",
    runHeadless: options.headless ?? fileConfig?.runHeadless ?? true,
    lastUsed: fileConfig?.lastUsed,
  };
};
