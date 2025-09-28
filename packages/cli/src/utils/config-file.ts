import {Config} from "@p1doks-downloader/p1doks-download";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// CLI-specific config interface that includes lastUsed for convenience
export interface CLIConfig extends Config {
  lastUsed?: {
    series?: string;
    season?: string;
    week?: string;
    year?: string;
    selectedTeamIds?: string[];
  };
}

const DEFAULT_CONFIG_DIR = path.join(os.homedir(), ".config", "p1doks");
const DEFAULT_CONFIG_FILE = path.join(DEFAULT_CONFIG_DIR, "config.json");

export const getConfigPath = (customPath?: string): string => {
  if (customPath) {
    return path.resolve(customPath);
  }
  return DEFAULT_CONFIG_FILE;
};

export const loadConfig = (customPath?: string): CLIConfig | null => {
  try {
    const configFile = getConfigPath(customPath);
    if (!fs.existsSync(configFile)) {
      return null;
    }

    const configData = fs.readFileSync(configFile, "utf8");
    const config = JSON.parse(configData);

    // Validate required fields (lastUsed is optional)
    const requiredFields = [
      "email",
      "password",
      "series",
      "season",
      "week",
      "selectedTeams",
      "year",
    ];
    const missingFields = requiredFields.filter((field) => {
      if (field === "selectedTeams") {
        return !config[field] || !Array.isArray(config[field]) || config[field].length === 0;
      }
      return !config[field];
    });

    if (missingFields.length > 0) {
      console.error(
        `Invalid config file. Missing fields: ${missingFields.join(", ")}`
      );
      return null;
    }

    return config as CLIConfig;
  } catch (error) {
    console.error("Error loading config file:", error);
    return null;
  }
};

export const saveConfig = (config: CLIConfig, customPath?: string): void => {
  try {
    const configFile = getConfigPath(customPath);
    const configDir = path.dirname(configFile);

    // Ensure config directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, {recursive: true});
    }

    // Save config file
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    console.log(`Configuration saved to ${configFile}`);
  } catch (error) {
    console.error("Error saving config file:", error);
    throw error;
  }
};

export const configExists = (customPath?: string): boolean => {
  const configFile = getConfigPath(customPath);
  return fs.existsSync(configFile);
};

export const updateLastUsed = (
  lastUsed: {series?: string; season?: string; week?: string; year?: string; selectedTeamIds?: string[]},
  customPath?: string
): void => {
  try {
    const configFile = getConfigPath(customPath);

    // Load existing config or create new one
    let config: any = {};
    if (fs.existsSync(configFile)) {
      const configData = fs.readFileSync(configFile, "utf8");
      config = JSON.parse(configData);
    }

    // Update lastUsed values
    config.lastUsed = {
      ...config.lastUsed,
      ...lastUsed,
    };

    // Ensure config directory exists
    const configDir = path.dirname(configFile);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, {recursive: true});
    }

    // Save updated config
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error("Error updating lastUsed values:", error);
    // Don't throw - this is a convenience feature, not critical
  }
};
