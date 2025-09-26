# @p1doks-downloader/cli

Command-line interface for the P1Doks downloader.

## Installation

```bash
npm install -g @p1doks-downloader/cli
```

## Usage

### Quick Start

```bash
# Interactive setup wizard
npm start -- setup

# Download setups
npm start -- download
```

### Command Options

#### Download Command

```bash
p1doks download [options]
```

Options:

- `-e, --email <email>` - P1Doks email
- `-p, --password <password>` - P1Doks password
- `-s, --series <series>` - Series name (e.g., "GT Sprint")
- `--season <season>` - Season (e.g., "1")
- `--week <week>` - Week (e.g., "1")
- `-t, --team <team>` - Team name
- `-y, --year <year>` - Year (e.g., "2025")
- `--headless` - Run in headless mode
- `-c, --config <path>` - Path to config file

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
  "teamName": "Your Team",
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

### Examples

```bash
# Download with command line options
p1doks download --email user@example.com --password secret --series "GT Sprint" --season "1" --week "1" --team "My Team" --year 2025

# Download with default config file
p1doks download

# Download using last used values (convenient for repeated downloads)
p1doks download --email user@example.com --password secret

# Override specific values while using last used for others
p1doks download --email user@example.com --password secret --season 2

# Download with custom config file
p1doks download --config /path/to/custom/config.json

# Interactive setup (default location)
p1doks setup

# Interactive setup (custom location)
p1doks setup --config /path/to/custom/config.json

# Show current configuration
p1doks config

# Show configuration from custom file
p1doks config --config /path/to/custom/config.json

# Run in non-headless mode (shows browser)
p1doks download --headless=false
```

## Development

```bash
# Build the CLI
npm run build

# Run in development mode
npm run dev

# Clean build artifacts
npm run clean
```
