import { fetchWeatherData } from './utils/weatherService.js';

const ALARM_NAME = 'weatherUpdate';
const ALARM_INTERVAL_MIN = 20;

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('AtmoSphere AI Installed');
  setupAlarm();
  updateBadge(); // Initial fetch
});

// Setup Alarm
function setupAlarm() {
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: ALARM_INTERVAL_MIN
  });
}

// Listen for Alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    updateBadge();
  }
});

// Update Badge Visuals
async function updateBadge() {
  try {
    // 1. Force Yellow Background (Always)
    chrome.action.setBadgeBackgroundColor({ color: '#EAB308' });

    // 2. Fetch Data
    const weather = await fetchWeatherData();

    // 3. Set Text
    if (weather && weather.temp !== undefined) {
      chrome.action.setBadgeText({ text: `${weather.temp}°` });
      chrome.action.setBadgeTextColor({ color: '#000000' }); // Black text
    }

  } catch (error) {
    console.warn('Background Update Failed:', error);

    // Handle "Location missing" specifically or general errors
    if (error.message.includes('Location')) {
      chrome.action.setBadgeText({ text: "?" });
    } else {
      chrome.action.setBadgeText({ text: "!" }); // General error
    }
  }
}