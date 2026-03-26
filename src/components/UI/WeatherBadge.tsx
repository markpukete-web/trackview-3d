import { memo } from 'react';
import type { TrackWeatherData } from '../../types/weather';
import { WeatherIcon } from './WeatherSection';

interface WeatherBadgeProps {
  weather: TrackWeatherData | null;
  isLoading: boolean;
  onClick: () => void;
}

function WeatherBadge({ weather, isLoading, onClick }: WeatherBadgeProps) {
  // Don't render if loading or no data (silent failure)
  if (isLoading && !weather) return null;
  if (!weather) return null;

  return (
    <button
      onClick={onClick}
      title="View weather details"
      className="absolute top-3 right-3 md:right-[378px] bg-gray-900/60 backdrop-blur-md rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-gray-900/70 transition-colors duration-150 cursor-pointer z-20"
    >
      <WeatherIcon condition={weather.current.condition} size={18} />
      <span className="text-sm font-bold text-white">
        {weather.current.temperature}°
      </span>
    </button>
  );
}

export default memo(WeatherBadge);
