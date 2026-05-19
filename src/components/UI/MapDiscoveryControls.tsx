import { memo, useRef } from 'react';
import {
  Search,
  X,
  Eye,
  Utensils,
  Info,
  TrainFront,
  PlayCircle,
  ChevronLeft,
} from 'lucide-react';
import { ActiveFilter, POIIntentId } from '../../types/discovery';
import { POI_INTENT_CONFIG, POI_INTENT_ORDER } from '../../constants/discovery';
import TrackSwitcher from './TrackSwitcher';

const INTENT_ICONS: Record<POIIntentId, typeof Eye> = {
  watch: Eye,
  'food-drink': Utensils,
  amenities: Info,
};

interface MapDiscoveryControlsProps {
  trackId: string;
  trackName: string;
  activeFilter: ActiveFilter;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  onIntentSelect: (intentId: POIIntentId) => void;
  onClearFilter: () => void;
  onArrivalClick: () => void;
  onTourClick: () => void;
  onBackToLanding: () => void;
  tourAvailable: boolean;
  arrivalActive: boolean;
  desktopDrawerOpen: boolean;
  mobileControlsHidden: boolean;
}

function MapDiscoveryControls({
  trackId,
  trackName,
  activeFilter,
  searchValue,
  onSearchChange,
  onSearchClear,
  onIntentSelect,
  onClearFilter,
  onArrivalClick,
  onTourClick,
  onBackToLanding,
  tourAvailable,
  arrivalActive,
  desktopDrawerOpen,
  mobileControlsHidden,
}: MapDiscoveryControlsProps) {
  const trimmedSearch = searchValue.trim();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchClear = () => {
    onSearchClear();
    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  };

  const hasActiveFilter =
    activeFilter.kind !== 'none' || trimmedSearch.length > 0 || arrivalActive;

  return (
    <div
      className={`pointer-events-none absolute left-3 right-3 top-3 z-30 transition duration-200 motion-reduce:transition-none md:left-4 md:right-auto md:w-fit md:translate-y-0 md:opacity-100 ${
        mobileControlsHidden ? 'pointer-events-none -translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
      } ${
        desktopDrawerOpen
          ? 'md:max-w-[calc(100vw-28rem)]'
          : 'md:max-w-[calc(100vw-2rem)]'
      }`}
    >
      <div className={`${mobileControlsHidden ? 'pointer-events-none' : 'pointer-events-auto'} rounded-2xl border border-white/70 bg-white/90 p-2.5 shadow-xl backdrop-blur-xl md:pointer-events-auto w-full md:w-fit`}>
        
        {/* Row 1: Venue Switcher and Search */}
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToLanding}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white border border-stone-200 px-3 text-xs font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none cursor-pointer"
              aria-label="Back to all racecourses"
              title="All racecourses"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">All racecourses</span>
            </button>
            <TrackSwitcher trackId={trackId} variant="map" />
          </div>

          <div className="relative flex-1 flex items-center min-w-[200px]">
            <label className="sr-only" htmlFor="trackview-map-search">
              Search {trackName}
            </label>
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
        </div>

        {/* Row 2: Horizontal Scrollable Tabs */}
        <div
          className="mt-2.5 flex min-w-0 gap-2 overflow-x-auto overscroll-x-contain pb-0.5 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,black_calc(100%-1.5rem),transparent)] [-webkit-mask-image:linear-gradient(to_right,black_calc(100%-1.5rem),transparent)] md:overflow-x-visible md:[mask-image:none] md:[-webkit-mask-image:none]"
          role="toolbar"
          aria-label="Map discovery controls"
        >
          <div className="flex min-w-max shrink-0 gap-2" role="radiogroup" aria-label="Filter places">
            {POI_INTENT_ORDER.map((intentId) => {
              const config = POI_INTENT_CONFIG[intentId];
              const Icon = INTENT_ICONS[intentId];
              const isActive =
                activeFilter.kind === 'intent' && activeFilter.id === intentId && !trimmedSearch;

              return (
                <button
                  key={intentId}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => onIntentSelect(intentId)}
                  className={`flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700/50 motion-reduce:transition-none cursor-pointer ${
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

          <div className="h-9 w-px shrink-0 bg-stone-200" aria-hidden="true" />

          <button
            type="button"
            onClick={onArrivalClick}
            className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700/50 motion-reduce:transition-none cursor-pointer ${
              arrivalActive
                ? 'border-cyan-700 bg-cyan-700 text-white shadow-sm'
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
              className="group flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50/60 px-3.5 text-xs font-semibold text-cyan-800 transition hover:border-cyan-300 hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none cursor-pointer"
            >
              <PlayCircle className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:scale-110 motion-reduce:transform-none" />
              <span>Take the tour</span>
            </button>
          )}

          {hasActiveFilter && (
            <button
              type="button"
              onClick={onClearFilter}
              className="flex h-9 shrink-0 items-center gap-1 rounded-full border border-dashed border-stone-300 bg-stone-50/50 px-3 text-xs font-semibold text-stone-500 hover:border-stone-400 hover:bg-stone-50 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500/50 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(MapDiscoveryControls);
