
/**
 * Generates a DETAILED, witty weather summary.
 * Uses robust "Sampler Text" templates for rich, reliable output.
 */
export async function generateSummary(weatherData) {
    const apiKey = await getApiKey();

    if (apiKey) {
        try {
            return await fetchOpenAISummary(apiKey, weatherData);
        } catch (e) {
            console.log("OpenAI fail, using Sampler.");
        }
    }

    return generateSamplerText(weatherData);
}

async function getApiKey() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['openaiApiKey'], (result) => {
            resolve(result.openaiApiKey);
        });
    });
}

async function fetchOpenAISummary(apiKey, data) {
    const prompt = `Current weather: ${data.temp} degrees, ${getConditionText(data.weather_code)}. Write a witty, detail-rich 2-sentence news anchor summary for a user.`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 100
        })
    });
    const json = await response.json();
    return json.choices[0].message.content.trim();
}

function generateSamplerText(data) {
    const t = data.temp; // Assuming Metric for logic thresholds, roughly
    const code = data.weather_code;

    // Determine Category
    let category = 'clear';
    if (code >= 95) category = 'storm';
    else if (code >= 71) category = 'snow';
    else if (code >= 51) category = 'rain';
    else if (code >= 45) category = 'fog';
    else if (code >= 1 && code <= 3) category = 'cloudy';
    else if (t >= 30) category = 'hot';
    else if (t <= 5) category = 'cold';

    const scripts = SCRIPT_LIBRARY[category] || SCRIPT_LIBRARY['clear'];
    return scripts[Math.floor(Math.random() * scripts.length)];
}

function getConditionText(code) {
    if (code >= 95) return "Thunderstorms";
    if (code >= 51) return "Rainy";
    if (code >= 71) return "Snowing";
    if (code <= 3) return "Cloudy";
    return "Clear";
}

// --- DETAILED SCRIPT LIBRARY ---
const SCRIPT_LIBRARY = {
    hot: [
        "It is absolutely scorching out there. Pavements are hot enough to fry an egg, so consider staying indoors with the AC blasting. Hydration isn't a suggestion today; it's a requirement.",
        "Heatwave alert in effect. The sun is aggressive today, so applying sunscreen is non-negotiable if you venture out. It's the perfect excuse to do absolutely nothing but lounge in the shade.",
        "Temperatures are hitting dangerous highs. If you don't have to be a hero, stay inside and hug your fan. The outside world is currently an oven, and you are not a cookie."
    ],
    cold: [
        "It is bitterly cold. The air bites exposed skin, so layer up like you're preparing for an arctic expedition. A hot beverage is strongly recommended to keep your soul from freezing over.",
        "Temperatures have plummeted. Make sure your extremities are covered, as frost doesn't play nice. It's a great day to wear your heaviest coat and complain about the season.",
        "Winter is showing no mercy today. The cold is piercing, so keep your time outdoors to a bare minimum. If you must go out, move fast and look miserable to blend in."
    ],
    rain: [
        "The skies have opened up. It's wet, grey, and frankly a bit dreary, so keep that umbrella handy. Traffic will likely be a disaster, so plan for delays and splash zones.",
        "Steady rain is falling across the region. It's excellent weather for ducks, but less so for dry socks. A waterproof jacket is your best friend right now.",
        "We are looking at significant rainfall. Nature is washing the streets, whether you like it or not. Stay dry, drive safe, and enjoy the cozy sound of rain on the window."
    ],
    snow: [
        "Snow is falling, turning the city into a winter wonderland (and a traffic nightmare). Roads will be slick, so tread carefully. It's beautiful to look at, provided you're doing so from a warm room.",
        "Fresh powder is accumulating. If you're driving, take it slow; if you're walking, watch for ice patches. It's the perfect weather to build a snowman or simply hibernate.",
        "Heavy snowfall reported. Visibility is reduced and the cold is intense. Bundle up, wear boots with grip, and maybe just cancel your plans to stay home with cocoa."
    ],
    storm: [
        "Severe thunderstorms are rolling through. Expect loud thunder, flashes of lightning, and sudden downpours. It's best to unplug sensitive electronics and enjoy the light show from safety.",
        "The atmosphere is unstable today. Storms are tracking across the area, bringing gusty winds and heavy rain. Batten down the hatches and keep pets indoors.",
        "It's getting loud out there. Nature is throwing a tantrum with thunder and lightning. Avoid open fields and stay dry until this system passes."
    ],
    fog: [
        "Visibility is near zero. The fog has descended, turning the world into a mystery novel. Drive with your low beams on and take it slow, as objects may appear closer than they imply.",
        "A dense blanket of fog is covering the area. It feels a bit spooky, like a classic horror movie intro. increased caution is advised for all commuters this morning.",
        "Mist and fog are obscuring the view. It's atmospheric and moody, but terrible for driving. Keep your eyes peeled and your speed down."
    ],
    cloudy: [
        "The sky is a uniform grey today. We won't be seeing much of the sun, but at least it's not raining yet. It's a perfectly neutral, average day for getting things done.",
        "Cloud cover is thick and persistent. It's feeling a bit gloomy, so you might need extra coffee to keep the energy up. On the bright side, no glare on your screens.",
        "Overcast conditions rule the sky. The lighting is flat and the mood is calm. Not exciting weather, but reliable enough for a walk if you grab a jacket."
    ],
    clear: [
        "Not a cloud in sight! The sky is a brilliant blue and the sun is shining. It's a perfect 10/10 day, so go touch some grass and soak up the Vitamin D.",
        "Crystal clear skies today. Visibility is unlimited and the horizon is sharp. It's the kind of weather that makes you glad to be outside, so don't waste it.",
        "Beautiful clear weather. The sun is out and confident. Whether you're working or relaxing, try to steal a few moments to enjoy the sunshine."
    ]
};
