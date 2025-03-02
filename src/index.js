// index.js

document.addEventListener("DOMContentLoaded", () => {
  // Select DOM elements
  const locationInput = document.getElementById("location-input");
  const suggestionsList = document.getElementById("suggestions");
  const locateMeButton = document.getElementById("locate-me");
  const weatherBox = document.getElementById("weather-box");

  // Hardcoded list of cities for suggestions demo
  const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"];

  // Function to display suggestions based on the user's input
  function showSuggestions(value) {
    suggestionsList.innerHTML = ""; // Clear previous suggestions
    // Filter cities that start with the input value (case insensitive)
    const filtered = cities.filter(city =>
      city.toLowerCase().startsWith(value.toLowerCase())
    );
    // Create suggestion items
    filtered.forEach(city => {
      const li = document.createElement("li");
      li.textContent = city;
      li.addEventListener("click", () => {
        locationFunction(city);
        locationInput.value = city;
        suggestionsList.innerHTML = ""; // Clear suggestions
      });
      suggestionsList.appendChild(li);
    });
  }

  // Listen for input changes to update suggestions
  locationInput.addEventListener("input", (e) => {
    if (e.target.value) {
      showSuggestions(e.target.value);
    } else {
      suggestionsList.innerHTML = "";
    }
  });

  // Event listener for "locate me" button using the browser's geolocation
  locateMeButton.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          getWeatherByCoords(latitude, longitude);
          // Optionally update the input with coordinates (or perform reverse geocoding)
          locationInput.value = `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`;
        },
        (error) => {
          console.error("Error retrieving geolocation:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by your browser.");
    }
  });

  // The "location" function that fetches weather using the Open-Meteo APIs.
  async function locationFunction(city) {
    try {
      // Geocoding API: Get coordinates from the city name
      const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`;
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();
      if (!geocodeData.results || geocodeData.results.length === 0) {
        weatherBox.innerHTML = `<p>No location found for "${city}".</p>`;
        return;
      }
      const locationData = geocodeData.results[0];
      const { latitude, longitude, name } = locationData;
      // Forecast API: Get current weather using the coordinates
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
      const weatherResponse = await fetch(weatherUrl);
      const weatherData = await weatherResponse.json();
      if (!weatherData.current_weather) {
        weatherBox.innerHTML = `<p>Weather data not available for "${city}".</p>`;
        return;
      }
      displayWeather(name, weatherData.current_weather.temperature, weatherData.current_weather.weathercode);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      weatherBox.innerHTML = `<p>Error fetching weather data.</p>`;
    }
  }

  // Get weather by using browser geolocation coordinates
  function getWeatherByCoords(lat, lon) {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
      .then(response => response.json())
      .then(data => {
        if (!data.current_weather) {
          weatherBox.innerHTML = `<p>Weather data not available for your location.</p>`;
          return;
        }
        // Here we display coordinates as the location.
        displayWeather(`Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`, data.current_weather.temperature, data.current_weather.weathercode);
      })
      .catch(error => {
        console.error("Error fetching weather data:", error);
        weatherBox.innerHTML = `<p>Error fetching weather data.</p>`;
      });
  }

  // Function to display weather information in the weather box
  function displayWeather(city, temperature, weathercode) {
    weatherBox.innerHTML = "";
    const cityEl = document.createElement("h2");
    cityEl.textContent = city;

    const tempEl = document.createElement("p");
    tempEl.textContent = `Temperature: ${temperature}°C`;

    const conditionEl = document.createElement("p");
    conditionEl.textContent = `Condition: ${getWeatherCondition(weathercode)}`;

    weatherBox.append(cityEl, tempEl, conditionEl);
  }

  // Mapping Open-Meteo weather codes to simple condition descriptions
  function getWeatherCondition(code) {
    // Code 0: Clear sky
    if (code === 0) {
      return "Sunny";
    } 
    // Codes for mainly clear, partly cloudy, overcast, fog etc.
    else if ([1, 2, 3, 45, 48].includes(code)) {
      return "Cloudy";
    } 
    // Codes for drizzle, rain, showers, and thunderstorms
    else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) {
      return "Rainy";
    } 
    // Codes for snow fall and snow showers
    else if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return "Snowy";
    } else {
      return "Unknown";
    }
  }
});
