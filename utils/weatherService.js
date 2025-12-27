const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Fetches weather data.
 * Priority: Cache -> GPS -> IP Fallback.
 */
export async function fetchWeatherData() {
  try {
    // 0. Check Cache
    const cached = await getFromCache();
    if (cached) {
      console.log('Using cached weather data');
      return cached;
    }

    // 1. Get Settings (Units)
    const settings = await getSettings();
    const unitParam = settings.units === 'imperial' ? '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch' : '';

    // 2. Get Location (GPS or Fallback)
    let coords = await getCoordinates();
    if (!coords) {
      console.log("GPS missing, trying IP fallback...");
      coords = await fetchIPLocation();
    }

    // 3. Parallel Fetch: Weather + City Name
    const [weatherData, cityObj] = await Promise.all([
      fetchOpenMeteo(coords, unitParam),
      fetchCityName(coords)
    ]);

    // 4. Parse & Merge
    const parsedData = parseWeatherData(weatherData, settings.units);
    parsedData.city = cityObj.city;
    parsedData.country = cityObj.country;

    // 5. Save
    await saveToCache(parsedData);
    return parsedData;

  } catch (error) {
    console.error('Weather Fetch Error:', error);
    throw error;
  }
}

async function fetchOpenMeteo(coords, unitParam) {
  // Added: precipitation_probability, detailed current params
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}${unitParam}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,uv_index,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather API Error");
  return await res.json();
}

// Fallback: IP-based Location
async function fetchIPLocation() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) throw new Error("IP Geo failed");
    const data = await res.json();
    return { lat: data.latitude, lon: data.longitude };
  } catch (e) {
    console.warn("Fallback failed, defaulting to London.", e);
    return { lat: 51.5074, lon: -0.1278 }; // Last resort
  }
}

async function fetchCityName(coords) {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.lat}&longitude=${coords.lon}&localityLanguage=en`;
    const res = await fetch(url);
    const data = await res.json();
    const city = data.locality || data.city || data.principalSubdivision || "Unknown Location";
    return { city, country: data.countryCode };
  } catch (e) {
    return { city: "Local Area", country: "" };
  }
}

function parseWeatherData(data, units) {
  const current = data.current;
  const hourly = data.hourly;
  const daily = data.daily;

  // Get current hour index
  const now = new Date(); // Browser time
  // OpenMeteo returns ISO times in local timezone. We need to find the matching hour string.
  // Easiest is to just match the hour integer (0-23) against the index, as API returns 0-23 sorted.
  const currentHourIndex = now.getHours();

  const uv = hourly.uv_index[currentHourIndex] || 0;
  const precipProb = hourly.precipitation_probability ? hourly.precipitation_probability[currentHourIndex] : 0;

  return {
    temp: Math.round(current.temperature_2m),
    feels_like: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    wind_speed: current.wind_speed_10m,
    is_day: current.is_day,
    weather_code: current.weather_code,

    // Fixed Stats
    uv_index: uv,
    precip_prob: precipProb,

    hourly: hourly.time.slice(currentHourIndex, currentHourIndex + 24).map((time, i) => ({
      time: time,
      temp: Math.round(hourly.temperature_2m[currentHourIndex + i]),
      code: hourly.weather_code[currentHourIndex + i]
    })),

    daily: daily.time.map((time, index) => ({
      date: time,
      max: Math.round(daily.temperature_2m_max[index]),
      min: Math.round(daily.temperature_2m_min[index]),
      code: daily.weather_code[index]
    })),

    units: units || 'metric'
  };
}

// Helpers
async function getSettings() {
  return new Promise(resolve => {
    chrome.storage.local.get(['units'], res => resolve(res || { units: 'metric' }));
  });
}

async function getFromCache() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['weatherData', 'lastFetchTime'], (result) => {
      if (result.weatherData && result.lastFetchTime) {
        if (Date.now() - result.lastFetchTime < CACHE_DURATION) {
          resolve(result.weatherData);
          return;
        }
      }
      resolve(null);
    });
  });
}

async function saveToCache(data) {
  return new Promise(resolve => chrome.storage.local.set({ weatherData: data, lastFetchTime: Date.now() }, resolve));
}

async function getCoordinates() {
  return new Promise(resolve => {
    chrome.storage.local.get(['coords'], res => resolve(res.coords || null));
  });
}

export async function updateLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lon: position.coords.longitude };
        chrome.storage.local.set({ coords }, () => resolve(coords));
      },
      (error) => resolve(null) // Resolve null to trigger fallback logic in fetch
    );
  });
}