# P1Doks Downloader Monorepo

A monorepo containing multiple applications for downloading and managing P1Doks setups for iRacing.

## Packages

- **@p1doks-downloader/core** - Core downloader functionality
- **@p1doks-downloader/cli** - Command-line interface
- **@p1doks-downloader/ui** - React web interface (planned)
- **@p1doks-downloader/electron** - Desktop application (planned)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 8+

### Installation

```bash
# Install all dependencies
npm run install:all
```

### Development

```bash
# Build all packages
npm run build

# Clean all build artifacts
npm run clean
```

## CLI Package

The CLI package provides a command-line interface for the downloader:

```bash
# Interactive setup wizard
cd packages/cli && npm start -- setup

# Download setups with command line options
cd packages/cli && npm start -- download --email user@example.com --password secret --series "GT Sprint" --season "1" --week "1" --team "My Team" --year 2025
```

## Core Package

The core package contains the main downloader functionality as a library. It's designed to be used by other packages (like the CLI) rather than run directly.

```typescript
import {runDownload, Config} from "@p1doks-downloader/core";

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

await runDownload(config);
```

## Configuration

The CLI supports configuration through:

1. **Command-line arguments** (recommended)
2. **Configuration file** (for automation)
3. **Interactive setup wizard**

### Configuration File

The CLI uses a configuration file located at `~/.config/p1doks/config.json` by default. You can specify a custom path using the `--config` option. You can create this file using the interactive setup:

```bash
# Create config in default location
p1doks setup

# Create config in custom location
p1doks setup --config /path/to/custom/config.json
```

Or manually create the file with the following structure:

```json
{
  "email": "your@email.com",
  "password": "yourpassword",
  "series": "GT Sprint",
  "season": "1",
  "week": "1",
  "teamName": "your-team",
  "year": "2025",
  "runHeadless": true
}
```

### Last Used Values

The CLI automatically remembers the last used Series, Season, Week, and Year values for convenience. When you run `p1doks download` without specifying these parameters, it will use the values from your last successful download.

**Priority order:**

1. Command line options (highest priority)
2. Last used values (from previous downloads)
3. Config file defaults (lowest priority)

This means you can:

- Run `p1doks download` to repeat your last download
- Override specific values: `p1doks download --season 2` (uses last used series, week, year)
- Always override with full command line options

## Desktop GUI (Electron + UI)

The project includes a desktop GUI application with separate packages:

### UI Package (React)

```bash
# Run the UI development server
npm run ui

# Build the UI
npm run build:ui
```

### Electron Package

```bash
# Run the desktop application
npm run electron

# Run in development mode (requires UI dev server)
npm run dev:electron
```

**Development Workflow:**

```bash
# Terminal 1: Start UI dev server
npm run ui

# Terminal 2: Start Electron
npm run dev:electron
```

The Electron app loads the React UI package, providing a graphical interface for the same functionality available in the CLI.

## Project Structure

```
├── packages/
│   ├── core/           # Core downloader functionality
│   ├── cli/            # CLI application
│   ├── ui/             # React UI package
│   └── electron/       # Desktop application wrapper (Electron)
├── package.json        # Root workspace configuration
└── README.md
```
