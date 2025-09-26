import {Command} from "commander";
import {downloadCommand, setupCommand, configCommand} from "./commands";

export const createCLI = (): Command => {
  const program = new Command();

  program.name("p1doks").description("P1Doks downloader CLI").version("1.0.0");

  // Download command
  program
    .command("download")
    .description("Download setups from P1Doks")
    .option("-e, --email <email>", "P1Doks email")
    .option("-p, --password <password>", "P1Doks password")
    .option("-s, --series <series>", 'Series name (e.g., "GT Sprint")')
    .option("--season <season>", 'Season (e.g., "1")')
    .option("--week <week>", 'Week (e.g., "1")')
    .option("-t, --team <team>", "Team name")
    .option("-y, --year <year>", 'Year (e.g., "2025")')
    .option("--headless", "Run in headless mode", false)
    .option("-c, --config <path>", "Path to config file")
    .action(downloadCommand);

  // Interactive setup command
  program
    .command("setup")
    .description("Interactive setup wizard")
    .option("-c, --config <path>", "Path to config file")
    .action(setupCommand);

  // Config command
  program
    .command("config")
    .description("Show current configuration")
    .option("-c, --config <path>", "Path to config file")
    .action(configCommand);

  return program;
};
