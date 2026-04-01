import { memo } from 'react';
import type { TrackWeatherData, WeatherCondition } from '../../types/weather';
import { windDirectionLabel } from '../../utils/weather';

interface WeatherSectionProps {
  weather: TrackWeatherData | null;
  isLoading: boolean;
  error: string | null;
}

function WeatherSection({ weather, isLoading, error }: WeatherSectionProps) {
  if (isLoading && !weather) {
    return (
      <div className="animate-pulse space-y-3 pb-4 mb-4 border-b border-stone-100">
        <div className="h-4 w-32 bg-stone-200 rounded" />
        <div className="h-8 w-48 bg-stone-200 rounded" />
        <div className="h-3 w-40 bg-stone-200 rounded" />
        <div className="flex gap-2">
          <div className="h-20 flex-1 bg-stone-200 rounded" />
          <div className="h-20 flex-1 bg-stone-200 rounded" />
          <div className="h-20 flex-1 bg-stone-200 rounded" />
        </div>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="pb-4 mb-4 border-b border-stone-100">
        <p className="text-sm text-stone-400">Weather data unavailable.</p>
      </div>
    );
  }

  if (!weather) return null;

  const { current, forecast, recentRainfall } = weather;

  return (
    <div className="pb-4 mb-4 border-b border-stone-100 flex flex-col gap-4">
      {/* Current conditions */}
      <div>
        <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
          Current Conditions
        </h3>
        <div className="flex items-center gap-3">
          <WeatherIcon condition={current.condition} size={28} />
          <div>
            <p className="text-xl font-bold text-stone-900">
              {current.temperature}° <span className="text-sm font-normal text-stone-500">{current.conditionLabel}</span>
            </p>
            <p className="text-xs text-stone-500">
              Wind: {current.windSpeed} km/h {windDirectionLabel(current.windDirection)} · Humidity: {current.humidity}%
            </p>
          </div>
        </div>
      </div>

      {/* 3-day forecast */}
      {forecast.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
            Forecast
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {forecast.map((day) => (
              <div
                key={day.date}
                className="bg-stone-50 rounded-lg px-2.5 py-2.5 text-center"
              >
                <p className="text-xs font-medium text-stone-700 mb-1.5 truncate">
                  {day.dayLabel}
                </p>
                <div className="flex justify-center mb-1.5">
                  <WeatherIcon condition={day.condition} size={20} />
                </div>
                <p className="text-sm font-bold text-stone-900">{day.tempMax}°</p>
                <p className="text-xs text-stone-400">{day.tempMin}°</p>
                <p className={`text-xs mt-1 font-medium ${
                  day.rainChance > 50 ? 'text-amber-600' : 'text-stone-400'
                }`}>
                  {day.rainChance}% rain
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent rainfall */}
      <div>
        <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">
          Recent Rainfall
        </h3>
        <p className={`text-sm font-medium ${
          recentRainfall.totalMm > 30
            ? 'text-red-600'
            : recentRainfall.totalMm > 15
              ? 'text-amber-600'
              : 'text-stone-700'
        }`}>
          {recentRainfall.label}
        </p>
      </div>

      {/* Track condition disclaimer */}
      <div className="border-l-2 border-stone-200 pl-3">
        <p className="text-xs text-stone-400 leading-relaxed">
          Official track condition is set by stewards on race-day morning.{' '}
          <a
            href="https://www.racingqueensland.com.au/racing/track-conditions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 underline"
          >
            Check Racing Queensland
          </a>
        </p>
      </div>
    </div>
  );
}

/** SVG weather condition icons */
export function WeatherIcon({ condition, size = 20 }: { condition: WeatherCondition; size?: number }) {
  const s = size;
  const props = {
    width: s,
    height: s,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
  };

  switch (condition) {
    case 'clear':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="5" fill="#f59e0b" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 12 + Math.cos(rad) * 7;
            const y1 = 12 + Math.sin(rad) * 7;
            const x2 = 12 + Math.cos(rad) * 9;
            const y2 = 12 + Math.sin(rad) * 9;
            return (
              <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            );
          })}
        </svg>
      );

    case 'partly-cloudy':
      return (
        <svg {...props}>
          <circle cx="9" cy="9" r="4" fill="#f59e0b" />
          {[0, 60, 120, 240, 300].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 9 + Math.cos(rad) * 5.5;
            const y1 = 9 + Math.sin(rad) * 5.5;
            const x2 = 9 + Math.cos(rad) * 7;
            const y2 = 9 + Math.sin(rad) * 7;
            return (
              <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
            );
          })}
          <path d="M8 17h10a4 4 0 0 0 0-8h-.5A5.5 5.5 0 0 0 7 10.5V11a4 4 0 0 0 1 6z" fill="#cbd5e1" />
        </svg>
      );

    case 'cloudy':
      return (
        <svg {...props}>
          <path d="M6 18h12a5 5 0 0 0 0-10h-.5A6 6 0 0 0 5.5 10V11a5 5 0 0 0 .5 7z" fill="#94a3b8" />
        </svg>
      );

    case 'fog':
      return (
        <svg {...props}>
          <line x1="3" y1="8" x2="21" y2="8" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <line x1="5" y1="12" x2="19" y2="12" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <line x1="3" y1="16" x2="21" y2="16" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'drizzle':
      return (
        <svg {...props}>
          <path d="M6 14h10a4 4 0 0 0 0-8h-.5A5 5 0 0 0 5.5 7.5V8a4 4 0 0 0 .5 6z" fill="#94a3b8" />
          <line x1="8" y1="17" x2="8" y2="19" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="17" x2="12" y2="19" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'rain':
      return (
        <svg {...props}>
          <path d="M6 13h10a4 4 0 0 0 0-8h-.5A5 5 0 0 0 5.5 6.5V7a4 4 0 0 0 .5 6z" fill="#94a3b8" />
          <line x1="7" y1="16" x2="6" y2="20" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="11" y1="16" x2="10" y2="20" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="15" y1="16" x2="14" y2="20" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'heavy-rain':
      return (
        <svg {...props}>
          <path d="M6 12h10a4 4 0 0 0 0-8h-.5A5 5 0 0 0 5.5 5.5V6a4 4 0 0 0 .5 6z" fill="#64748b" />
          <line x1="6" y1="15" x2="5" y2="20" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
          <line x1="10" y1="15" x2="9" y2="20" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
          <line x1="14" y1="15" x2="13" y2="20" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
          <line x1="18" y1="15" x2="17" y2="20" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'thunderstorm':
      return (
        <svg {...props}>
          <path d="M6 12h10a4 4 0 0 0 0-8h-.5A5 5 0 0 0 5.5 5.5V6a4 4 0 0 0 .5 6z" fill="#64748b" />
          <polygon points="12,14 9,19 11,19 10,23 15,17 12.5,17 14,14" fill="#facc15" />
        </svg>
      );

    case 'snow':
      return (
        <svg {...props}>
          <path d="M6 13h10a4 4 0 0 0 0-8h-.5A5 5 0 0 0 5.5 6.5V7a4 4 0 0 0 .5 6z" fill="#94a3b8" />
          <circle cx="8" cy="17" r="1" fill="#bfdbfe" />
          <circle cx="12" cy="19" r="1" fill="#bfdbfe" />
          <circle cx="16" cy="17" r="1" fill="#bfdbfe" />
        </svg>
      );
  }
}

export default memo(WeatherSection);
