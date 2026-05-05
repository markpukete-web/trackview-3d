import { memo, useRef } from 'react';
import {
  Eye,
  Info,
  PlayCircle,
  Search,
  TrainFront,
  Utensils,
  X,
} from 'lucide-react';
import { ActiveFilter, POIIntentId } from '../../types/discovery';
import { POI_INTENT_CONFIG, POI_INTENT_ORDER } from '../../constants/discovery';

interface MapDiscoveryControlsProps {
  trackName: string;
  activeFilter: ActiveFilter;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  onIntentSelect: (intentId: POIIntentId) => void;
  onClearFilter: () => void;
  onArrivalClick: () => void;
  onTourClick: () => void;
  tourAvailable: boolean;
  arrivalActive: boolean;
  desktopDrawerOpen: boolean;
}

const INTENT_ICONS: Record<POIIntentId, typeof Eye> = {
  watch: Eye,
  'food-drink': Utensils,
  amenities: Info,
};

function MapDiscoveryControls({
  trackName,
  activeFilter,
  searchValue,
  onSearchChange,
  onSearchClear,
  onIntentSelect,
  onClearFilter,
  onArrivalClick,
  onTourClick,
  tourAvailable,
  arrivalActive,
  desktopDrawerOpen,
}: MapDiscoveryControlsProps) {
  const trimmedSearch = searchValue.trim();
  const hasActiveFilter = activeFilter.kind !== 'none' || trimmedSearch.length > 0;
  const searchInputRef = useRef<HTMLInputElement>(null);

  const focusSearchInput = () => {
    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  };

  const handleSearchClear = () => {
    onSearchClear();
    focusSearchInput();
  };

  const handleClearFilter = () => {
    onClearFilter();
    focusSearchInput();
  };

  return (
    <div
      className={`pointer-events-none absolute left-3 right-3 top-3 z-30 md:left-4 md:right-auto ${
        desktopDrawerOpen
          ? 'md:w-[min(50rem,calc(100vw-28rem))]'
          : 'md:w-[min(50rem,calc(100vw-2rem))]'
      }`}
    >
      <div className="pointer-events-auto rounded-2xl border border-white/70 bg-white/90 p-2.5 shadow-xl backdrop-blur-xl">
        <label className="sr-only" htmlFor="trackview-map-search">
          Search {trackName}
        </label>
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-stone-500" />
          <input
            ref={searchInputRef}
            id="trackview-map-search"
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={`Search ${trackName}`}
            className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-10 text-sm font-medium text-stone-900 outline-none transition focus:border-cyan-700/40 focus:bg-white focus:ring-2 focus:ring-cyan-700/20 motion-reduce:transition-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
          />
          {trimmedSearch && (
            <button
              type="button"
              onClick={handleSearchClear}
              className="absolute right-2.5 rounded-full p-1.5 text-stone-500 transition hover:bg-stone-200 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700/50 motion-reduce:transition-none"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div
          className="mt-2 flex min-w-0 gap-2 overflow-x-auto overscroll-x-contain pb-0.5 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,black_calc(100%-1.5rem),transparent)] [-webkit-mask-image:linear-gradient(to_right,black_calc(100%-1.5rem),transparent)]"
          role="toolbar"
          aria-label="Map discovery controls"
        >
          <div className="flex min-w-max shrink-0 gap-2" role="radiogroup" aria-label="Filter places">
            {POI_INTENT_ORDER.map((intentId) => {
              const config = POI_INTENT_CONFIG[intentId];
              const Icon = INTENT_ICONS[intentId];
              const isActive = activeFilter.kind === 'intent' && activeFilter.id === intentId && !trimmedSearch;

              return (
                <button
                  key={intentId}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => onIntentSelect(intentId)}
                  className={`flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none ${
                    isActive
                      ? 'border-cyan-700 bg-cyan-700 text-white shadow-sm'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onArrivalClick}
            className={`flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none ${
              arrivalActive
                ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50'
            }`}
          >
            <TrainFront className="h-3.5 w-3.5" />
            <span>Entry & transport</span>
          </button>

          {tourAvailable && (
            <button
              type="button"
              onClick={onTourClick}
              className="flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              <span>Take the tour</span>
            </button>
          )}

          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleClearFilter}
              className="flex h-10 shrink-0 items-center whitespace-nowrap rounded-full border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-500 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
            >
              All places
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(MapDiscoveryControls);
