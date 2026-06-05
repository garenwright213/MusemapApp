// Open-Meteo: free, no API key. Plain fetch / JSON. https://open-meteo.com/
// Geocoding for city search; forecast for current weather. License (CC BY 4.0)
// requires the "Weather by Open-Meteo" attribution shown on the Home screen.

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export type GeoCity = {
  id: number;
  name: string;
  admin1?: string; // region / state
  country: string;
  latitude: number;
  longitude: number;
};

export type CurrentWeather = {
  temperatureF: number;
  code: number;
};

/** Search cities by name as the user types. Returns [] when there are no matches. */
export async function searchCities(name: string, signal?: AbortSignal): Promise<GeoCity[]> {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=5`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const json = (await res.json()) as { results?: GeoCity[] };
  return json.results ?? [];
}

/** Current weather for a coordinate, temperature already in Fahrenheit. */
export async function getCurrentWeather(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<CurrentWeather> {
  const url =
    `${FORECAST_URL}?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code&temperature_unit=fahrenheit`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Forecast failed (${res.status})`);
  const json = (await res.json()) as { current?: { temperature_2m: number; weather_code: number } };
  if (!json.current) throw new Error('Forecast returned no data');
  return { temperatureF: Math.round(json.current.temperature_2m), code: json.current.weather_code };
}

/** Map a WMO weather code to a short, friendly condition label. */
export function weatherCodeToLabel(code: number): string {
  switch (code) {
    case 0:
      return 'Clear';
    case 1:
      return 'Mainly Clear';
    case 2:
      return 'Partly Cloudy';
    case 3:
      return 'Cloudy';
    case 45:
    case 48:
      return 'Fog';
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return 'Drizzle';
    case 61:
    case 63:
    case 65:
      return 'Rain';
    case 66:
    case 67:
      return 'Freezing Rain';
    case 71:
    case 73:
    case 75:
    case 77:
      return 'Snow';
    case 80:
    case 81:
    case 82:
      return 'Rain Showers';
    case 85:
    case 86:
      return 'Snow Showers';
    case 95:
    case 96:
    case 99:
      return 'Thunderstorm';
    default:
      return 'Weather';
  }
}
