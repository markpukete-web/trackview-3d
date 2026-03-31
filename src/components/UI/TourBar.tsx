import { memo, useState, useEffect } from 'react';
import { TourStop } from '../../types/tour';
import { PointOfInterest } from '../../types/track';
import { CATEGORY_CONFIG } from './CategoryFilter';

interface TourBarProps {
  currentStop: TourStop;
  currentIndex: number;
  totalStops: number;
  isAutoPlay: boolean;
  dwellRemaining: number;
  pois: PointOfInterest[];
  onNext: () => void;
  onPrev: () => void;
  onToggleAutoPlay: () => void;
  onEndTour: () => void;
}

function TourBar({
  currentStop,
  currentIndex,
  totalStops,
  isAutoPlay,
  dwellRemaining,
  pois,
  onNext,
  onPrev,
  onToggleAutoPlay,
  onEndTour,
}: TourBarProps) {
  const [expanded, setExpanded] = useState(false);
  const isFirstStop = currentIndex === 0;
  const isLastStop = currentIndex === totalStops - 1;
  const linkedPOI = currentStop.poiId
    ? pois.find((p) => p.id === currentStop.poiId)
    : null;

  // Auto-collapse when stop changes (e.g. after Next or auto-advance)
  useEffect(() => {
    setExpanded(false);
  }, [currentIndex]);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Progress bar — always visible at top */}
      <div className="w-full h-1 bg-gray-200">
        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / totalStops) * 100}%` }}
        />
      </div>

      <div className="bg-white/90 backdrop-blur-lg shadow-xl">
        {/* Collapsed bar */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer"
        >
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs text-gray-400">
              Stop {currentIndex + 1} of {totalStops}
            </p>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {currentStop.title}
            </p>
          </div>

          {/* Quick Next button on collapsed bar */}
          {!expanded && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isLastStop) onEndTour();
                else onNext();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-500 active:bg-blue-600 flex-shrink-0"
            >
              {isLastStop ? 'Finish' : 'Next'}
              {!isLastStop && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              )}
            </span>
          )}

          {/* Expand/collapse chevron */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          >
            <path
              fillRule="evenodd"
              d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="px-4 pb-4 max-h-[35vh] overflow-y-auto">
            {/* Narrative */}
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              {currentStop.narrative}
            </p>

            {/* Linked POI detail */}
            {linkedPOI && (
              <div className="mb-3 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        CATEGORY_CONFIG[linkedPOI.category]?.colour ?? '#6b7280',
                    }}
                  />
                  <span className="text-xs font-medium text-gray-500">
                    {CATEGORY_CONFIG[linkedPOI.category]?.label ?? linkedPOI.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {linkedPOI.description}
                </p>
                {linkedPOI.tips && linkedPOI.tips.length > 0 && (
                  <ul className="mt-1.5 space-y-1">
                    {linkedPOI.tips.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-600">
                        <span className="text-amber-500 flex-shrink-0">★</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Full controls */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={onPrev}
                disabled={isFirstStop}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isFirstStop
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
                Prev
              </button>

              <button
                onClick={onToggleAutoPlay}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isAutoPlay
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
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
                    Auto-play
                  </>
                )}
              </button>

              <button
                onClick={isLastStop ? onEndTour : onNext}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-blue-500 active:bg-blue-600 transition-colors cursor-pointer"
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
              onClick={onEndTour}
              className="w-full mt-2 text-center text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              End tour
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(TourBar);
