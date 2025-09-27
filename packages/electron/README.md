# P1Doks Downloader - Electron Package

A Windows desktop application for the P1Doks downloader built with Electron and React.

## Features

- **Windows Desktop GUI**: Native Windows desktop application using Electron
- **Integrated React UI**: Built-in React components and pages for the user interface
- **Core Integration**: Uses the `@p1doks-downloader/p1doks-download` package for download functionality
- **Windows-Only**: Optimized specifically for Windows 10/11
- **Hot Reloading**: Development mode with hot reloading for UI changes

## Development

### Prerequisites

- **Windows 10/11** (required)
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
│   └── ui/                # React UI components and pages
│       ├── components/    # React components
│       ├── hooks/         # React hooks
│       ├── App.tsx        # Main React component
│       ├── main.tsx       # React entry point
│       ├── index.html     # HTML template
│       ├── vite.config.ts # Vite configuration
│       └── tsconfig.json  # TypeScript config for UI
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

## Future Enhancements

- Configuration management UI
- Download progress tracking
- Setup file management
- Settings and preferences
- Log viewing and debugging tools
