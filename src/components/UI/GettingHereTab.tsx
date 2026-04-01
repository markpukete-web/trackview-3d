import { memo, useState } from 'react';
import { TrackTransport, TransportMode, TrackAccessibility } from '../../types/track';
import type { TrackWeatherData } from '../../types/weather';
import WeatherSection from './WeatherSection';
import { ChevronDown, ChevronUp, Accessibility, Users, Volume2, HeartHandshake } from 'lucide-react';

interface GettingHereTabProps {
  transport?: TrackTransport;
  accessibility?: TrackAccessibility;
  weather: TrackWeatherData | null;
  weatherLoading: boolean;
  weatherError: string | null;
}

const MODE_CONFIG: Record<TransportMode, { label: string; groupLabel: string; icon: string }> = {
  train: { label: 'Train', groupLabel: 'Public Transport', icon: 'T' },
  bus: { label: 'Bus', groupLabel: 'Public Transport', icon: 'B' },
  ferry: { label: 'Ferry', groupLabel: 'Public Transport', icon: 'F' },
  car: { label: 'Parking', groupLabel: 'Parking', icon: 'P' },
  rideshare: { label: 'Rideshare', groupLabel: 'Rideshare & Taxi', icon: 'R' },
};

// Group order for sections
const GROUP_ORDER: { key: string; label: string; modes: TransportMode[] }[] = [
  { key: 'public-transport', label: 'Public Transport', modes: ['train', 'bus', 'ferry'] },
  { key: 'parking', label: 'Parking', modes: ['car'] },
  { key: 'rideshare', label: 'Rideshare & Taxi', modes: ['rideshare'] },
];

function GettingHereTab({ transport, accessibility, weather, weatherLoading, weatherError }: GettingHereTabProps) {
  const [weatherExpanded, setWeatherExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-6 pb-6">
      
      {/* Transport Section */}
      {!transport ? (
        <p className="text-sm text-stone-400 text-center py-6">
          Transport information coming soon.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {GROUP_ORDER.map((group) => {
            const options = transport.options.filter((opt) => group.modes.includes(opt.mode));
            if (options.length === 0) return null;

            return (
              <div key={group.key}>
                <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
                  {group.label}
                </h3>
                <div className="flex flex-col gap-3">
                  {options.map((opt, i) => {
                    const modeConfig = MODE_CONFIG[opt.mode];
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="flex-shrink-0 w-7 h-7 rounded-md bg-stone-800 text-white text-xs font-bold flex items-center justify-center">
                          {modeConfig.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-800">{opt.name}</p>
                          <p className="text-sm text-stone-500 leading-relaxed mt-0.5">
                            {opt.description}
                          </p>
                          {opt.warning && (
                            <div className="mt-2 px-3 py-2 rounded-md bg-amber-50 border border-amber-200">
                              <p className="text-xs text-amber-800 leading-relaxed">
                                <span className="font-semibold">Heads up:</span> {opt.warning}
                              </p>
                            </div>
                          )}
                          {opt.tips && opt.tips.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {opt.tips.map((tip, j) => (
                                <li key={j} className="text-xs text-stone-500 flex gap-1.5">
                                  <span className="text-stone-300 flex-shrink-0">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {transport.notes && (
            <div className="pt-3 border-t border-stone-100">
              <p className="text-xs text-stone-400 leading-relaxed">{transport.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Accessibility Section */}
      {accessibility && (
        <div className="pt-1 border-t border-stone-100">
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3 pt-4">
            Accessibility
          </h3>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-stone-600 leading-relaxed">{accessibility.summary}</p>
            
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'wheelchairAccess', label: 'Wheelchair', Icon: Accessibility },
                { key: 'companionCard', label: 'Companion', Icon: Users },
                { key: 'hearingLoop', label: 'Hearing', Icon: Volume2 },
                { key: 'assistanceDogs', label: 'Service Dogs', Icon: HeartHandshake }
              ].map((feat) => {
                const isAvailable = accessibility.features[feat.key as keyof typeof accessibility.features];
                return (
                  <div
                    key={feat.key}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border ${
                      isAvailable ? 'bg-emerald-50/50 text-emerald-700 border-emerald-100' : 'bg-stone-50 text-stone-400 border-stone-100 opacity-70'
                    }`}
                  >
                    <feat.Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-[11px] uppercase tracking-wider">{feat.label}</span>
                  </div>
                );
              })}
            </div>
            
            {accessibility.mobilityDetails.length > 0 && (
              <ul className="space-y-1.5 mt-2">
                {accessibility.mobilityDetails.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-stone-500 leading-relaxed">
                    <span className="text-stone-300 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {accessibility.assistanceDetails && accessibility.assistanceDetails.length > 0 && (
              <ul className="space-y-1.5 mt-2">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Assistance</p>
                {accessibility.assistanceDetails.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-stone-500 leading-relaxed">
                    <span className="text-stone-300 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {accessibility.notes && (
              <p className="text-xs text-stone-400 leading-relaxed mt-2 p-3 bg-stone-50 rounded-lg">{accessibility.notes}</p>
            )}
          </div>
        </div>
      )}

      {/* Weather Section (Collapsible) */}
      <div className="pt-1 border-t border-stone-100">
        <button
          onClick={() => setWeatherExpanded(!weatherExpanded)}
          className="w-full mt-4 flex items-center justify-between px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100 hover:border-stone-300 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span>Race Day Weather</span>
            {(weather || weatherLoading) && !weatherExpanded && (
              <span className="text-xs text-stone-500 font-normal">
                {weatherLoading ? 'Loading...' : `${Math.round(weather!.current.temperature)}°C`}
              </span>
            )}
          </div>
          {weatherExpanded ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
        </button>
        {weatherExpanded && (
          <div className="pt-4">
            <WeatherSection weather={weather} isLoading={weatherLoading} error={weatherError} />
          </div>
        )}
      </div>

    </div>
  );
}

export default memo(GettingHereTab);
