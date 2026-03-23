import { useState, useEffect, useCallback, useRef } from 'react';
import type { TrackConfig } from '../types/track';
import type { TrackWeatherData, OpenMeteoResponse } from '../types/weather';
import {
  buildWeatherUrl,
  getTodayInTimezone,
  mapWeatherCode,
  formatDayLabel,
} from '../utils/weather';

const REFETCH_INTERVAL = 15 * 60 * 1000; // 15 minutes

interface UseWeatherResult {
  data: TrackWeatherData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function transformResponse(
  raw: OpenMeteoResponse,
  timezone: string,
): TrackWeatherData {
  const today = getTodayInTimezone(timezone);

  // Current conditions
  const currentCondition = mapWeatherCode(raw.current.weather_code);
  const current = {
    temperature: Math.round(raw.current.temperature_2m),
    humidity: Math.round(raw.current.relative_humidity_2m),
    windSpeed: Math.round(raw.current.wind_speed_10m),
    windDirection: raw.current.wind_direction_10m,
    condition: currentCondition.condition,
    conditionLabel: currentCondition.label,
    weatherCode: raw.current.weather_code,
    updatedAt: raw.current.time,
  };

  // Split daily data into past (rainfall) and forecast
  const pastDays: number[] = [];
  const forecast = [];

  for (let i = 0; i < raw.daily.time.length; i++) {
    const dateStr = raw.daily.time[i];

    if (dateStr < today) {
      // Past day — collect rainfall
      pastDays.push(raw.daily.precipitation_sum[i]);
    } else {
      // Today or future — forecast
      const dayCondition = mapWeatherCode(raw.daily.weather_code[i]);
      forecast.push({
        date: dateStr,
        dayLabel: formatDayLabel(dateStr, today),
        tempMax: Math.round(raw.daily.temperature_2m_max[i]),
        tempMin: Math.round(raw.daily.temperature_2m_min[i]),
        rainChance: Math.round(raw.daily.precipitation_probability_max[i]),
        rainfallMm: Math.round(raw.daily.precipitation_sum[i] * 10) / 10,
        condition: dayCondition.condition,
        conditionLabel: dayCondition.label,
      });
    }
  }

  // Recent rainfall (last 7 days)
  const totalMm = Math.round(pastDays.reduce((sum, mm) => sum + mm, 0) * 10) / 10;
  const recentRainfall = {
    totalMm,
    days: pastDays.length,
    label: `${totalMm} mm in the last ${pastDays.length} days`,
  };

  return {
    current,
    forecast,
    recentRainfall,
    fetchedAt: new Date(),
  };
}

export function useWeather(track: TrackConfig): UseWeatherResult {
  const [data, setData] = useState<TrackWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchWeather = useCallback(async () => {
    const url = buildWeatherUrl(
      track.coordinates.latitude,
      track.coordinates.longitude,
      track.timezone,
    );

    try {
      setIsLoading(true);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

      const raw: OpenMeteoResponse = await res.json();
      const transformed = transformResponse(raw, track.timezone);
      setData(transformed);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather');
    } finally {
      setIsLoading(false);
    }
  }, [track.coordinates.latitude, track.coordinates.longitude, track.timezone]);

  useEffect(() => {
    fetchWeather();

    // Only set up refetch interval if initial fetch succeeds
    // The interval is cleared and re-set on each successful fetch
    intervalRef.current = setInterval(() => {
      fetchWeather();
    }, REFETCH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchWeather]);

  return { data, isLoading, error, refetch: fetchWeather };
}
