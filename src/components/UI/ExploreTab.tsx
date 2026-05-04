import { memo, useEffect, useRef, useState } from 'react';
import { PointOfInterest } from '../../types/track';
import { CATEGORY_CONFIG } from './CategoryFilter';

interface ExploreTabProps {
  pois: PointOfInterest[];
  selectedPOI: PointOfInterest | null;
  resultSummary: string;
  hasActiveFilter: boolean;
  onClearFilter: () => void;
  onPOIClick: (poi: PointOfInterest) => void;
  onPOIClose: () => void;
  onPOIViewOnMap: () => void;
  trackId?: string;
}

function ExploreTab({
  pois,
  selectedPOI,
  resultSummary,
  hasActiveFilter,
  onClearFilter,
  onPOIClick,
  onPOIClose,
  onPOIViewOnMap,
  trackId,
}: ExploreTabProps) {
  const [recentPoiId, setRecentPoiId] = useState<string | null>(null);
  const lastSelectedPoiId = useRef<string | null>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const clearFocusTargetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPOI) {
      lastSelectedPoiId.current = selectedPOI.id;
      setRecentPoiId(selectedPOI.id);
      return;
    }

    if (lastSelectedPoiId.current) {
      buttonRefs.current.get(lastSelectedPoiId.current)?.focus();
    }

    const timer = setTimeout(() => setRecentPoiId(null), 8000);
    return () => clearTimeout(timer);
  }, [selectedPOI]);

  useEffect(() => {
    setRecentPoiId(null);
    lastSelectedPoiId.current = null;
  }, [trackId]);

  useEffect(() => {
    if (recentPoiId && !pois.some((poi) => poi.id === recentPoiId)) {
      setRecentPoiId(null);
    }
  }, [pois, recentPoiId]);

  const handleClearFilter = () => {
    onClearFilter();
    window.requestAnimationFrame(() => {
      clearFocusTargetRef.current?.focus();
    });
  };

  if (selectedPOI) {
    return (
      <POIDetail
        poi={selectedPOI}
        onBack={onPOIClose}
        onViewOnMap={onPOIViewOnMap}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3">
        <div ref={clearFocusTargetRef} tabIndex={-1} className="rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
            Explore
          </p>
          <p className="text-sm font-semibold text-stone-700">
            {resultSummary}
          </p>
        </div>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={handleClearFilter}
            className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
          >
            All places
          </button>
        )}
      </div>

      <div className="flex flex-col">
        {pois.map((poi) => {
          const config = CATEGORY_CONFIG[poi.category];
          const isRecentPoi = recentPoiId === poi.id;

          return (
            <button
              ref={(el) => {
                if (el) buttonRefs.current.set(poi.id, el);
                else buttonRefs.current.delete(poi.id);
              }}
              key={poi.id}
              onClick={() => onPOIClick(poi)}
              className={`flex items-center gap-3 rounded-lg border-l-2 px-2 py-2.5 text-left transition-colors duration-150 hover:bg-stone-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 motion-reduce:transition-none ${
                isRecentPoi
                  ? 'border-blue-500 bg-blue-50/60'
                  : 'border-transparent'
              }`}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: config.colour }}
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-stone-800">
                {poi.name}
              </span>
              <span className="shrink-0 text-[11px] text-stone-400">
                {isRecentPoi ? 'Viewed' : config.label}
              </span>
            </button>
          );
        })}

        {pois.length === 0 && (
          <div className="py-6 text-center" role="status" aria-live="polite">
            <p className="text-sm font-medium text-stone-500">
              No places match this search.
            </p>
            <p className="mt-1 text-xs text-stone-400">
              Clear the search to see all places around the course.
            </p>
            <button
              type="button"
              onClick={handleClearFilter}
              className="mt-3 rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 motion-reduce:transition-none"
            >
              Show all places
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function POIDetail({
  poi,
  onBack,
  onViewOnMap,
}: {
  poi: PointOfInterest;
  onBack: () => void;
  onViewOnMap: () => void;
}) {
  const config = CATEGORY_CONFIG[poi.category];
  const backBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    backBtnRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <button
        ref={backBtnRef}
        onClick={onBack}
        className="-ml-0.5 flex cursor-pointer items-center gap-1.5 self-start rounded px-0.5 py-0.5 text-sm text-stone-500 transition-colors hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 motion-reduce:transition-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
            clipRule="evenodd"
          />
        </svg>
        Back to list
      </button>

      <div>
        <h2 className="text-lg font-bold text-stone-900">{poi.name}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span
            className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: config.colour }}
          >
            {config.label}
          </span>
          <button
            type="button"
            onClick={onViewOnMap}
            className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
          >
            View on map
          </button>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-stone-600">{poi.description}</p>

      {poi.tips && poi.tips.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
            Race-Day Tips
          </h3>
          <ul className="space-y-2">
            {poi.tips.map((tip, index) => (
              <li key={index} className="flex gap-2 text-sm text-stone-600">
                <span className="shrink-0 text-amber-500">★</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {poi.accessibility && (
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
            Accessibility
          </h3>
          <p className="text-sm text-stone-600">{poi.accessibility}</p>
        </div>
      )}
    </div>
  );
}

export default memo(ExploreTab);
