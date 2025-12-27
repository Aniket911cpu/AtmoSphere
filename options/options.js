// Saves options to chrome.storage
const saveOptions = () => {
  const apiKey = document.getElementById('apiKey').value;
  const customCity = document.getElementById('customCity').value;
  const units = document.getElementById('units').value;
  const timeFormat = document.getElementById('timeFormat').value;

  chrome.storage.local.set(
    { openaiApiKey: apiKey, customCity: customCity, units: units, timeFormat: timeFormat },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.style.opacity = '1';

      // Notify background/popup to refresh (optional logic, usually they fetch on open)
      // Reset cache to force immediate update on next view
      chrome.storage.local.remove(['weatherData', 'lastFetchTime']);

      setTimeout(() => {
        status.style.opacity = '0';
      }, 1500);
    }
  );
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.local.get(
    { openaiApiKey: '', customCity: '', units: 'metric', timeFormat: '24' },
    (items) => {
      document.getElementById('apiKey').value = items.openaiApiKey;
      document.getElementById('customCity').value = items.customCity;
      document.getElementById('units').value = items.units;
      document.getElementById('timeFormat').value = items.timeFormat;
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveBtn').addEventListener('click', saveOptions);