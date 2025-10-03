# Packages

This directory contains all the packages in the iRacing setup downloader monorepo.

## Current Packages

### @iracing-setup-downloader/p1doks-download

Core functionality for downloading and managing iRacing setups. Contains the main business logic, page objects, and utilities. This package provides the core download functionality used by other packages.

### @iracing-setup-downloader/cli

Cross-platform command-line interface application that provides a user-friendly CLI for the core functionality. Works on Windows, Linux, and macOS.

### @iracing-setup-downloader/electron

Desktop application built with Electron that provides a native desktop experience for Windows users. This is the primary and recommended interface for using the iRacing setup downloader.

**Features:**
- Modern React-based UI with Material-UI components
- Service selection interface (iRacing setup services)
- Interactive configuration forms with validation
- Real-time download progress tracking
- Settings management with custom backgrounds
- File management and folder selection
- Windows-only application

## Package Dependencies

```
p1doks-download (no dependencies on other packages)
├── cli (depends on p1doks-download)
└── electron (depends on p1doks-download)
```

All packages depend on the core package (`p1doks-download`), but packages don't depend on each other to maintain clear separation of concerns. The Electron app is the primary interface for Windows users, while the CLI provides cross-platform functionality for all operating systems.
