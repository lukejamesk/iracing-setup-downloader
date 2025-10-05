import * as fs from 'fs-extra';
import * as path from 'path';
import * as yauzl from 'yauzl';
import { Config } from '../config';

export interface SetupInfo {
  teamName: string;
  car: string;
  track: string;
  setupName: string;
  originalZipPath: string;
}

export class FileHandler {
  /**
   * Extract zip file and organize into directory structure
   */
  static async extractAndOrganizeZip(zipPath: string, downloadPath: string, selectedTeams?: string[], config?: Config): Promise<string[]> {
    console.log(`📦 Processing file: ${zipPath}`);
    
    // Create the download directory if it doesn't exist
    await fs.ensureDir(downloadPath);
    
    // Check if it's actually a zip file or a mock folder
    const stats = await fs.stat(zipPath);
    let extractPath: string;
    let isZipFile = false;
    
    if (stats.isDirectory()) {
      // It's a mock folder, use it directly
      console.log('📁 Using mock folder structure directly');
      extractPath = zipPath;
    } else {
      // It's a zip file, extract it to a unique folder to avoid conflicts
      isZipFile = true;
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const uniqueTempDir = path.join(downloadPath, `temp_extract_${timestamp}_${randomId}`);
      extractPath = await this.extractZip(zipPath, uniqueTempDir);
    }
    
    // Find the setup folder
    const setupFolder = await this.findSetupFolder(extractPath);
    
    if (!setupFolder) {
      throw new Error('Could not find setup folder in extracted files');
    }
    
    // Parse the setup information from the folder structure
    const setupInfo = this.parseSetupInfo(setupFolder);
    
    // Create the organized directory structure with team information
    const organizedPaths = await this.organizeFiles(setupInfo, downloadPath, selectedTeams, config);
    
    // Delete the original zip file after successful extraction and organization
    if (isZipFile) {
      try {
        console.log(`🗑️ Deleting original zip file: ${zipPath}`);
        await fs.remove(zipPath);
        console.log(`✅ Original zip file deleted successfully`);
      } catch (error) {
        console.log(`⚠️ Could not delete original zip file: ${error}`);
      }
    }
    
    console.log(`✅ Files organized to: ${organizedPaths.join(', ')}`);
    
    return organizedPaths;
  }
  
