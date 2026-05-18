import { MouseEvent } from 'react';
import { MapPin } from 'lucide-react';
import { tracks } from '../../data/tracks';

type TrackSwitcherVariant = 'chip' | 'map';

interface TrackSwitcherProps {
  /** Currently selected track id */
  trackId: string;
  /** Visual size — `map` is the prominent map control, `chip` is compact for drawer headers */
  variant?: TrackSwitcherVariant;
  /** Extra Tailwind classes for the outer wrapper */
  className?: string;
  /** Disable interaction (e.g. while a tour is running) */
  disabled?: boolean;
}

const trackOptions = Object.values(tracks).map((t) => ({
  id: t.id,
  shortName: t.shortName ?? t.name,
}));

function navigateToTrack(nextTrackId: string) {
  const params = new URLSearchParams(window.location.search);
  params.set('track', nextTrackId);
  window.location.search = params.toString();
}

export default function TrackSwitcher({
  trackId,
  variant = 'chip',
  className = '',
  disabled = false,
}: TrackSwitcherProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>, nextId: string) => {
    // Pills sit inside a drawer-toggle wrapper on mobile — keep clicks local.
    e.stopPropagation();
    if (disabled || nextId === trackId) return;
    navigateToTrack(nextId);
  };

  const isMap = variant === 'map';

  // Sizing per variant
  const containerSize = isMap ? 'h-11 p-1 gap-1' : 'h-8 p-0.5 gap-0.5';
  const pillSize = isMap ? 'h-9 px-3.5 text-xs' : 'h-7 px-2.5 text-[11px]';
  const iconSize = isMap ? 'h-3.5 w-3.5' : 'h-3 w-3';

  return (
    <div
      className={`inline-flex items-center ${isMap ? 'gap-2' : 'gap-1.5'} ${className}`}
      role="group"
      aria-label="Switch racecourse"
    >
      <div
        className={`flex items-center justify-center shrink-0 rounded-full bg-white border border-stone-200 text-stone-500 shadow-sm ${
          isMap ? 'h-9 w-9' : 'h-7 w-7'
        }`}
        aria-hidden="true"
      >
        <MapPin className={iconSize} />
      </div>

      <div
        className={`inline-flex items-center shrink-0 rounded-full bg-stone-100/90 border border-stone-200 ${containerSize}`}
      >
        {trackOptions.map((t) => {
          const isActive = t.id === trackId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={(e) => handleClick(e, t.id)}
              aria-pressed={isActive}
              aria-current={isActive ? 'true' : undefined}
              className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--track-brand)]/40 motion-reduce:transition-none ${pillSize} ${
                isActive
                  ? 'bg-white text-[var(--track-brand)] shadow-[0_1px_2px_rgba(0,0,0,0.08)] cursor-default'
                  : 'bg-transparent text-stone-500 hover:text-stone-800 cursor-pointer'
              } ${disabled && !isActive ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
            >
              {t.shortName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
