import {runDownload} from "@p1doks-downloader/p1doks-download";
import {getConfig, updateLastUsed} from "../utils";

export const downloadCommand = async (options: any) => {
  try {
    const config = getConfig(options);
    await runDownload(config);

    // Update lastUsed values for convenience
    updateLastUsed(
      {
        series: config.series,
        season: config.season,
        week: config.week,
        year: config.year,
      },
      options.config
    );
  } catch (error) {
    console.error("Download failed:", error);
    process.exit(1);
  }
};
