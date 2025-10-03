import {Config} from "@iracing-setup-downloader/p1doks-download";
import {saveConfig, CLIConfig} from "../utils/config-file";
import {DEFAULT_CAR_MAPPINGS, DEFAULT_TRACK_MAPPINGS} from "../constants/default-mappings";

export const setupCommand = async (options: any) => {
  try {
    const config = await interactiveSetup(options.config);
    console.log("\nConfiguration saved. You can now use:");
    console.log("  p1doks download");
  } catch (error) {
    console.error("Setup failed:", error);
    process.exit(1);
  }
};

const interactiveSetup = async (customPath?: string): Promise<CLIConfig> => {
  const inquirer = require("inquirer");
  const questions = [
    {
      type: "input",
      name: "email",
      message: "P1Doks email:",
      validate: (input: string) => input.length > 0 || "Email is required",
    },
    {
      type: "password",
      name: "password",
      message: "P1Doks password:",
      validate: (input: string) => input.length > 0 || "Password is required",
    },
    {
      type: "input",
      name: "series",
      message: 'Series name (e.g., "GT Sprint"):',
      validate: (input: string) => input.length > 0 || "Series is required",
    },
    {
      type: "input",
      name: "season",
      message: 'Season (e.g., "1"):',
      default: "1",
      validate: (input: string) => input.length > 0 || "Season is required",
    },
    {
      type: "input",
      name: "week",
      message: 'Week (e.g., "1"):',
      default: "1",
      validate: (input: string) => input.length > 0 || "Week is required",
    },
    {
      type: "input",
      name: "team",
      message: "Team name:",
      validate: (input: string) => input.length > 0 || "Team name is required",
    },
    {
      type: "input",
      name: "year",
      message: 'Year (e.g., "2025"):',
      default: "2025",
      validate: (input: string) => input.length > 0 || "Year is required",
    },
    {
      type: "input",
      name: "downloadPath",
      message: "Download path (where to save files):",
      default: "./setups",
      validate: (input: string) =>
        input.length > 0 || "Download path is required",
    },
    {
      type: "confirm",
      name: "headless",
      message: "Run in headless mode?",
      default: true,
    },
  ];

  const answers = await inquirer.prompt(questions);

  const config: CLIConfig = {
    email: answers.email,
    password: answers.password,
    series: answers.series,
    season: answers.season,
    week: answers.week,
    selectedTeams: [{ id: answers.team.toLowerCase().replace(/\s+/g, '-'), name: answers.team }],
    year: answers.year,
    downloadPath: answers.downloadPath,
    runHeadless: answers.headless,
    mappings: {
      carP1DoksToIracing: DEFAULT_CAR_MAPPINGS,
      trackP1DoksToWBR: DEFAULT_TRACK_MAPPINGS,
    },
  };

  // Save to config file
  saveConfig(config, customPath);

  return config;
};
