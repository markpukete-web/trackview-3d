import { memo } from 'react';
import type { TrackWeatherData } from '../../types/weather';
import { WeatherIcon } from './WeatherSection';
import { getCategoryBadgeStyle } from '../../utils/trackCondition';

interface WeatherBadgeProps {
  weather: TrackWeatherData | null;
  isLoading: boolean;
  onClick: () => void;
  avoidDesktopDrawer?: boolean;
}

function WeatherBadge({ weather, isLoading, onClick, avoidDesktopDrawer = false }: WeatherBadgeProps) {
  // Don't render if loading or no data (silent failure)
  if (isLoading && !weather) return null;
  if (!weather) return null;

  const { trackCondition } = weather;
  const badgeStyle = getCategoryBadgeStyle(trackCondition.category);

  return (
    <button
      type="button"
      onClick={onClick}
      title={`Weather: ${weather.current.temperature}°C · Track: ${trackCondition.rating}`}
      aria-label={`View weather and track condition (${weather.current.temperature}°C, ${trackCondition.rating})`}
      className={`absolute top-[9.5rem] right-3 md:top-3 bg-stone-900/75 backdrop-blur-md rounded-xl px-3 py-2 flex items-center gap-2.5 hover:bg-stone-900/85 transition-colors duration-150 cursor-pointer z-20 shadow-lg border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900 ${
        avoidDesktopDrawer ? 'md:right-[378px]' : 'md:right-3'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <WeatherIcon condition={weather.current.condition} size={18} />
        <span className="text-sm font-bold text-white">
          {weather.current.temperature}°
        </span>
      </div>
      <div className="h-3.5 w-px bg-white/20" aria-hidden="true" />
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${badgeStyle.dot}`} aria-hidden="true" />
        <span className="text-xs font-semibold text-white/95">
          {trackCondition.rating}{trackCondition.isEstimated ? ' Est.' : ''}
        </span>
      </div>
    </button>
  );
}

export default memo(WeatherBadge);
