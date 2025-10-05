import { Locator, Page } from "playwright-core";
import { load } from "../../util";
import { FileHandler } from "../../utils/file-handler";
import { Config } from "../../config";
import * as path from "path";
import * as fs from "fs-extra";

export class CarSetupPage {
  constructor(public page: Page) {}

  // Download Latest Version button
  get downloadLatestVersionButton(): Locator {
    return this.page.locator('button:has-text("Download Latest Version")');
  }

  // Download Manually button (appears in modal)
  get downloadManuallyButton(): Locator {
    return this.page.locator('button:has-text("Download Manually")');
  }

  // Method to download the setup file
  async downloadSetup(downloadPath?: string, selectedTeams?: string[], config?: Config): Promise<string> {
    console.log('📥 Starting setup download process...');
    
    // Set up download path
    const finalDownloadPath = downloadPath || FileHandler.getDefaultDownloadPath();
    
    // Click the "Download Latest Version" button
    console.log('🖱️ Clicking "Download Latest Version" button...');
    await this.downloadLatestVersionButton.click();
    
    // Wait for the modal to appear (reduced delay)
    await this.page.waitForTimeout(500);
    
    // Click the "Download Manually" button in the modal
    console.log('🖱️ Clicking "Download Manually" button in modal...');
    
    // Start waiting for download before clicking
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadManuallyButton.click();
    
    // Wait for download to complete
    console.log('⏳ Waiting for download to complete...');
    const download = await downloadPromise;
    
    // Save the download to the specified path with unique filename to avoid conflicts
    const originalFilename = download.suggestedFilename();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const uniqueFilename = `${timestamp}_${randomId}_${originalFilename}`;
    const downloadedPath = path.join(finalDownloadPath, uniqueFilename);
    await download.saveAs(downloadedPath);
    
    console.log(`📁 Downloaded file: ${downloadedPath}`);
    
    // Extract and organize the zip file with team information
    const organizedPaths = await FileHandler.extractAndOrganizeZip(downloadedPath, finalDownloadPath, selectedTeams, config);
    
    console.log('✅ Setup downloaded and organized successfully');
    
    return organizedPaths.join(', ');
  }

  // Method to get the page title or setup name for logging
  async getSetupName(): Promise<string> {
    try {
      // Try to get the page title or a setup name element
      const title = await this.page.title();
      return title || 'Unknown Setup';
    } catch (error) {
      console.log('⚠️ Could not get setup name:', error);
      return 'Unknown Setup';
    }
  }

  // Method to wait for page to load completely
  async waitForPageLoad(): Promise<void> {
    console.log('⏳ Waiting for car setup page to load...');
    
    // Wait for the download button to be visible
    await this.downloadLatestVersionButton.waitFor({ state: 'visible', timeout: 10000 });
    
    console.log('✅ Car setup page loaded successfully');
  }
}
