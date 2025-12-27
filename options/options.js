// Saves options to chrome.storage
const saveOptions = () => {
  const apiKey = document.getElementById('openai-key').value;
  const location = document.getElementById('custom-loc').value;

  chrome.storage.local.set(
    { openaiKey: apiKey, customLocation: location },
    () => {
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => { status.textContent = ''; }, 2000);
      
      // Trigger a refresh
      chrome.runtime.sendMessage({ action: "refreshWeather" });
    }
  );
};

// Restores select box and checkbox state using the preferences
const restoreOptions = () => {
  chrome.storage.local.get(
    { openaiKey: '', customLocation: '' },
    (items) => {
      document.getElementById('openai-key').value = items.openaiKey;
      document.getElementById('custom-loc').value = items.customLocation;
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);