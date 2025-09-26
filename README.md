# P1Doks Downloader

A Windows desktop application for downloading and managing P1Doks setups for iRacing. Built with Electron and React, providing both a graphical user interface and command-line interface.

## Packages

- **@p1doks-downloader/core** - Core downloader functionality
- **@p1doks-downloader/cli** - Command-line interface
- **@p1doks-downloader/electron** - Windows desktop application with integrated React UI

## Getting Started

### Prerequisites

- **Windows 10/11** (required)
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

## Desktop Application (Windows Only)

The main application is a Windows desktop app built with Electron and React:

### Running the Desktop App

```bash
# Run the desktop application
npm run electron

# Run in development mode (requires UI dev server)
npm run dev:electron
```

### Development Workflow

**For development with hot reloading (recommended):**

```bash
# Terminal 1: Start UI dev server
npm run dev:ui

# Terminal 2: Start Electron (will load from dev server if running)
npm run dev:electron
```

**For simple development (no hot reloading):**

```bash
# Builds UI once and starts Electron
npm run dev:electron
```

The Electron app provides a modern graphical interface for downloading P1Doks setups, with features like:
- Interactive configuration form
- Real-time download progress
- Download history and logs
- Automatic credential management

## Project Structure

```
├── packages/
│   ├── core/           # Core downloader functionality
│   ├── cli/            # CLI application
│   └── electron/       # Desktop application with integrated React UI
│       ├── src/
│       │   ├── ui/     # React UI components and pages
│       │   └── ...     # Electron main process files
│       └── ui-dist/    # Built UI files
├── package.json        # Root workspace configuration
└── README.md
```
