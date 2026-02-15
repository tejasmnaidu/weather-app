import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useState, useEffect } from "react";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function App() {
  const [city, setCity] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState([]);
  const [bg, setBg] = useState("linear-gradient(145deg, #0f0f0f, #1b1b1b)");
  const fetchWeatherByCoords = async (lat, lon) => {
  setLoading(true);
  setResult("");
  setForecast([]);

  try {
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,precipitation_probability`
    );

    const weatherData = await weatherRes.json();
    const code = weatherData.current_weather.weathercode;

    let condition = "Clear";
    if (code >= 1 && code <= 3) condition = "Cloudy";
    if (code >= 45 && code <= 48) condition = "Foggy";
    if (code >= 51 && code <= 67) condition = "Rainy";
    if (code >= 71 && code <= 77) condition = "Snowy";
    if (code >= 80 && code <= 99) condition = "Stormy";

    if (condition === "Clear") setBg("linear-gradient(145deg, #f7971e, #ffd200)");
    else if (condition === "Cloudy") setBg("linear-gradient(145deg, #485563, #29323c)");
    else if (condition === "Rainy") setBg("linear-gradient(145deg, #1f4037, #99f2c8)");
    else if (condition === "Foggy") setBg("linear-gradient(145deg, #757f9a, #d7dde8)");
    else if (condition === "Snowy") setBg("linear-gradient(145deg, #83a4d4, #b6fbff)");
    else if (condition === "Stormy") setBg("linear-gradient(145deg, #2c3e50, #4b79a1)");

    const temp = weatherData.current_weather.temperature;
    const wind = weatherData.current_weather.windspeed;
    const rain = weatherData.hourly.precipitation_probability[0];

    setResult(
      `📍 Your Location
🌤️ Condition: ${condition}
🌡️ Temperature: ${temp}°C
💨 Wind: ${wind} km/h
🌧️ Chance of Rain: ${rain}%`
    );

    const next24Hours = weatherData.hourly.time.slice(0, 24).map((time, i) => ({
      time,
      temp: weatherData.hourly.temperature_2m[i],
      rain: weatherData.hourly.precipitation_probability[i],
    }));

    setForecast(next24Hours);
  } catch {
    setResult("Location weather failed ❌");
  }

  setLoading(false);
};


  const fetchWeather = async (cityName) => {
    if (!cityName) return;

    setLoading(true);
    setResult("");
    setForecast([]);

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setResult("City not found 😕");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];
      // 💾 Save last searched city
localStorage.setItem("lastCity", name);


      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,precipitation_probability`
      );

      const weatherData = await weatherRes.json();
      const code = weatherData.current_weather.weathercode;

      let condition = "Clear";
      if (code >= 1 && code <= 3) condition = "Cloudy";
      if (code >= 45 && code <= 48) condition = "Foggy";
      if (code >= 51 && code <= 67) condition = "Rainy";
      if (code >= 71 && code <= 77) condition = "Snowy";
      if (code >= 80 && code <= 99) condition = "Stormy";

      if (condition === "Clear") setBg("linear-gradient(145deg, #f7971e, #ffd200)");
      else if (condition === "Cloudy") setBg("linear-gradient(145deg, #485563, #29323c)");
      else if (condition === "Rainy") setBg("linear-gradient(145deg, #1f4037, #99f2c8)");
      else if (condition === "Foggy") setBg("linear-gradient(145deg, #757f9a, #d7dde8)");
      else if (condition === "Snowy") setBg("linear-gradient(145deg, #83a4d4, #b6fbff)");
      else if (condition === "Stormy") setBg("linear-gradient(145deg, #2c3e50, #4b79a1)");

      const temp = weatherData.current_weather.temperature;
      const wind = weatherData.current_weather.windspeed;
      const rain = weatherData.hourly.precipitation_probability[0];

      setResult(
        `📍 ${name}, ${country}
🌤️ Condition: ${condition}
🌡️ Temperature: ${temp}°C
💨 Wind: ${wind} km/h
🌧️ Chance of Rain: ${rain}%`
      );

      const next24Hours = weatherData.hourly.time.slice(0, 24).map((time, i) => ({
        time,
        temp: weatherData.hourly.temperature_2m[i],
        rain: weatherData.hourly.precipitation_probability[i],
      }));

      setForecast(next24Hours);
    } catch {
      setResult("Something went wrong ❌");
    }

    setLoading(false);
  };

  // Auto-detect user location on load (fallback to Bengaluru)
