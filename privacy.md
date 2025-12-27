# Privacy Policy for AtmoSphere AI

**Last Updated:** December 27, 2025

AtmoSphere AI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how our Chrome Extension handles your data.

## 1. Data Collection

### Location Data
We use your browser's Geolocation API (`navigator.geolocation`) solely to provide accurate local weather forecasts. 
* **Processing:** Your coordinates (Latitude/Longitude) are sent directly to the Open-Meteo API and BigDataCloud API.
* **Storage:** Your location is cached locally on your device using `chrome.storage.local` to improve performance. We do not store your location on our own servers.

### API Keys
If you provide an OpenAI API Key for the "AI News" feature, it is stored locally within your Chrome browser (`chrome.storage.local`). It is never transmitted to us or any third party other than OpenAI endpoints.

## 2. Third-Party Services
We utilize the following third-party APIs:
* **Open-Meteo**: For weather data retrieval.
* **BigDataCloud**: For converting coordinates into city names.

## 3. Data Retention
All data (cached weather, location, settings) is stored locally on your device. You can clear this data at any time by removing the extension.

## 4. Contact
For privacy concerns, please open an issue on our GitHub repository.