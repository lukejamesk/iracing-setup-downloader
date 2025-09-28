# @p1doks-downloader/cli

Cross-platform command-line interface for the P1Doks downloader. Works on Windows, Linux, and macOS.

## Installation

```bash
npm install -g @p1doks-downloader/cli
```

## Cross-Platform Support

The CLI works on all major operating systems:
- **Windows**: Full support with Windows-specific optimizations
- **Linux**: Full support with Linux-specific optimizations  
- **macOS**: Full support with macOS-specific optimizations

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
# Download with command line options (use quotes for values with spaces)
p1doks download --email user@example.com --password secret --series "GT Sprint" --season "1" --week "1" --team "My Team" --year 2025

# Download with series names containing spaces (PowerShell - use underscores, recommended)
p1doks download --email user@example.com --password secret --series Porsche_Cup --team My_Racing_Team --season 2 --week 3 --year 2025

# Download with series names containing spaces (PowerShell - use single quotes)
p1doks download --email user@example.com --password secret --series 'Porsche Cup' --team 'My Racing Team' --season '2' --week '3' --year '2025'

# Download with series names containing spaces (Command Prompt/Bash - use double quotes)
p1doks download --email user@example.com --password secret --series "Porsche Cup" --team "My Racing Team" --season "2" --week "3" --year "2025"

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

### Important Notes

- **Use quotes for values with spaces**: Always wrap arguments containing spaces in quotes
  - ✅ **PowerShell**: Use single quotes `--series 'Porsche Cup'`
  - ✅ **Command Prompt/Bash**: Use double quotes `--series "Porsche Cup"`
  - ❌ `--series Porsche Cup` (will be parsed as two separate arguments)

- **PowerShell Users**: Use underscores instead of spaces to avoid quote issues
  - ✅ `--series Porsche_Cup --team My_Racing_Team` (recommended for PowerShell)
  - ✅ `--series 'Porsche Cup' --team 'My Racing Team'` (alternative)
  - ⚠️ `--series "Porsche Cup"` (may show as `'^Porsche^ Cup^'` in logs)

## Default Car Mappings

The CLI includes the same default car mappings as the UI, covering all major GT3 cars:

- Acura NSX GT3 EVO 22 → `acuransxevo22gt3`
- Audi R8 LMS GT3 EVO II → `audir8lmsevo2gt3`
- BMW M4 GT3 → `bmwm4gt3`
- Chevrolet Corvette Z06 GT3.R → `chevyvettez06rgt3`
- Ferrari 296 GT3 → `ferrari296gt3`
- Ford Mustang GT3 → `fordmustanggt3`
- Lamborghini Huracán GT3 EVO → `lamborghinievogt3`
- McLaren 720S GT3 EVO → `mclaren720sgt3`
- Mercedes-AMG GT3 2020 → `mercedesamgevogt3`
- Porsche 911 GT3 R (992) → `porsche992rgt3`
- Aston Martin GT3 → `amvantageevogt3`

These mappings are automatically included when using the CLI and can be overridden in your config file if needed.

## Development

```bash
# Build the CLI
npm run build

# Run in development mode
npm run dev

# Clean build artifacts
npm run clean
```
