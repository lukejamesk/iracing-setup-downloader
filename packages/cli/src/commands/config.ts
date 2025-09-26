import {loadConfig, getConfigPath, configExists} from "../utils/config-file";

export const configCommand = (options: any) => {
  if (!configExists(options.config)) {
    console.log("No configuration file found.");
    console.log("Run 'p1doks setup' to create a configuration.");
    return;
  }

  const config = loadConfig(options.config);
  if (!config) {
    console.log("Configuration file exists but is invalid.");
    console.log("Run 'p1doks setup' to recreate the configuration.");
    return;
  }

  console.log(`Configuration file: ${getConfigPath(options.config)}`);
  console.log("\nCurrent configuration:");
  console.log(`  Email: ${config.email}`);
  console.log(`  Series: ${config.series}`);
  console.log(`  Season: ${config.season}`);
  console.log(`  Week: ${config.week}`);
  console.log(`  Team: ${config.teamName}`);
  console.log(`  Year: ${config.year}`);
  console.log(`  Headless: ${config.runHeadless}`);

  if (config.lastUsed) {
    console.log("\nLast used values:");
    if (config.lastUsed.series)
      console.log(`  Series: ${config.lastUsed.series}`);
    if (config.lastUsed.season)
      console.log(`  Season: ${config.lastUsed.season}`);
    if (config.lastUsed.week) console.log(`  Week: ${config.lastUsed.week}`);
    if (config.lastUsed.year) console.log(`  Year: ${config.lastUsed.year}`);
  }
};
