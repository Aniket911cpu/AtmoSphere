// Defaults
const defaultSettings = {
  unitTemp: 'c',
  unitSpeed: 'kmh',
  notifyRain: false,
  openaiKey: ''
};

// Save
document.getElementById('save-btn').addEventListener('click', () => {
  const settings = {
    unitTemp: document.getElementById('unit-temp').value,
    unitSpeed: document.getElementById('unit-speed').value,
    notifyRain: document.getElementById('notify-rain').checked,
    openaiKey: document.getElementById('openai-key').value
  };

  chrome.storage.local.set({ settings }, () => {
    const status = document.getElementById('status');
    status.textContent = 'Settings Saved! Reloading extension...';
    
    // Notify Background & Popup to update immediately
    chrome.runtime.sendMessage({ action: "settingsUpdated" });
    
    setTimeout(() => { status.textContent = ''; }, 2000);
  });
});

// Load
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['settings'], (result) => {
    const s = result.settings || defaultSettings;
    document.getElementById('unit-temp').value = s.unitTemp;
    document.getElementById('unit-speed').value = s.unitSpeed;
    document.getElementById('notify-rain').checked = s.notifyRain;
    document.getElementById('openai-key').value = s.openaiKey;
  });
});

// Reset
document.getElementById('reset-btn').addEventListener('click', () => {
  if(confirm("Are you sure? This will wipe your saved location and settings.")) {
    chrome.storage.local.clear(() => {
      alert("Extension reset. Please reload.");
      chrome.runtime.reload();
    });
  }
});