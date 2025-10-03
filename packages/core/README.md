# @iracing-setup-downloader/p1doks-download

Core functionality for downloading and managing iRacing setups.

## Features

- Download setups from p1doks.com
- Configurable filtering by series, seasons, and weeks
- Automatic folder structure organization
- TypeScript support with full type definitions

## Usage

### As a Library

```typescript
import {runDownload, Config} from "@iracing-setup-downloader/p1doks-download";

const config: Config = {
  email: "user@example.com",
  password: "password",
  series: "GT Sprint",
  season: "1",
  week: "1",
  teamName: "My Team",
  year: "2025",
  runHeadless: true,
};

// Download setups
await runDownload(config);
```

### Lower-level API

```typescript
import {downloadSetups, Config} from "@iracing-setup-downloader/p1doks-download";
import {chromium} from "playwright";

const config: Config = {
  /* ... */
};
const browser = await chromium.launch({headless: config.runHeadless});
const context = await browser.newContext();
const page = await context.newPage();

await downloadSetups(browser, context, page, config);
```

## Configuration

The `Config` type defines all required and optional parameters:

```typescript
type Config = {
  email: string; // iRacing email
  password: string; // iRacing password
  series: string; // Series name (e.g., "GT Sprint")
  season: string; // Season (e.g., "1")
  week: string; // Week (e.g., "1")
  teamName: string; // Team name for folder structure
  year: string; // Current year
  runHeadless?: boolean; // Run browser in headless mode (default: true)
};
```

## Development

```bash
# Build the package
npm run build

# Watch mode for development
npm run dev

# Clean build artifacts
npm run clean
```
