# Changelog

All notable changes to the **AtmoSphere AI** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Planned
- **Theme Customization**: Allow users to pick custom accent colors (Purple, Green, etc.).
- **Graph View**: A line chart visualization for temperature trends over the next 24 hours.

## [1.1.0] - 2025-12-27
### Added
- **Smart Alerts**: Background rain detection. The extension now sends a system notification if rain is forecasted in the next hour (checks every 20 minutes).
- **Settings Dashboard**: A completely redesigned, tabbed `options.html` page.
- **Unit Conversion**: Added support for **Fahrenheit (°F)** and **Miles (mph)**.
- **System Reset**: Added a "Factory Reset" button to clear corrupted cache or stuck location data.
- **Wind Units**: Added support for Meters per second (m/s) for scientific users.

### Changed
- **Permissions**: Added `notifications` permission to `manifest.json`.
- **Weather Service**: Refactored `getWeatherData` to include a post-processing step for unit conversion.
- **Badge Logic**: The extension badge color now dynamically shifts based on 3 temperature thresholds (Cold/Mild/Hot).

### Fixed
- Fixed an issue where the badge text would sometimes show "..." indefinitely if the API call failed.

## [1.0.0] - 2025-12-26
### Initial Release
- **Core Engine**: Manifest V3 Service Worker implementation with `chrome.alarms` for background updates.
- **Weather Data**: Integration with Open-Meteo API (Current, Hourly, Daily, UV, AQI).
- **Geolocation**: Smart location detection using `navigator.geolocation` with fallback to London.
- **Reverse Geocoding**: Integrated BigDataCloud API to convert GPS coordinates into City Names.
- **Search**: Added a manual city search overlay with autocomplete.
- **AI Integration**: Placeholder logic for AI Weather Summaries (supports OpenAI API key integration).
- **UI**: Glassmorphism design system with dark mode default.
- **Caching**: Implemented `chrome.storage.local` caching strategy (15-minute TTL) to prevent API rate limiting.