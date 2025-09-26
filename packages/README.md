# Packages

This directory contains all the packages in the P1Doks downloader monorepo.

## Current Packages

### @p1doks-downloader/core

Core functionality for downloading and managing P1Doks setups. Contains the main business logic, page objects, and utilities.

## Planned Packages

### @p1doks-downloader/cli

Command-line interface application that provides a user-friendly CLI for the core functionality.

### @p1doks-downloader/ui

React web application that provides a modern web interface for downloading and managing setups.

### @p1doks-downloader/electron

Desktop application built with Electron that provides a native desktop experience.

## Package Dependencies

```
core (no dependencies on other packages)
├── cli (depends on core)
├── ui (depends on core)
└── electron (depends on core)
```

All packages depend on the core package, but packages don't depend on each other to maintain clear separation of concerns.