useEffect(() => {
  const savedCity = localStorage.getItem("lastCity");

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1`
          );
          const geoData = await geoRes.json();

          if (geoData.results && geoData.results.length > 0) {
            const detectedCity = geoData.results[0].name;
            setCity(detectedCity);
            fetchWeather(detectedCity);
          } else if (savedCity) {
            setCity(savedCity);
            fetchWeather(savedCity);
          } else {
            setCity("bengaluru");
            fetchWeather("bengaluru");
          }
        } catch (err) {
          if (savedCity) {
            setCity(savedCity);
            fetchWeather(savedCity);
          } else {
            setCity("bengaluru");
            fetchWeather("bengaluru");
          }
        }
      },
      () => {
        // ❌ User denied location
        if (savedCity) {
          setCity(savedCity);
          fetchWeather(savedCity);
        } else {
          setCity("bengaluru");
          fetchWeather("bengaluru");
        }
      }
    );
  } else {
    // ❌ Browser doesn't support location
    if (savedCity) {
      setCity(savedCity);
      fetchWeather(savedCity);
    } else {
      setCity("bengaluru");
      fetchWeather("bengaluru");
    }
  }
}, []);

  const chartData = {
    labels: forecast.map((item) => item.time.split("T")[1]),
    datasets: [
      {
        label: "Temperature (°C)",
        data: forecast.map((item) => item.temp),
        borderColor: "#4fd1c5",
        backgroundColor: "rgba(79, 209, 197, 0.15)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        yAxisID: "yTemp",
      },
      {
        label: "Rain Probability (%)",
        data: forecast.map((item) => item.rain),
        borderColor: "#63b3ed",
        backgroundColor: "rgba(99,179,237,0.15)",
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        borderDash: [6, 4],
        yAxisID: "yRain",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "white" } } },
    scales: {
      yTemp: {
        type: "linear",
        position: "left",
        ticks: { color: "#4fd1c5" },
        grid: { color: "#333" },
        min: Math.min(...forecast.map(f => f.temp)) - 2,
        max: Math.max(...forecast.map(f => f.temp)) + 2,
        title: { display: true, text: "Temperature (°C)", color: "#4fd1c5" },
      },
      yRain: {
        type: "linear",
        position: "right",
        ticks: { color: "#63b3ed" },
        grid: { drawOnChartArea: false },
        min: 0,
        max: 100,
        title: { display: true, text: "Rain Probability (%)", color: "#63b3ed" },
      },
      x: { ticks: { color: "white" }, grid: { color: "#333" } },
    },
  };

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "#0a0a0a", padding: 20 }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: 24, fontFamily: "Arial", color: "white", borderRadius: 12, background: bg }}>
        <h1>Weather App 🌦️</h1>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter city" style={{ padding: 10, minWidth: 220 }} />
          <button onClick={() => fetchWeather(city)}>Search</button>
          <button onClick={() => fetchWeather(city)}>Refresh 🔄</button>
        </div>

        {result && <pre style={{ marginTop: 10 }}>{result}</pre>}

        {forecast.length > 0 && (
          <>
            <h3 style={{ marginTop: 40 }}>Temperature Trend (Next 24 Hours) 📈</h3>
            <div style={{ background: "#111", padding: 20, borderRadius: 12, height: 420 }}>
              <Line data={chartData} options={chartOptions} />
            </div>

            <h3 style={{ marginTop: 30 }}>Next 24 Hours Forecast ⏰</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12, marginTop: 10 }}>
              {forecast.map((item, index) => (
                <div
                  key={index}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.4)";
                  }}
                  style={{
                    padding: "10px 12px",
                    background: "#1f1f1f",
                    borderRadius: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
                  }}
                >
                  <span>⏰ {item.time.split("T")[1]}</span>
                  <span>🌡️ {item.temp}°C</span>
                  <span>🌧️ {item.rain}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