  /**
   * Extract zip file to a temporary directory
   */
  private static async extractZip(zipPath: string, basePath: string): Promise<string> {
    const tempExtractPath = path.join(basePath, 'temp_extract');
    await fs.ensureDir(tempExtractPath);
    
    return new Promise((resolve, reject) => {
      yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(err);
          return;
        }
        
        zipfile.readEntry();
        
        zipfile.on('entry', (entry) => {
          if (/\/$/.test(entry.fileName)) {
            // Directory entry
            const dirPath = path.join(tempExtractPath, entry.fileName);
            fs.ensureDir(dirPath).then(() => {
              zipfile.readEntry();
            }).catch(reject);
          } else {
            // File entry
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) {
                reject(err);
                return;
              }
              
              const filePath = path.join(tempExtractPath, entry.fileName);
              fs.ensureDir(path.dirname(filePath)).then(() => {
                const writeStream = fs.createWriteStream(filePath);
                readStream.pipe(writeStream);
                
                writeStream.on('close', () => {
                  zipfile.readEntry();
                });
                
                writeStream.on('error', reject);
              }).catch(reject);
            });
          }
        });
        
        zipfile.on('end', () => {
          resolve(tempExtractPath);
        });
        
        zipfile.on('error', reject);
      });
    });
  }
  
  /**
   * Find the setup folder in the extracted files
   */
  private static async findSetupFolder(extractPath: string): Promise<string | null> {
    const stats = await fs.stat(extractPath);
    
    // If the extract path itself is a setup folder (starts with "setup_")
    if (stats.isDirectory() && path.basename(extractPath).startsWith('setup_')) {
      return extractPath;
    }
    
    // Look for the car folder (first level directory)
    const items = await fs.readdir(extractPath);
    
    for (const item of items) {
      const itemPath = path.join(extractPath, item);
      const stat = await fs.stat(itemPath);
      
      if (stat.isDirectory()) {
        // This should be the car folder, return it as the setup folder
        // The actual structure is: car/track/setupname/
        return itemPath;
      }
    }
    
    return null;
  }
  
  /**
   * Parse setup information from folder structure
   * Simplified: Just find the car and track, grab all files under track
   */
  private static parseSetupInfo(setupFolder: string): SetupInfo {
    const folderName = path.basename(setupFolder);
    
    // The setupFolder is now the car folder (e.g., "mercedesamgevogt3")
    const car = folderName;
    
    console.log(`🔍 Parsing setup info from folder: ${setupFolder}`);
    console.log(`🔍 Car name: ${car}`);
    
    // Read the contents of the car folder to find track
    const contents = fs.readdirSync(setupFolder);
    console.log(`🔍 Car folder contents: ${contents.join(', ')}`);
    
    let track = 'unknown';
    
    for (const item of contents) {
      const itemPath = path.join(setupFolder, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // This should be the track folder
        track = item;
        console.log(`🔍 Found track folder: ${track}`);
        break;
      }
    }
    
    console.log(`🔍 Final parsed info - Car: ${car}, Track: ${track}`);
    
    return {
      teamName: 'hymo', // Default team name
      car: car,
      track: track,
      setupName: 'all', // Simplified - we'll grab all files
      originalZipPath: setupFolder
    };
  }
  
  /**
   * Organize files into the correct directory structure for all selected teams
   */
  private static async organizeFiles(setupInfo: SetupInfo, basePath: string, selectedTeams?: string[], config?: Config): Promise<string[]> {
    // Use all selected teams, or default to 'hymo' if none provided
    const teams = selectedTeams && selectedTeams.length > 0 ? selectedTeams : ['hymo'];
    
    // Apply track mapping if available
    const originalTrack = setupInfo.track;
    const mappedTrack = config?.mappings?.trackHymoToIracing?.[originalTrack] || originalTrack;
    
    console.log(`📁 Organizing files for teams: ${teams.join(', ')}`);
    console.log(`📁 Base path: ${basePath}`);
    console.log(`📁 Car: ${setupInfo.car}`);
    console.log(`📁 Track: ${originalTrack}${mappedTrack !== originalTrack ? ` (mapped to: ${mappedTrack})` : ''}`);
    console.log(`📁 Setup name: ${setupInfo.setupName}`);
    
    const organizedPaths: string[] = [];
    
    // Create directory structure for each team: car/teamname/{year} Season {season}/track/hymo/
    for (const teamName of teams) {
      const organizedPath = path.join(
        basePath,
        setupInfo.car,
        teamName,
        `${config?.year || '2025'} Season ${config?.season || '4'}`,
        mappedTrack, // Use mapped track name instead of original
        'hymo'
      );
      
      console.log(`📁 Creating organized path for ${teamName}: ${organizedPath}`);
      await fs.ensureDir(organizedPath);
      organizedPaths.push(organizedPath);
      
      // Copy files from the track folder - grab all files recursively
      const trackPath = path.join(setupInfo.originalZipPath, setupInfo.track);
      console.log(`📁 Looking for files in track folder: ${trackPath}`);
      
      if (await fs.pathExists(trackPath)) {
        await this.copyAllStoFiles(trackPath, organizedPath, teamName);
        
        // Verify files were created for this team
        const finalFiles = await fs.readdir(organizedPath);
        console.log(`📁 ${teamName} directory contains: ${finalFiles.join(', ')}`);
      } else {
        console.log(`⚠️ Track path does not exist: ${trackPath}`);
      }
    }
    
    // Clean up temporary extraction folder (safe to delete)
    const tempFolderPath = setupInfo.originalZipPath;
    if (tempFolderPath.includes('setup_mock_') || tempFolderPath.includes('temp_extract')) {
      console.log(`📁 Cleaning up temporary folder: ${tempFolderPath}`);
      await fs.remove(tempFolderPath);
      
      // Also clean up the parent temp folder if it exists
      const parentTempFolder = path.dirname(tempFolderPath);
      if (parentTempFolder.includes('temp_extract_')) {
        console.log(`📁 Cleaning up parent temp folder: ${parentTempFolder}`);
        await fs.remove(parentTempFolder);
      }
      
      // Also clean up the top-level unique temp folder
      const topLevelTempFolder = path.dirname(parentTempFolder);
      if (topLevelTempFolder.includes('temp_extract_')) {
        console.log(`📁 Cleaning up top-level temp folder: ${topLevelTempFolder}`);
        await fs.remove(topLevelTempFolder);
      }
    } else {
      console.log(`📁 Keeping folder (not temporary): ${tempFolderPath}`);
    }
    
    return organizedPaths;
  }
  
  /**
   * Recursively copy all .sto files from source to destination
   */
  private static async copyAllStoFiles(sourcePath: string, destPath: string, teamName: string): Promise<void> {
    const items = await fs.readdir(sourcePath);
    
    for (const item of items) {
      const itemPath = path.join(sourcePath, item);
      const stat = await fs.stat(itemPath);
      
      if (stat.isDirectory()) {
        // Recursively copy from subdirectories
        await this.copyAllStoFiles(itemPath, destPath, teamName);
      } else if (item.toLowerCase().endsWith('.sto')) {
        // Copy .sto files directly
        const destFilePath = path.join(destPath, item);
        console.log(`📁 Copying .sto file to ${teamName}: ${itemPath} -> ${destFilePath}`);
        await fs.copy(itemPath, destFilePath);
      } else {
        console.log(`⏭️ Skipping non-.sto file: ${item}`);
      }
    }
  }

  /**
   * Get the default download path for setups
   */
  static getDefaultDownloadPath(): string {
    return path.join(process.cwd(), 'downloads');
  }
}
