# AtmoSphere AI 🌦️

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg) ![Manifest](https://img.shields.io/badge/Manifest-V3-orange)

**AtmoSphere AI** is a next-generation Chrome Extension that combines precise weather data with AI-generated daily briefings. Built on Manifest V3, it features a persistent background service worker for live badge updates, geolocation support, and a glassmorphism UI.

## ✨ Features

* **Always-On Badge**: Displays live temperature on the browser icon (updates every 20 mins in background).
* **Smart Location**: Auto-detects GPS location or allows manual city search (Reverse & Forward Geocoding).
* **AI Briefings**: Generates witty, human-readable weather summaries.
* **Data-Heavy UI**: Hourly forecast, 7-day outlook, UV Index, Humidity, and Air Quality.
* **Privacy First**: No external tracking; all API keys and location data are stored in `chrome.storage.local`.

## 🚀 Installation (Developer Mode)

1.  Clone this repository or download the ZIP.
2.  Open Chrome and navigate to `chrome://extensions`.
3.  Toggle **Developer mode** (top right).
4.  Click **Load unpacked**.
5.  Select the `AtmoSphereAI` folder.

## 🛠️ Configuration

Out of the box, the weather and geocoding features work **free without API keys** (using Open-Meteo).

To enable the **AI News Generation**:
1.  Right-click the extension icon and select **Options**.
2.  Enter your **OpenAI API Key** (optional).
3.  *Note: If no key is provided, the extension falls back to a rule-based summary system.*

## 📂 Project Structure

```text
AtmoSphereAI/
├── manifest.json        # Extension configuration (Permissions: alarms, storage, geo)
├── background.js        # Service Worker (Alarm listener & Badge updater)
├── popup/               # Main Dashboard UI
│   ├── popup.html
│   ├── popup.css        # Glassmorphism styling
│   └── popup.js         # UI Logic & DOM Manipulation
├── options/             # Settings Page
├── utils/
│   └── weatherService.js # Singleton for API calls, Caching, and Geocoding
└── icons/               # App assets