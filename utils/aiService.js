
/**
 * Generates a witty, news-anchor style weather summary.
 * USES "SAMPLER" TEXT ENGINE BY DEFAULT (Simulated AI).
 * Checks for OpenAI Key only if explicitly preferred, but defaults to local for speed/reliability.
 */
export async function generateSummary(weatherData) {
    const apiKey = await getApiKey();

    // If user has key, try it. But fail gracefully to Sampler.
    if (apiKey) {
        try {
            return await fetchOpenAISummary(apiKey, weatherData);
        } catch (e) {
            console.log("OpenAI fail, using Sampler.");
        }
    }

    // Default: The "Sampler" Engine
    return generateSamplerText(weatherData);
}

async function getApiKey() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['openaiApiKey'], (result) => {
            resolve(result.openaiApiKey);
        });
    });
}

// --- REAL OPENAI (Optional) ---
async function fetchOpenAISummary(apiKey, data) {
    const prompt = `Current weather: ${data.temp}°C, ${getConditionText(data.weather_code)}. Write a witty, news-anchor style one-sentence summary.`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 60
        })
    });
    const json = await response.json();
    return json.choices[0].message.content.trim();
}

// --- THE "SAMPLER" ENGINE (Simulated AI) ---
function generateSamplerText(data) {
    const t = data.temp;
    const code = data.weather_code;
    const isDay = data.is_day; // 1 = Day, 0 = Night

    // 1. Define Category
    let category = 'clear';
    if (code >= 95) category = 'storm';
    else if (code >= 71) category = 'snow';
    else if (code >= 51) category = 'rain';
    else if (code >= 45) category = 'fog';
    else if (code >= 1 && code <= 3) category = 'cloudy';
    else if (t >= 30) category = 'hot';
    else if (t <= 5) category = 'cold';

    // 2. Select Script
    const scripts = SCRIPT_LIBRARY[category] || SCRIPT_LIBRARY['clear'];
    const randomScript = scripts[Math.floor(Math.random() * scripts.length)];

    return randomScript;
}

function getConditionText(code) {
    if (code >= 95) return "Thunderstorms";
    if (code >= 51) return "Rainy";
    if (code >= 71) return "Snowing";
    if (code <= 3) return "Cloudy";
    return "Clear";
}

// --- SCRIPT LIBRARY ---
const SCRIPT_LIBRARY = {
    hot: [
        "It's officially scorching. Don't be a hero—find AC immediately.",
        "Heatwave alert! Verify your deodorant is working overtime today.",
        "The sun is acting aggressively. Stay hydrated or perish.",
        "It is absolutely boiling. Pavements are now frying pans.",
        "Temperatures are soaring. A perfect day for ice cream, or hibernation."
    ],
    cold: [
        "It's freezing! Layer up like an onion before heading out.",
        "Arctic vibes detected. Respect the frost or pay the price.",
        "Bitterly cold today. Your coffee will cool down in seconds.",
        "Winter is flexing. Make sure your extremities are covered.",
        "Sub-zero feels. Only go outside if absolutely necessary."
    ],
    rain: [
        "Skies are leaking. Umbrella deployment is mandatory.",
        "Puddle alert! It's wet, wild, and frankly a bit miserable.",
        "Rain checks are currently valid for all outdoor plans.",
        "Drizzle turning to downpour. It's a great day for Netflix.",
        "Nature is washing the streets. Try not to get soaked."
    ],
    snow: [
        "Whiteout conditions possible. Drive safe or stay home.",
        "It's a winter wonderland, which means traffic will be a nightmare.",
        "Snow happens. Boots and gloves are your best friends today.",
        "Fresh powder falling. Looks pretty, feels freezing.",
        "The world is turning white. Watch your step on the ice."
    ],
    storm: [
        "Thunder rolling in. Maybe unplug the expensive electronics?",
        "Electric skies tonight. Stay indoors and enjoy the light show.",
        "Storm warning active. Batten down the hatches!",
        "It's loud out there. Nature is throwing a tantrum.",
        "Heavy rumble detected. Keep pets inside and calm."
    ],
    fog: [
        "Visibility is low. It's spooky out there, drive carefully.",
        "The mist has descended. Are we in a horror movie?",
        "Foggy start. You can't see the future, or the traffic lights.",
        "Dense fog reported. Use lights and keep it slow.",
        "Atmospheric mystery mode engaged. Proceed with caution."
    ],
    cloudy: [
        "Clouds are hogging the sky. No sun, but no rain yet.",
        "Grey skies ahead. A perfectly neutral, mediocre day.",
        "Uniformly overcast. The sun is on vacation.",
        "A bit gloomy, but excellent lighting for photography.",
        "Standard cloud cover. Nothing dramatic, just... sky."
    ],
    clear: [
        "Not a cloud in sight. It's crisp, clear, and confident.",
        "Blue skies for miles. Go touch some grass.",
        "Perfect visibility. The horizon is looking sharp.",
        "Clear conditions. A solid 10/10 for outdoor sitting.",
        "The sky is showing off today. Enjoy the view."
    ]
};
