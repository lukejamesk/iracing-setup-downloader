import {runDownload, DownloadProgress} from "@iracing-setup-downloader/p1doks-download";
import {getConfig, updateLastUsed} from "../utils";

export const downloadCommand = async (options: any) => {
  try {
    const config = getConfig(options);
    
    // Track unmapped items
    let unmappedCars: string[] = [];
    let unmappedTracks: string[] = [];
    
    // Progress handler to collect mapping warnings
    const onProgress = (progress: DownloadProgress) => {
      if (progress.type === "warning" && progress.mappingInfo) {
        unmappedCars = progress.mappingInfo.unmappedCars;
        unmappedTracks = progress.mappingInfo.unmappedTracks;
      }
    };
    
    await runDownload(config, onProgress);

    // Report unmapped items after download
    if (unmappedCars.length > 0 || unmappedTracks.length > 0) {
      console.log("\n⚠️  Mapping Configuration Needed:");
      
      if (unmappedCars.length > 0) {
        console.log(`\nUnmapped Cars (${unmappedCars.length}):`);
        unmappedCars.forEach(car => {
          console.log(`  - "${car}"`);
        });
        console.log("\nAdd these to your car mappings in the config file.");
      }
      
      if (unmappedTracks.length > 0) {
        console.log(`\nUnmapped Tracks (${unmappedTracks.length}):`);
        unmappedTracks.forEach(track => {
          console.log(`  - "${track}"`);
        });
        console.log("\nAdd these to your track mappings in the config file.");
      }
      
      console.log("\nRun 'p1doks config' to view/edit your configuration.");
    }

    // Update lastUsed values for convenience
    updateLastUsed(
      {
        series: config.series,
        season: config.season,
        week: config.week,
        year: config.year,
        selectedTeamIds: config.selectedTeams.map(t => t.id),
      },
      options.config
    );
  } catch (error) {
    console.error("Download failed:", error);
    process.exit(1);
  }
};
