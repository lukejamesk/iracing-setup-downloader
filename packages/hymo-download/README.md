# Hymo Download Package

This package provides functionality to download setup files from Hymo (TrackTitan) for iRacing.

## Environment Variables

The following environment variables are required for testing:

- `HYMO_LOGIN`: Your Hymo/TrackTitan login email
- `HYMO_PASSWORD`: Your Hymo/TrackTitan password

## Usage

### Testing

To run the test script:

```bash
# Set environment variables
export HYMO_LOGIN="your-email@example.com"
export HYMO_PASSWORD="your-password"

# Run the test
npm test
```

### Building

```bash
npm run build
```

## Configuration

The test configuration can be modified in `src/test-login.ts`:

- `series`: The iRacing series to download setups for
- `season`: The season number
- `year`: The year
- `week`: The week number
- `selectedTeams`: Array of team names to organize setups for
- `downloadPath`: Directory to save downloaded setups
- `runHeadless`: Whether to run browser in headless mode
- `mappings`: Track name mappings from Hymo to iRacing

## Folder Structure

Downloaded setups are organized in the following structure:

```
{downloadPath}/{car}/{team}/{year} Season {season}/{track}/hymo/
```

Example:
```
C:\Users\user\Downloads\setups\mercedesamgevogt3\Garage 61\2025 Season 4\mexicocity_gp\hymo\
```