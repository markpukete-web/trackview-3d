import { memo } from 'react';

interface TourWelcomeProps {
  trackName: string;
  estimatedMinutes: number;
  onStartTour: () => void;
  onDismiss: () => void;
}

function TourWelcome({
  trackName,
  estimatedMinutes,
  onStartTour,
  onDismiss,
}: TourWelcomeProps) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
      <h3 className="text-sm font-bold text-gray-900">
        Welcome to {trackName}
      </h3>
      <p className="text-sm text-gray-600 mt-1">
        First time here? Take a {estimatedMinutes}-minute guided tour of the
        racecourse.
      </p>
      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={onStartTour}
          className="px-4 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
        >
          Start Tour
        </button>
        <button
          onClick={onDismiss}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default memo(TourWelcome);
