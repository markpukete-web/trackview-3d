import type { TrackWeatherData } from '../../types/weather';
import { WeatherIcon } from './WeatherSection';

interface WeatherBadgeProps {
  weather: TrackWeatherData | null;
  isLoading: boolean;
  onClick: () => void;
}

export default function WeatherBadge({ weather, isLoading, onClick }: WeatherBadgeProps) {
  // Don't render if loading or no data (silent failure)
  if (isLoading && !weather) return null;
  if (!weather) return null;

  return (
    <button
      onClick={onClick}
      title="View weather details"
      className="absolute top-3 right-3 md:right-[378px] bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-gray-900/90 transition-colors duration-150 cursor-pointer z-20"
    >
      <WeatherIcon condition={weather.current.condition} size={18} />
      <span className="text-sm font-bold text-white">
        {weather.current.temperature}°
      </span>
    </button>
  );
}
