// Configuration for Open-Meteo
const API_BASE = "https://api.open-meteo.com/v1/forecast";

export const WeatherService = {
  // 1. Core Fetch Function
  async getWeatherData(forceRefresh = false) {
    try {
      // Check Cache
      const cached = await chrome.storage.local.get(["weatherData", "lastUpdated"]);
      const now = Date.now();
      const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

      if (!forceRefresh && cached.weatherData && cached.lastUpdated && (now - cached.lastUpdated < CACHE_DURATION)) {
        console.log("Serving from Cache");
        return cached.weatherData;
      }

      // Fetch Fresh Data
      console.log("Fetching Fresh Data...");
      const coords = await this.getCoordinates();
      const data = await this.fetchFromAPI(coords.lat, coords.lon);
      
      // Save to Cache
      await chrome.storage.local.set({
        weatherData: data,
        lastUpdated: now
      });

      return data;
    } catch (error) {
      console.error("Weather Service Error:", error);
      throw error;
    }
  },

  // 2. Get User Location
  getCoordinates() {
    return new Promise((resolve, reject) => {
      // Check if user set a custom location in options (implied logic)
      chrome.storage.local.get("customLocation", (result) => {
        if (result.customLocation) {
          // In a real app, geocode the city name here. 
          // For this MVP, we default to London if custom is set but not geocoded, 
          // or you would add a geocoding API call here.
          // For now, let's stick to GPS or Default.
        }
        
        if (!navigator.geolocation) {
          resolve({ lat: 51.5074, lon: -0.1278 }); // Default London
        } else {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
            (error) => {
              console.warn("GPS Denied, using fallback.");
              resolve({ lat: 51.5074, lon: -0.1278 }); // Fallback London
            }
          );
        }
      });
    });
  },

  // 3. API Call & Normalization
  async fetchFromAPI(lat, lon) {
    const url = `${API_BASE}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("API Network Error");
    const raw = await response.json();

    // Transform Data
    return {
      current: {
        temp: Math.round(raw.current.temperature_2m),
        feels_like: Math.round(raw.current.apparent_temperature),
        humidity: raw.current.relative_humidity_2m,
        wind: raw.current.wind_speed_10m,
        wind_dir: raw.current.wind_direction_10m,
        code: raw.current.weather_code,
        is_day: raw.current.is_day
      },
      daily: raw.daily.time.map((time, i) => ({
        day: new Date(time).toLocaleDateString('en-US', { weekday: 'short' }),
        max: Math.round(raw.daily.temperature_2m_max[i]),
        min: Math.round(raw.daily.temperature_2m_min[i]),
        uv: raw.daily.uv_index_max[i],
        rain_prob: raw.daily.precipitation_probability_max[i],
        code: raw.daily.weather_code[i]
      })),
      hourly: raw.hourly.time.slice(0, 24).map((time, i) => ({
        time: new Date(time).getHours() + ":00",
        temp: Math.round(raw.hourly.temperature_2m[i]),
        code: raw.hourly.weather_code[i]
      })),
      location: { lat, lon } // Store to identify location
    };
  },

  // 4. AI Placeholder (The "Brain")
  generateAIReport(weatherData) {
    const t = weatherData.current.temp;
    const c = weatherData.current.code;
    // Real implementation: Call OpenAI API here using stored API Key.
    // Placeholder Logic:
    if (t > 30) return "It's scorching outside! Stay hydrated and seek shade.";
    if (c >= 51 && c <= 67) return "Don't forget your umbrella, it's looking drippy.";
    if (t < 10) return "Bundle up! It's properly chilly out there.";
    return "The skies look clear. Enjoy your day!";
  }
};