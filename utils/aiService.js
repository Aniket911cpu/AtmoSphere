
/**
 * Generates a witty weather summary.
 * Uses OpenAI if API key is present, otherwise falls back to local logic.
 * @param {Object} weatherData - Parsed weather data object
 * @returns {Promise<string>} The generated summary
 */
export async function generateSummary(weatherData) {
    const apiKey = await getApiKey();

    if (apiKey) {
        return await fetchOpenAISummary(apiKey, weatherData);
    } else {
        return generateLocalSummary(weatherData);
    }
}

async function getApiKey() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['openaiApiKey'], (result) => {
            resolve(result.openaiApiKey);
        });
    });
}

async function fetchOpenAISummary(apiKey, data) {
    try {
        const prompt = `
      Current weather: ${data.temp}°C, Feels like: ${data.feels_like}°C. 
      Conditions: Humidity ${data.humidity}%, Wind ${data.wind_speed}km/h. 
      Write a witty, news-anchor style one-sentence summary for this weather.
    `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 60
            })
        });

        const json = await response.json();
        if (json.error) throw new Error(json.error.message);

        return json.choices[0].message.content.trim();

    } catch (error) {
        console.error("OpenAI Error, reverting to local:", error);
        return generateLocalSummary(data) + " (Offline Mode)";
    }
}

function generateLocalSummary(data) {
    const t = data.temp;
    const isRain = data.weather_code >= 51 && data.weather_code <= 67; // Simplified code check

    if (isRain) return "Grab an umbrella, it's looking soggy out there!";
    if (t >= 30) return "It's scorching! Stay hydrated and seek shade.";
    if (t >= 20) return "Absolutely beautiful day. Get outside!";
    if (t >= 10) return "A bit chilly, maybe bring a light jacket.";
    if (t <= 0) return "Freezing cold! Bundle up like a burrowing animal.";

    return "Current conditions are clear, have a great day!";
}
