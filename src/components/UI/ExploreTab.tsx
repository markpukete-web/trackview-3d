import { useState, useMemo, memo, useEffect, useRef } from 'react';
import { PointOfInterest, POICategory } from '../../types/track';
import { CATEGORY_CONFIG } from './CategoryFilter';

import TourWelcome from './TourWelcome';
import TourButton from './TourButton';

interface ExploreTabProps {
  pois: PointOfInterest[];
  activeCategories: Set<POICategory>;
  availableCategories: POICategory[];
  selectedPOI: PointOfInterest | null;
  onCategoryToggle: (category: POICategory) => void;
  onPOIClick: (poi: PointOfInterest) => void;
  onPOIClose: () => void;
  trackId?: string;
  trackName?: string;
  tourAvailable?: boolean;
  tourMinutes?: number;
  onStartTour?: () => void;
}

function ExploreTab({
  pois,
  activeCategories,
  availableCategories,
  selectedPOI,
  onCategoryToggle,
  onPOIClick,
  onPOIClose,
  trackId,
  trackName,
  tourAvailable,
  tourMinutes,
  onStartTour,
}: ExploreTabProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const tourDismissedKey = trackId ? `trackview-tour-dismissed-${trackId}` : null;
  const [showWelcome, setShowWelcome] = useState(() => {
    if (!tourDismissedKey) return false;
    try {
      return !localStorage.getItem(tourDismissedKey);
    } catch {
      return true;
    }
  });

  const handleDismissWelcome = () => {
    setShowWelcome(false);
    if (tourDismissedKey) {
      try {
        localStorage.setItem(tourDismissedKey, '1');
      } catch { /* private browsing — harmless */ }
    }
  };

  const handleStartTourFromWelcome = () => {
    handleDismissWelcome();
    onStartTour?.();
  };

  const lastSelectedPoiId = useRef<string | null>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    if (selectedPOI) {
      lastSelectedPoiId.current = selectedPOI.id;
    } else if (lastSelectedPoiId.current) {
      // Focus using the mapped ref
      const btn = buttonRefs.current.get(lastSelectedPoiId.current);
      btn?.focus();
    }
  }, [selectedPOI]);

  const filteredPOIs = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return pois.filter((poi) => {
      const matchesCategory = activeCategories.has(poi.category);
      const matchesSearch =
        searchLower === '' ||
        poi.name.toLowerCase().includes(searchLower) ||
        poi.description.toLowerCase().includes(searchLower);
      return matchesCategory && matchesSearch;
    });
  }, [pois, activeCategories, searchQuery]);

  // Detail view — replaces list entirely
  if (selectedPOI) {
    return <POIDetail poi={selectedPOI} onBack={onPOIClose} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Tour welcome card (first visit) */}
      {tourAvailable && showWelcome && trackName && tourMinutes && (
        <TourWelcome
          trackName={trackName}
          estimatedMinutes={tourMinutes}
          onStartTour={handleStartTourFromWelcome}
          onDismiss={handleDismissWelcome}
        />
      )}

      {/* Tour button (returning visitors or after dismiss) */}
      {tourAvailable && !showWelcome && tourMinutes && onStartTour && (
        <TourButton
          estimatedMinutes={tourMinutes}
          onStartTour={onStartTour}
          trackId={trackId}
        />
      )}

      {/* Search Bar */}
      <div className="relative sticky top-0 z-10 bg-white/85 backdrop-blur-lg pb-2 -mx-1 px-1">
        <div className="relative flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-100/80 text-sm text-stone-900 placeholder-stone-500 rounded-lg pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-transparent focus:border-blue-500/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-200 transition-colors"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        {availableCategories.map((cat) => {
          const config = CATEGORY_CONFIG[cat];
          const isActive = activeCategories.has(cat);
          return (
            <button
              type="button"
              key={cat}
              onClick={() => onCategoryToggle(cat)}
              aria-pressed={isActive}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                isActive
                  ? 'text-white shadow-sm'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
              style={isActive ? { backgroundColor: config.colour } : undefined}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      {/* POI list */}
      <div className="flex flex-col">
        {filteredPOIs.map((poi) => {
          const config = CATEGORY_CONFIG[poi.category];
          return (
            <button
              ref={(el) => {
                if (el) buttonRefs.current.set(poi.id, el);
                else buttonRefs.current.delete(poi.id);
              }}
              key={poi.id}
              onClick={() => onPOIClick(poi)}
              className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-stone-50 hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:shadow-sm transition-all duration-200 text-left cursor-pointer"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: config.colour }}
              />
              <span className="flex-1 text-sm font-medium text-stone-800 min-w-0 truncate">
                {poi.name}
              </span>
              <span className="text-[11px] text-stone-400 flex-shrink-0">
                {config.label}
              </span>
            </button>
          );
        })}
        {filteredPOIs.length === 0 && (
          <p className="text-sm text-stone-400 text-center py-6">
            {searchQuery
              ? `No results for "${searchQuery}"`
              : 'No points of interest match the selected filters.'}
          </p>
        )}
      </div>
    </div>
  );
}

function POIDetail({ poi, onBack }: { poi: PointOfInterest; onBack: () => void }) {
  const config = CATEGORY_CONFIG[poi.category];
  const backBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    backBtnRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {/* Back button */}
      <button
        ref={backBtnRef}
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded transition-colors cursor-pointer self-start -ml-0.5 px-0.5 py-0.5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
            clipRule="evenodd"
          />
        </svg>
        Back to list
      </button>

      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-stone-900">{poi.name}</h2>
        <span
          className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: config.colour }}
        >
          {config.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-stone-600 leading-relaxed">{poi.description}</p>

      {/* Tips */}
      {poi.tips && poi.tips.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
            Race-Day Tips
          </h3>
          <ul className="space-y-2">
            {poi.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-stone-600">
                <span className="text-amber-500 flex-shrink-0">★</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Accessibility */}
      {poi.accessibility && (
        <div>
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">
            Accessibility
          </h3>
          <p className="text-sm text-stone-600">{poi.accessibility}</p>
        </div>
      )}
    </div>
  );
}

export default memo(ExploreTab);
