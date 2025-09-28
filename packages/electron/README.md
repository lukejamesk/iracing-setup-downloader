# P1Doks Downloader - Electron Package

A Windows desktop application for the P1Doks downloader built with Electron and React. This is the primary and recommended interface for using the P1Doks downloader.

**⚠️ Windows Only**: This application currently only works on Windows 10/11.

## Features

- **Windows Desktop GUI**: Native Windows desktop application using Electron
- **Modern React UI**: Built-in React components with Material-UI design system
- **Service Selection**: Choose from P1Doks and future racing services
- **Interactive Forms**: Configuration forms with validation and auto-completion
- **Real-time Progress**: Live download progress tracking and status updates
- **Settings Management**: Customizable backgrounds, folder selection, and preferences
- **File Management**: Downloaded files tree view and folder management
- **Core Integration**: Uses the `@p1doks-downloader/p1doks-download` package for download functionality
- **Hot Reloading**: Development mode with hot reloading for UI changes

## Development

### Prerequisites

- **Windows 10/11** (required - application only works on Windows)
- Node.js 18+
- npm 8+

### Setup

```bash
# Install dependencies (from monorepo root)
npm install

# Build the application
npm run build:electron

# Start the application
npm run electron
```

### Development Mode

**For development with hot reloading (recommended):**

```bash
# Terminal 1: Start UI dev server
npm run dev:ui

# Terminal 2: Start Electron (loads from dev server)
npm run dev
```

This will:
- Start the UI dev server on port 5173 with hot reloading
- Start Electron which loads from the dev server
- Open the app with developer tools

**For simple development (no hot reloading):**

```bash
# Builds UI once and starts Electron
npm run dev
```

This will:
- Build the UI and start the Electron main process
- Load the UI from the built files
- Open the app with developer tools

## Project Structure

```
packages/electron/
├── src/                    # Main process (Electron) and UI
│   ├── main.ts            # Main Electron process
│   ├── preload.ts         # Preload script for secure IPC
│   ├── ipc-handlers.ts    # IPC communication handlers
│   ├── window-manager.ts  # Window management utilities
│   ├── app-lifecycle.ts   # Application lifecycle management
│   └── ui/                # React UI components and pages
│       ├── components/    # React components
│       │   ├── common/    # Shared components (TitleBar, DownloadLog, etc.)
│       │   ├── form/      # Form components (P1DoksDownloadPage, etc.)
│       │   ├── settings/  # Settings components
│       │   └── service/   # Service selection components
│       ├── contexts/      # React contexts for state management
│       ├── hooks/         # Custom React hooks
│       ├── types/         # TypeScript type definitions
│       ├── App.tsx        # Main React component
│       ├── main.tsx       # React entry point
│       ├── index.html     # HTML template
│       ├── vite.config.ts # Vite configuration
│       └── tsconfig.json  # TypeScript config for UI
├── public/                # Static assets (logos, backgrounds)
├── dist/                  # Built main process
├── ui-dist/               # Built UI files
├── package.json
└── tsconfig.json          # TypeScript config for main process
```

## Scripts

- `npm run build` - Build the UI and main process
- `npm run build:ui` - Build only the UI
- `npm run dev:ui` - Start UI development server with hot reloading
- `npm run dev` - Build UI and start Electron
- `npm run start` - Build and start the application
- `npm run clean` - Clean build artifacts

## Integration with Core

The Electron app integrates with the core downloader functionality through the `@p1doks-downloader/p1doks-download` package. This allows the GUI to:

- Use the same download logic as the CLI
- Maintain consistency across different interfaces
- Share configuration and setup functionality

## Current Status

The Electron application is the primary interface for the P1Doks downloader and includes:

- ✅ Service selection interface
- ✅ Interactive configuration forms with validation
- ✅ Real-time download progress tracking
- ✅ Settings management with custom backgrounds
- ✅ File management and folder selection
- ✅ Modern Material-UI design system
- ✅ Context-based state management
- ✅ Custom React hooks for common functionality

## Future Enhancements

- Additional racing service integrations
- Enhanced download management features
- Advanced settings and customization options
- Log viewing and debugging tools
- Performance optimizations
