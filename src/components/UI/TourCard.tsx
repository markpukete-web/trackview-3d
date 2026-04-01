import { memo, useState, useEffect } from 'react';
import { TourStop } from '../../types/tour';
import { PointOfInterest } from '../../types/track';
import { CATEGORY_CONFIG } from './CategoryFilter';

interface TourCardProps {
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

function TourCard({
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
}: TourCardProps) {
  const [showPOIDetail, setShowPOIDetail] = useState(false);
  const isFirstStop = currentIndex === 0;
  const isLastStop = currentIndex === totalStops - 1;
  const linkedPOI = currentStop.poiId
    ? pois.find((p) => p.id === currentStop.poiId)
    : null;

  // Reset POI detail when stop changes
  useEffect(() => {
    setShowPOIDetail(false);
  }, [currentIndex]);

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-stone-500">
            Stop {currentIndex + 1} of {totalStops}
          </span>
          <button
            onClick={onEndTour}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
          >
            End tour
          </button>
        </div>
        <div className="w-full h-1 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / totalStops) * 100}%` }}
          />
        </div>
      </div>

      {/* Stop content */}
      <div>
        <h2 className="text-lg font-bold text-stone-900">{currentStop.title}</h2>
        <p className="text-sm text-stone-600 leading-relaxed mt-2">
          {currentStop.narrative}
        </p>
      </div>

      {/* Linked POI detail */}
      {linkedPOI && (
        <div>
          <button
            onClick={() => setShowPOIDetail(!showPOIDetail)}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            <span>{showPOIDetail ? 'Hide details' : 'Learn more'}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`w-3.5 h-3.5 transition-transform duration-200 ${showPOIDetail ? 'rotate-180' : ''}`}
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {showPOIDetail && (
            <div className="mt-2 pt-2 border-t border-stone-100">
              <div className="flex items-center gap-2 mb-1.5">
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
                <ul className="mt-2 space-y-1.5">
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
        </div>
      )}

      {/* Tour complete state — last stop, dwell finished, not auto-playing */}
      {isLastStop && dwellRemaining === 0 && !isAutoPlay ? (
        <div className="pt-3 border-t border-stone-100 text-center">
          <p className="text-sm font-semibold text-stone-900 mb-1">Tour Complete</p>
          <p className="text-xs text-stone-500 mb-3">You're all set for race day.</p>
          <div className="flex gap-2">
            <button
              onClick={onEndTour}
              className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Start Exploring
            </button>
            <button
              onClick={onPrev}
              className="px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        /* Navigation controls */
        <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
          <button
            onClick={onPrev}
            disabled={isFirstStop}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
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
            onClick={onToggleAutoPlay}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
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
                Auto-play
              </>
            )}
          </button>

          <button
            onClick={isLastStop ? onEndTour : onNext}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer"
          >
            {isLastStop ? 'Finish' : 'Next'}
            {!isLastStop && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(TourCard);
