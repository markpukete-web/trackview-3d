import type { WeatherCondition } from '../types/weather';

/** Map WMO weather codes to simplified condition + label */
export function mapWeatherCode(code: number): {
  condition: WeatherCondition;
  label: string;
} {
  if (code === 0) return { condition: 'clear', label: 'Clear' };
  if (code <= 2) return { condition: 'partly-cloudy', label: 'Partly cloudy' };
  if (code === 3) return { condition: 'cloudy', label: 'Overcast' };
  if (code <= 48) return { condition: 'fog', label: 'Fog' };
  if (code <= 55) return { condition: 'drizzle', label: 'Drizzle' };
  if (code <= 65) return { condition: 'rain', label: 'Rain' };
  if (code <= 67) return { condition: 'heavy-rain', label: 'Heavy rain' };
  if (code <= 77) return { condition: 'snow', label: 'Snow' };
  if (code <= 82) return { condition: 'heavy-rain', label: 'Rain showers' };
  if (code <= 99) return { condition: 'thunderstorm', label: 'Thunderstorm' };
  return { condition: 'cloudy', label: 'Unknown' };
}

/** Convert wind direction degrees to compass label */
export function windDirectionLabel(degrees: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/** Build Open-Meteo API URL for a track */
export function buildWeatherUrl(lat: number, lon: number, timezone: string): string {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code',
    past_days: '7',
    forecast_days: '3',
    timezone,
  });
  return `https://api.open-meteo.com/v1/forecast?${params}`;
}

/** Get today's date string (YYYY-MM-DD) in the track's timezone */
export function getTodayInTimezone(timezone: string): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/** Format a date string as a day label relative to today */
export function formatDayLabel(dateStr: string, todayStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date(todayStr + 'T00:00:00');
  const diffDays = Math.round((date.getTime() - today.getTime()) / (86400000));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';

  return date.toLocaleDateString('en-AU', { weekday: 'long' });
}
