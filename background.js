import { WeatherService } from './utils/weatherService.js';

// 1. Setup Alarm on Install
chrome.runtime.onInstalled.addListener(() => {
  console.log("AtmoSphere AI Installed.");
  // Create an alarm that fires every 20 minutes
  chrome.alarms.create("weatherRefresh", { periodInMinutes: 20 });
  // Initial fetch
  updateBadge();
});

// 2. Listen for Alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "weatherRefresh") {
    updateBadge();
  }
});

// 3. Update Badge Function
async function updateBadge() {
  try {
    const data = await WeatherService.getWeatherData(true); // Force refresh for background
    const temp = Math.round(data.current.temp);
    
    // Set Text
    chrome.action.setBadgeText({ text: `${temp}°` });

    // Set Color based on Temp
    let color = "#777"; // Default Grey
    if (temp <= 10) color = "#3b82f6"; // Blue (Cold)
    if (temp > 10 && temp < 25) color = "#f59e0b"; // Orange (Mild)
    if (temp >= 25) color = "#ef4444"; // Red (Hot)

    chrome.action.setBadgeBackgroundColor({ color: color });
    
  } catch (e) {
    console.error("Background update failed", e);
    chrome.action.setBadgeText({ text: "Err" });
  }
}