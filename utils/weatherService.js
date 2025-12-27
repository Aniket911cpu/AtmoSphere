
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Fetches weather data using Open-Meteo API.
 * AUTO-DETECTS CITY NAME.
 */
export async function fetchWeatherData() {
  try {
    const cached = await getFromCache();
    if (cached) {
      console.log('Using cached weather data');
      return cached;
    }

    const coords = await getCoordinates();
    if (!coords) throw new Error("Location permissions denied.");

    // Parallel Fetch: Weather + City Name
    const [weatherData, cityObj] = await Promise.all([
      fetchOpenMeteo(coords),
      fetchCityName(coords)
    ]);

    // Parse & Merge
    const parsedData = parseWeatherData(weatherData);
    parsedData.city = cityObj.city;
    parsedData.country = cityObj.country;

    await saveToCache(parsedData);
    return parsedData;

  } catch (error) {
    console.error('Weather Fetch Error:', error);
    throw error;
  }
}

async function fetchOpenMeteo(coords) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather API Error");
  return await res.json();
}

// Reverse Geocoding via BigDataCloud (Free, simple)
async function fetchCityName(coords) {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.lat}&longitude=${coords.lon}&localityLanguage=en`;
    const res = await fetch(url);
    const data = await res.json();

    // Priority: Locality -> City -> PrincipalSubdivision -> Country
    const city = data.locality || data.city || data.principalSubdivision || "Unknown Location";
    return { city, country: data.countryCode };
  } catch (e) {
    console.warn("Geocoding failed", e);
    return { city: "Local Area", country: "" };
  }
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
  return new Promise((resolve) => {
    chrome.storage.local.set({
      weatherData: data,
      lastFetchTime: Date.now()
    }, resolve);
  });
}

async function getCoordinates() {
  return new Promise((resolve, reject) => {
    // Check saved coords first
    chrome.storage.local.get(['coords'], (result) => {
      if (result.coords) {
        resolve(result.coords);
      } else {
        // If no saved coords, try to get them (this might fail in background if not previously approved)
        // ideally popup asks for them.
        resolve(null);
      }
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
        chrome.storage.local.set({ coords }, () => resolve(coords));
      },
      (error) => reject(error)
    );
  });
}