import { memo } from 'react';

interface TourButtonProps {
  estimatedMinutes: number;
  onStartTour: () => void;
  trackId?: string;
}

function TourButton({ estimatedMinutes, onStartTour, trackId }: TourButtonProps) {
  let hasCompleted = false;
  if (trackId) {
    try {
      hasCompleted = !!localStorage.getItem(`trackview-tour-completed-${trackId}`);
    } catch { /* private browsing */ }
  }

  return (
    <button
      onClick={onStartTour}
      className="w-full flex items-center gap-2.5 px-3 py-2 mb-3 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer text-left"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4 text-blue-500 flex-shrink-0"
      >
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
      <span className="text-sm font-medium text-stone-700">
        {hasCompleted ? 'Retake the guided tour' : 'Take the guided tour'}
      </span>
      <span className="text-xs text-stone-400 ml-auto">{estimatedMinutes} min</span>
    </button>
  );
}

export default memo(TourButton);
