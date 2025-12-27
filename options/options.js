// Saves options to chrome.storage
const saveOptions = () => {
  const apiKey = document.getElementById('apiKey').value;
  const customCity = document.getElementById('customCity').value;

  chrome.storage.local.set(
    { openaiApiKey: apiKey, customCity: customCity },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.style.opacity = '1';
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
    { openaiApiKey: '', customCity: '' },
    (items) => {
      document.getElementById('apiKey').value = items.openaiApiKey;
      document.getElementById('customCity').value = items.customCity;
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveBtn').addEventListener('click', saveOptions);