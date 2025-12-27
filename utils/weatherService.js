
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Fetches weather data using Open-Meteo API.
 * Checks local storage cache first.
 * @returns {Promise<Object>} Weather data object
 */
export async function fetchWeatherData() {
  try {
    // 1. Check Cache
    const cached = await getFromCache();
    if (cached) {
      console.log('Using cached weather data');
      return cached;
    }

    // 2. Get Coordinates
    const coords = await getCoordinates();
    if (!coords) {
      throw new Error("Location not available. Please open the extension popup to detect location.");
    }

    // 3. Update Badge (loading state) used by background, optional here but good for debugging
    // console.log("Fetching new data for", coords);

    // 4. Fetch from Open-Meteo
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather API failed');
    const data = await response.json();

    // 5. Parse Data
    const parsedData = parseWeatherData(data);

    // 6. Save to Cache
    await saveToCache(parsedData);

    return parsedData;

  } catch (error) {
    console.error('Weather Fetch Error:', error);
    throw error;
  }
}

async function getFromCache() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['weatherData', 'lastFetchTime'], (result) => {
      if (result.weatherData && result.lastFetchTime) {
        const now = Date.now();
        if (now - result.lastFetchTime < CACHE_DURATION) {
          resolve(result.weatherData);
          return;
        }
      }
      resolve(null);
    });
  });
}

async function saveToCache(data) {
  return new Promise((resolve) => {
    chrome.storage.local.set({
      weatherData: data,
      lastFetchTime: Date.now()
    }, resolve);
  });
}

async function getCoordinates() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['coords'], (result) => {
        resolve(result.coords || null);
    });
  });
}

function parseWeatherData(data) {
  const current = data.current;
  const hourly = data.hourly;
  const daily = data.daily;

  return {
    temp: Math.round(current.temperature_2m),
    feels_like: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    wind_speed: current.wind_speed_10m,
    is_day: current.is_day,
    weather_code: current.weather_code,
    // Provide a simple UV index from the current hour APPROXIMATION or use hourly[0]
    uv_index: hourly.uv_index[0], 
    
    hourly: hourly.time.slice(0, 24).map((time, index) => ({
      time: time,
      temp: Math.round(hourly.temperature_2m[index]),
      code: hourly.weather_code[index]
    })),
    
    daily: daily.time.map((time, index) => ({
      date: time,
      max: Math.round(daily.temperature_2m_max[index]),
      min: Math.round(daily.temperature_2m_min[index]),
      code: daily.weather_code[index]
    }))
  };
}

// Ensure coords are saved when available (e.g. from Popup)
export async function updateLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                chrome.storage.local.set({ coords }, () => {
                    resolve(coords);
                });
            },
            (error) => {
                reject(error);
            }
        );
    });
}