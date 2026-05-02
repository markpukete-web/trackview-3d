import { memo, useState, useEffect } from 'react';
import { TourStop } from '../../types/tour';
import { PointOfInterest } from '../../types/track';
import { CATEGORY_CONFIG } from './CategoryFilter';
import TourCompletion from './TourCompletion';

const TOUR_BAR_PANEL_ID = 'trackview-mobile-tour-panel';

interface TourBarProps {
  currentStop: TourStop;
  currentIndex: number;
  totalStops: number;
  isAutoPlay: boolean;
  autoPlayWasActive: boolean;
  isOrbiting: boolean;
  dwellRemaining: number;
  pois: PointOfInterest[];
  trackId: string;
  tourId: string;
  onNext: () => void;
  onPrev: () => void;
  onToggleAutoPlay: () => void;
  onEndTour: () => void;
  onPlanArrival: () => void;
}

function TourBar({
  currentStop,
  currentIndex,
  totalStops,
  isAutoPlay,
  autoPlayWasActive,
  isOrbiting,
  dwellRemaining,
  pois,
  trackId,
  tourId,
  onNext,
  onPrev,
  onToggleAutoPlay,
  onEndTour,
  onPlanArrival,
}: TourBarProps) {
  const [expanded, setExpanded] = useState(false);
  const isFirstStop = currentIndex === 0;
  const isLastStop = currentIndex === totalStops - 1;
  const isCompletion = isLastStop && dwellRemaining === 0 && !isAutoPlay;
  const quickActionLabel = isCompletion ? 'Plan your arrival' : isLastStop ? 'Finish' : 'Next';
  const linkedPOI = currentStop.poiId
    ? pois.find((p) => p.id === currentStop.poiId)
    : null;

  // Auto-collapse when stop changes (e.g. after Next or auto-advance)
  useEffect(() => {
    setExpanded(false);
  }, [currentIndex]);

  // Auto-expand on completion so mobile users see the CTA pivot + chip
  useEffect(() => {
    if (isCompletion) setExpanded(true);
  }, [isCompletion]);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Progress bar — always visible at top */}
      <div className="w-full h-1 bg-stone-200">
        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / totalStops) * 100}%` }}
        />
      </div>

      <div className="bg-white/90 backdrop-blur-lg shadow-xl">
        {/* Collapsed bar */}
        <div className="w-full flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls={TOUR_BAR_PANEL_ID}
            className="flex flex-1 min-w-0 items-center gap-3 text-left cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-stone-400">
                {isCompletion ? 'Tour complete' : `Stop ${currentIndex + 1} of ${totalStops}`}
              </p>
              <p className="text-sm font-semibold text-stone-900 truncate">
                {isCompletion ? "You're ready for race day" : currentStop.title}
              </p>
            </div>

          {/* Expand/collapse chevron */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`w-4 h-4 text-stone-400 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          >
            <path
              fillRule="evenodd"
              d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
              clipRule="evenodd"
            />
          </svg>
          </button>

          {/* Quick action on collapsed bar */}
          {!expanded && (
            <button
              type="button"
              onClick={() => {
                if (isCompletion) onPlanArrival();
                else if (isLastStop) onEndTour();
                else onNext();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-500 active:bg-blue-600 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              {quickActionLabel}
              {!isLastStop && !isCompletion && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Expanded content */}
        {expanded && (
          <div id={TOUR_BAR_PANEL_ID} className="px-4 pb-4 max-h-[35vh] overflow-y-auto">
            {/* Narrative */}
            <p className="text-sm text-stone-600 leading-relaxed mb-3">
              {currentStop.narrative}
            </p>

            {/* Linked POI detail */}
            {linkedPOI && (
              <div className="mb-3 pt-2 border-t border-stone-100">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        CATEGORY_CONFIG[linkedPOI.category]?.colour ?? '#6b7280',
                    }}
                  />
                  <span className="text-xs font-medium text-stone-500">
                    {CATEGORY_CONFIG[linkedPOI.category]?.label ?? linkedPOI.category}
                  </span>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {linkedPOI.description}
                </p>
                {linkedPOI.tips && linkedPOI.tips.length > 0 && (
                  <ul className="mt-1.5 space-y-1">
                    {linkedPOI.tips.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-sm text-stone-600">
                        <span className="text-amber-500 flex-shrink-0">★</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {isCompletion ? (
              <TourCompletion
                trackId={trackId}
                tourId={tourId}
                onPlanArrival={onPlanArrival}
                onExplore={onEndTour}
              />
            ) : (
              <>
                {!isOrbiting && dwellRemaining > 0 && !!currentStop.orbit && (
                  <p className="text-xs text-stone-400 text-center">Paused — tap to resume</p>
                )}
                {/* Full controls */}
                <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={onPrev}
                    disabled={isFirstStop}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                      isFirstStop
                        ? 'text-stone-300 cursor-not-allowed'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                    Prev
                  </button>

                  <button
                    type="button"
                    onClick={onToggleAutoPlay}
                    aria-pressed={isAutoPlay}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                      isAutoPlay
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    {isAutoPlay ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
                        </svg>
                        {dwellRemaining > 0 ? `${dwellRemaining}s` : 'Playing'}
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                        {autoPlayWasActive ? 'Resume' : 'Auto-play'}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={isLastStop ? onEndTour : onNext}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-blue-500 active:bg-blue-600 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    {isLastStop ? 'Finish' : 'Next'}
                    {!isLastStop && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* End tour link */}
                <button
                  type="button"
                  onClick={onEndTour}
                  className="w-full mt-2 text-center text-xs text-stone-400 hover:text-stone-600 transition-colors cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  End tour
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(TourBar);
