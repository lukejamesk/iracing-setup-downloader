# P1Doks Downloader - UI Package

A React-based user interface for the P1Doks downloader.

## Features

- **React Frontend**: Modern React interface with TypeScript
- **Material-UI Components**: Professional UI components and theming
- **Configuration Form**: Complete form for all download settings
- **Download Progress Log**: Real-time log display showing download progress
- **localStorage Integration**: Automatically saves and loads configuration
- **Electron Integration**: Seamless integration with Electron via IPC
- **Vite Build System**: Fast development and production builds
- **Standalone Package**: Can be used independently or with Electron

## Development

### Prerequisites

- Node.js 18+
- npm 8+

### Setup

```bash
# Install dependencies (from monorepo root)
npm install

# Build the UI
npm run build:ui

# Run development server
npm run ui
```

### Development Mode

```bash
# Run in development mode (with hot reload)
npm run dev:ui
```

This will start the React development server on port 5173.

## Project Structure

```
packages/ui/
├── src/
│   ├── App.tsx        # Main React component
│   ├── main.tsx       # React entry point
│   └── index.css      # Global styles
├── dist/              # Built files
├── index.html         # HTML template
├── package.json
├── tsconfig.json      # TypeScript config
├── tsconfig.node.json # Node TypeScript config
└── vite.config.ts     # Vite config
```

## Scripts

- `npm run build` - Build for production
- `npm run dev` - Run development server
- `npm run preview` - Preview production build
- `npm run clean` - Clean build artifacts

## Integration

This UI package is designed to work with:

- **Electron**: Desktop application wrapper
- **Web Browser**: Standalone web application
- **Core Package**: Backend functionality via IPC or API calls

## Configuration Fields

The UI provides a comprehensive form with the following fields:

- **Email**: P1Doks account email
- **Password**: P1Doks account password
- **Series**: Racing series name (e.g., "GT Sprint")
- **Season**: Season number (e.g., "1")
- **Week**: Week number (e.g., "1")
- **Year**: Year (e.g., "2025")
- **Team Name**: Team name (e.g., "Garage 61 - LK Racing")
- **Headless Mode**: Toggle for browser visibility

## Integration

- **Electron**: Uses IPC to communicate with the main process for downloads
- **Browser**: Falls back to simulation mode when not in Electron
- **localStorage**: Automatically persists configuration between sessions
- **Progress Logging**: Real-time progress updates via IPC in Electron mode

## Download Log

The UI includes a real-time download log that shows:

- **Login Progress**: Authentication status and success
- **Filter Application**: Series, season, week, and year filtering
- **Setup Discovery**: Number of setup cards found
- **File Downloads**: Individual file download progress
- **Save Operations**: File save confirmations
- **Completion Status**: Overall download completion

The log displays with color-coded entries:

- 🔵 **Info**: General progress updates
- 🟢 **Success**: Successful operations
- 🔴 **Error**: Error messages and failures

## Future Enhancements

- Download progress tracking
- Setup file management
- Settings and preferences
- Log viewing and debugging tools
- Advanced configuration options
