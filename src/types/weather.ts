// Open-Meteo API response shape (partial — only fields we use)
// Reference: https://open-meteo.com/en/docs

export interface OpenMeteoResponse {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
  };
}

// Simplified weather conditions mapped from WMO codes

export type WeatherCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavy-rain'
  | 'thunderstorm'
  | 'snow';

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  condition: WeatherCondition;
  conditionLabel: string;
  weatherCode: number;
  updatedAt: string;
}

export interface DayForecast {
  date: string;
  dayLabel: string;
  tempMax: number;
  tempMin: number;
  rainChance: number;
  rainfallMm: number;
  condition: WeatherCondition;
  conditionLabel: string;
}

export interface RecentRainfall {
  totalMm: number;
  days: number;
  label: string;
}

export interface TrackWeatherData {
  current: CurrentWeather;
  forecast: DayForecast[];
  recentRainfall: RecentRainfall;
  fetchedAt: Date;
}
