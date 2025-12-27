import { fetchWeatherData, updateLocation } from '../utils/weatherService.js';
import { generateSummary } from '../utils/aiService.js';

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  try {
    // 1. Ensure Location (Critical for first run)
    // We try to verify if we have coords, if not, we force update
    try {
      await updateLocation(); // This requests permission in Popup context
    } catch (e) {
      console.warn("Location update failed or denied", e);
      // Continue to try fetching - might use default or stored
    }

    // 2. Fetch Data
    const data = await fetchWeatherData();

    // 3. Render Weather
    renderCurrent(data);
    renderHourly(data.hourly);
    renderDaily(data.daily);
    renderStats(data);

    // 4. Generate & Render AI Summary
    renderAI("Thinking...");
    const summary = await generateSummary(data);
    renderAI(summary);

    // 5. Update City Name (Reverse Geo or custom)
    // For now, we use a placeholder or check storage for custom name
    // Could use a free reverse geo API if we had one in instructions, but prompt said "Custom Location" input in settings logic.
    // We'll read from storage if available.
    chrome.storage.local.get(['customCity'], (res) => {
      if (res.customCity) {
        document.getElementById('cityName').textContent = res.customCity;
      } else {
        // Default "My Location" if no custom city
        document.getElementById('cityName').textContent = "My Location";
      }
    });

  } catch (error) {
    console.error(error);
    renderError(error);
  }
}

function renderCurrent(data) {
  document.getElementById('currentTemp').textContent = `${data.temp}°`;
  document.getElementById('feelsLike').textContent = `Feels like ${data.feels_like}°`;
  document.getElementById('heroIcon').textContent = getWeatherIcon(data.weather_code);
}

function renderHourly(hourlyData) {
  const container = document.getElementById('hourlyList');
  container.innerHTML = '';

  hourlyData.forEach(hour => {
    const el = document.createElement('div');
    el.className = 'hourly-item';

    // Parse time (ISO) to HH:MM or Just Hour
    const date = new Date(hour.time);
    const timeStr = date.getHours() + ':00';

    el.innerHTML = `
      <span class="hour-time">${timeStr}</span>
      <span class="hour-icon">${getWeatherIcon(hour.code)}</span>
      <span class="hour-temp">${hour.temp}°</span>
    `;
    container.appendChild(el);
  });
}

function renderDaily(dailyData) {
  const container = document.getElementById('dailyList');
  container.innerHTML = '';

  dailyData.forEach(day => {
    const el = document.createElement('div');
    el.className = 'daily-row glass'; // Added glass for list items too? Or just keep clean. Reverting to row only to avoid double box.
    el.className = 'daily-row';

    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

    el.innerHTML = `
      <span class="day-name">${dayName}</span>
      <span class="day-icon">${getWeatherIcon(day.code)}</span>
      <div class="day-temps">
        <span class="temp-max">${day.max}°</span>
        <span class="temp-min">${day.min}°</span>
      </div>
    `;
    container.appendChild(el);
  });
}

function renderStats(data) {
  document.getElementById('uvIndex').textContent = data.uv_index;
  document.getElementById('humidity').textContent = `${data.humidity}%`;
  document.getElementById('windSpeed').textContent = `${data.wind_speed} km/h`;
  // OpenMeteo current object doesn't always have precip chance % easily in 'current', 
  // sometimes requires hourly processing. We used precipitation amount in fetch, but label says %.
  // For safety, let's just use what we have or placeholder.
  // Actually we fetched `precipitation` (mm). Let's just show that or -- 
  document.getElementById('precip').textContent = "--";
}

function renderAI(text) {
  const el = document.getElementById('aiSummary');
  if (el) {
    // Typewriter effect could go here, but simple text for now
    el.textContent = text;
  }
}

function renderError(err) {
  document.getElementById('cityName').textContent = "Error";
  document.getElementById('aiSummary').textContent = "Could not load weather data. " + err.message;
}

// Simple Icon Mapper
function getWeatherIcon(code) {
  // WMO Weather interpretation codes (WW)
  // 0: Clear sky
  // 1, 2, 3: Mainly clear, partly cloudy, and overcast
  // 45, 48: Fog
  // 51, 53, 55: Drizzle
  // 61, 63, 65: Rain
  // 71, 73, 75: Snow
  // 95, 96, 99: Thunderstorm

  if (code === 0) return '☀️';
  if (code >= 1 && code <= 3) return '⛅';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code >= 95) return '⛈️';
  return '🌡️';
}