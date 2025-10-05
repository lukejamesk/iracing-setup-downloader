# iRacing Setup Downloader

A Windows desktop application for downloading and managing iRacing setups. Built with Electron and React, providing a modern graphical user interface.

**⚠️ Electron App**: The desktop application currently only works on Windows 10/11. However, the CLI works cross-platform on Windows, Linux, and macOS.

## Packages

- **@iracing-setup-downloader/p1doks-download** - Core downloader functionality
- **@iracing-setup-downloader/hymo-download** - Hymo/TrackTitan downloader functionality
- **@iracing-setup-downloader/cli** - Cross-platform command-line interface
- **@iracing-setup-downloader/electron** - Windows desktop application with integrated React UI (primary interface)

## Getting Started

### Prerequisites

- **Windows 10/11** (required for Electron desktop app)
- **Node.js 18+** (required for all interfaces)
- **npm 8+** (required for all interfaces)
- **Cross-platform support**: CLI works on Windows, Linux, and macOS

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

The CLI package provides a cross-platform command-line interface for the iRacing setup downloader that works on Windows, Linux, and macOS:

```bash
# Interactive setup wizard
cd packages/cli && npm start -- setup

# Download setups with command line options (use quotes for values with spaces)
cd packages/cli && npm start -- download --email user@example.com --password secret --series "GT Sprint" --season "1" --week "1" --team "My Team" --year 2025

# Download with series names containing spaces
cd packages/cli && npm start -- download --email user@example.com --password secret --series "Porsche Cup" --team "My Racing Team" --season "2" --week "3" --year "2025"
```

**Note**: Always use quotes around arguments that contain spaces:
- **PowerShell**: Use single quotes `'Porsche Cup'`, `'My Racing Team'`
- **Command Prompt/Bash**: Use double quotes `"Porsche Cup"`, `"My Racing Team"`

## Core Packages

### P1Doks Download Package

The core package (`@iracing-setup-downloader/p1doks-download`) contains the main iRacing setup downloader functionality as a library. It's designed to be used by other packages (like the Electron app) rather than run directly.

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

await runDownload(config);
```

### Hymo Download Package

The Hymo package (`@iracing-setup-downloader/hymo-download`) provides functionality to download setup files from Hymo (TrackTitan) for iRacing.

**Environment Variables Required for Testing:**
- `HYMO_LOGIN`: Your Hymo/TrackTitan login email
- `HYMO_PASSWORD`: Your Hymo/TrackTitan password

```bash
# Set environment variables
export HYMO_LOGIN="your-email@example.com"
export HYMO_PASSWORD="your-password"

# Run the test
cd packages/hymo-download && npm test
```

## Configuration

The CLI supports configuration through:

1. **Command-line arguments** (recommended)
2. **Configuration file** (for automation)
3. **Interactive setup wizard**

### Configuration File

The CLI uses a configuration file located at `~/.config/iracing-setup-downloader/config.json` by default. You can specify a custom path using the `--config` option. You can create this file using the interactive setup:

```bash
# Create config in default location
iracing-setup-downloader setup

# Create config in custom location
iracing-setup-downloader setup --config /path/to/custom/config.json
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

The CLI automatically remembers the last used Series, Season, Week, and Year values for convenience. When you run `iracing-setup-downloader download` without specifying these parameters, it will use the values from your last successful download.

**Priority order:**

1. Command line options (highest priority)
2. Last used values (from previous downloads)
3. Config file defaults (lowest priority)

This means you can:

- Run `iracing-setup-downloader download` to repeat your last download
- Override specific values: `iracing-setup-downloader download --season 2` (uses last used series, week, year)
- Always override with full command line options

## Desktop Application (Primary Interface)

The main application is a Windows desktop app built with Electron and React. This is the recommended way to use the iRacing setup downloader:

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

The Electron app provides a modern graphical interface for downloading iRacing setups, with features like:
- Service selection interface (iRacing setup services)
- Interactive configuration forms with validation
- Real-time download progress tracking
- Download history and logs
- Settings management with custom backgrounds
- File management and folder selection
- Modern Material-UI design

## Project Structure

```
├── packages/
│   ├── p1doks-download/    # Core downloader functionality
│   ├── hymo-download/      # Hymo/TrackTitan downloader functionality
│   ├── cli/                # CLI application
│   └── electron/           # Desktop application with integrated React UI
│       ├── src/
│       │   ├── ui/         # React UI components and pages
│       │   │   ├── components/  # React components (forms, settings, etc.)
│       │   │   ├── contexts/    # React contexts for state management
│       │   │   └── hooks/       # Custom React hooks
│       │   └── ...         # Electron main process files
│       ├── public/         # Static assets (logos, backgrounds)
│       └── ui-dist/        # Built UI files
├── package.json            # Root workspace configuration
└── README.md
```
