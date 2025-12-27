import { WeatherService } from '../utils/weatherService.js';

// DOM Elements
const els = {
  loc: document.getElementById('location-name'),
  icon: document.getElementById('main-icon'),
  temp: document.getElementById('current-temp'),
  feels: document.getElementById('feels-like'),
  ai: document.getElementById('ai-text'),
  hourly: document.getElementById('hourly-list'),
  daily: document.getElementById('daily-list'),
  uv: document.getElementById('uv-index'),
  humid: document.getElementById('humidity'),
  wind: document.getElementById('wind-speed'),
  precip: document.getElementById('precip-prob'),
  updated: document.getElementById('last-updated')
};

// Weather Code to Emoji Map
const weatherMap = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 61: '🌧️', 80: '🌧️',
  71: '❄️', 95: '⛈️'
};

function getIcon(code) {
  return weatherMap[code] || '🌥️';
}

async function init() {
  try {
    // Show loading state
    els.loc.textContent = "Updating...";
    
    // Fetch Data (Service handles cache)
    const data = await WeatherService.getWeatherData();
    
    render(data);
    
  } catch (err) {
    els.loc.textContent = "Error";
    els.ai.textContent = "Could not fetch weather data. Check connection.";
    console.error(err);
  }
}

function render(data) {
  const current = data.current;
  const today = data.daily[0];

  // Header & Hero
  els.loc.textContent = "Current Location"; // In real app, perform reverse geocoding here
  els.temp.textContent = `${current.temp}°`;
  els.feels.textContent = `${current.feels_like}`;
  els.icon.textContent = getIcon(current.code);

  // AI Report
  els.ai.textContent = WeatherService.generateAIReport(data);

  // Stats Grid
  els.uv.textContent = today.uv;
  els.humid.textContent = `${current.humidity}%`;
  els.wind.textContent = `${current.wind} km/h`;
  els.precip.textContent = `${today.rain_prob}%`;

  // Hourly Strip
  els.hourly.innerHTML = '';
  data.hourly.forEach(h => {
    const div = document.createElement('div');
    div.className = 'hourly-item';
    div.innerHTML = `
      <span>${h.time}</span>
      <span>${getIcon(h.code)}</span>
      <span>${h.temp}°</span>
    `;
    els.hourly.appendChild(div);
  });

  // Daily List
  els.daily.innerHTML = '';
  data.daily.slice(1, 6).forEach(d => {
    const row = document.createElement('div');
    row.className = 'forecast-row';
    row.innerHTML = `
      <span>${d.day}</span>
      <span>${getIcon(d.code)} ${d.max}° / ${d.min}°</span>
    `;
    els.daily.appendChild(row);
  });

  els.updated.textContent = new Date().toLocaleTimeString();
}

// Settings Button
document.getElementById('settings-btn').addEventListener('click', () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options/options.html'));
  }
});

init();