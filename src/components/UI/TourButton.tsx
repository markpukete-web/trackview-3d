import { memo } from 'react';

interface TourButtonProps {
  estimatedMinutes: number;
  onStartTour: () => void;
}

function TourButton({ estimatedMinutes, onStartTour }: TourButtonProps) {
  return (
    <button
      onClick={onStartTour}
      className="w-full flex items-center gap-2.5 px-3 py-2 mb-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer text-left"
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
      <span className="text-sm font-medium text-gray-700">
        Take the guided tour
      </span>
      <span className="text-xs text-gray-400 ml-auto">{estimatedMinutes} min</span>
    </button>
  );
}

export default memo(TourButton);
