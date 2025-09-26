# P1Doks Downloader - Electron Package

A desktop application wrapper for the P1Doks downloader built with Electron.

## Features

- **Desktop GUI**: Native desktop application using Electron
- **UI Integration**: Loads the `@p1doks-downloader/ui` package
- **Core Integration**: Uses the `@p1doks-downloader/core` package for download functionality

## Development

### Prerequisites

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

```bash
# Run in development mode (with hot reload)
npm run dev:electron
```

This will:

- Start the Electron main process in watch mode
- Load the UI from the development server (requires UI dev server to be running)
- Open the app with developer tools

**Note**: For development, you need to run both the UI and Electron packages:

```bash
# Terminal 1: Start UI dev server
npm run ui

# Terminal 2: Start Electron
npm run dev:electron
```

## Project Structure

```
packages/electron/
├── src/                    # Main process (Electron)
│   ├── main.ts            # Main Electron process
│   └── preload.ts         # Preload script for secure IPC
├── dist/                  # Built main process
├── package.json
└── tsconfig.json          # TypeScript config for main process
```

## Scripts

- `npm run build` - Build the main process
- `npm run dev` - Run main process in watch mode
- `npm run start` - Build and start the application
- `npm run clean` - Clean build artifacts

## Integration with Core

The Electron app integrates with the core downloader functionality through the `@p1doks-downloader/core` package. This allows the GUI to:

- Use the same download logic as the CLI
- Maintain consistency across different interfaces
- Share configuration and setup functionality

## Future Enhancements

- Configuration management UI
- Download progress tracking
- Setup file management
- Settings and preferences
- Log viewing and debugging tools
