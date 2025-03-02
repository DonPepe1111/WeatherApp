const locationInput = document.getElementById('location-input');
const suggestionsList = document.getElementById('suggestions');
const weatherDataDiv = document.getElementById('weather-data');

// "Locate Me" button handler
document.getElementById('locate-me').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchWeatherData(lat, lon);
    }, error => {
      console.error('Error getting location:', error);
      alert('Unable to get your location. Please try typing it manually.');
    });
  } else {
    alert('Geolocation is not supported by your browser.');
  }
});

// Debounced input handler for location suggestions
locationInput.addEventListener('input', debounce(async () => {
  const query = locationInput.value;
  if (query.length > 2) {
    const suggestions = await fetchSuggestions(query);
    displaySuggestions(suggestions);
  } else {
    suggestionsList.innerHTML = '';
  }
}, 300));

// Hide suggestions when clicking outside
document.addEventListener('click', (event) => {
  if (!locationInput.contains(event.target) && !suggestionsList.contains(event.target)) {
    suggestionsList.innerHTML = '';
  }
});

// Fetch location suggestions from Nominatim
async function fetchSuggestions(query) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
  const data = await response.json();
  return data;
}

// Display location suggestions in dropdown
function displaySuggestions(suggestions) {
  suggestionsList.innerHTML = '';
  suggestions.forEach(suggestion => {
    const li = document.createElement('li');
    li.textContent = suggestion.display_name;
    li.addEventListener('click', () => {
      locationInput.value = suggestion.display_name;
      suggestionsList.innerHTML = '';
      fetchWeatherData(suggestion.lat, suggestion.lon);
    });
    suggestionsList.appendChild(li);
  });
}

// Fetch weather data from server endpoint
async function fetchWeatherData(lat, lon) {
  weatherDataDiv.innerHTML = '<p>Loading...</p>';
  try {
    const response = await fetch(`/weather?lat=${lat}&lon=${lon}`);
    const data = await response.json();
    if (data.error) {
      weatherDataDiv.innerHTML = `<p>${data.error}</p>`;
    } else {
      displayWeatherData(data);
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    weatherDataDiv.innerHTML = '<p>Error fetching weather data. Please try again.</p>';
  }
}

// Display weather data
function displayWeatherData(data) {
  const temperature = data.current_weather.temperature;
  const weatherCode = data.current_weather.weathercode;
  const condition = getWeatherCondition(weatherCode);
  weatherDataDiv.innerHTML = `
    <h2>Current Weather</h2>
    <p>Temperature: ${temperature}°C</p>
    <p>Condition: ${condition}</p>
  `;
}

// Map weather codes to conditions
function getWeatherCondition(code) {
  const conditions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    51: 'Drizzle: Light intensity',
    53: 'Drizzle: Moderate intensity',
    55: 'Drizzle: Dense intensity',
    61: 'Rain: Slight intensity',
    63: 'Rain: Moderate intensity',
    65: 'Rain: Heavy intensity'
  };
  return conditions[code] || 'Unknown';
}

// Debounce function to limit API calls
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}