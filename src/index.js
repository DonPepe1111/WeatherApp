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
          // When a suggestion is clicked, update the input and show weather
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
            // For demo purposes, we simulate reverse geocoding to get a city name.
            // In a real app, you would call a reverse geocoding API here.
            const city = "Demo City";
            locationFunction(city);
            locationInput.value = city;
          },
          (error) => {
            console.error("Error retrieving geolocation:", error);
          }
        );
      } else {
        console.error("Geolocation is not supported by your browser.");
      }
    });
  
    // The "location" function that updates the weather display.
    // It uses dummy data here and should be later replaced with real API data.
    function locationFunction(city) {
      // Dummy data for demonstration purposes
      const dummyData = {
        "Demo City": { temp: "20°C", condition: "sunny" },
        "New York": { temp: "15°C", condition: "cloudy" },
        "Los Angeles": { temp: "25°C", condition: "sunny" },
        "Chicago": { temp: "10°C", condition: "rainy" },
        "Houston": { temp: "28°C", condition: "sunny" },
        "Phoenix": { temp: "35°C", condition: "sunny" }
      };
  
      // Retrieve weather data based on the city name, or default to "N/A"
      const weatherData = dummyData[city] || { temp: "N/A", condition: "N/A" };
  
      // Clear the weather display box and populate it with the new data
      weatherBox.innerHTML = "";
      const cityEl = document.createElement("h2");
      cityEl.textContent = city;
  
      const tempEl = document.createElement("p");
      tempEl.textContent = "Temperature: " + weatherData.temp;
  
      const conditionEl = document.createElement("p");
      conditionEl.textContent = "Condition: " + weatherData.condition;
  
      // Append elements to the weather box
      weatherBox.append(cityEl, tempEl, conditionEl);
    }
  });
  