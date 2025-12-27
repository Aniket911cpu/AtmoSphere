// ... existing code ...

  // 6. Data Converter (Handles Units)
  // Run this on the data BEFORE returning it to the UI
  async processUnits(data) {
    const storage = await chrome.storage.local.get('settings');
    const s = storage.settings || { unitTemp: 'c', unitSpeed: 'kmh' };

    // Helper: C to F
    const toF = (c) => Math.round((c * 9 / 5) + 32);
    // Helper: KMH to MPH or MS
    const convSpeed = (k) => {
        if (s.unitSpeed === 'mph') return Math.round(k * 0.621371);
        if (s.unitSpeed === 'ms') return Math.round(k / 3.6);
        return k; // Default kmh
    };

    // Deep clone to avoid mutating cache
    const d = JSON.parse(JSON.stringify(data));

    // Convert Temp
    if (s.unitTemp === 'f') {
        d.current.temp = toF(d.current.temp);
        d.current.feels_like = toF(d.current.feels_like);
        d.hourly.forEach(h => h.temp = toF(h.temp));
        d.daily.forEach(day => {
            day.max = toF(day.max);
            day.min = toF(day.min);
        });
    }

    // Convert Wind
    d.current.wind = convSpeed(d.current.wind);
    d.units = {
        temp: s.unitTemp === 'f' ? '°F' : '°C',
        speed: s.unitSpeed === 'mph' ? 'mph' : (s.unitSpeed === 'ms' ? 'm/s' : 'km/h')
    };

    return d;
}
};