import { memo, useState } from 'react';

type ConfidenceValue = 'more' | 'same' | 'unsure';

const CONFIDENCE_OPTIONS: { value: ConfidenceValue; label: string }[] = [
  { value: 'more', label: 'More confident' },
  { value: 'same', label: 'About the same' },
  { value: 'unsure', label: 'Still unsure' },
];

interface TourCompletionProps {
  trackId: string;
  tourId: string;
  onPlanArrival: () => void;
  onExplore: () => void;
}

function TourCompletion({ trackId, tourId, onPlanArrival, onExplore }: TourCompletionProps) {
  const storageKey = `trackview-confidence-${trackId}-${tourId}`;
  const [chipExpanded, setChipExpanded] = useState(false);
  const [selected, setSelected] = useState<ConfidenceValue | null>(() => {
    try {
      const v = localStorage.getItem(storageKey);
      return CONFIDENCE_OPTIONS.some((o) => o.value === v) ? (v as ConfidenceValue) : null;
    } catch { return null; }
  });

  const handleSelect = (value: ConfidenceValue) => {
    setSelected(value);
    try { localStorage.setItem(storageKey, value); } catch { /* private browsing */ }
  };

  return (
    <div className="pt-3 border-t border-stone-100 text-center">
      <p className="text-sm font-semibold text-stone-900 mb-1">Tour complete</p>
      <p className="text-xs text-stone-500 mb-3">You&apos;re ready for race day.</p>
      <div className="flex flex-col gap-2">
        <button
          onClick={onPlanArrival}
          className="w-full px-3 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer"
        >
          Plan your arrival
        </button>
        <button
          onClick={onExplore}
          className="w-full px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          Explore the map
        </button>
      </div>

      <div className="mt-4 min-h-[28px]">
        {selected !== null ? (
          <div className="flex flex-col items-center gap-1">
            <div className="flex gap-1.5 flex-wrap justify-center">
              {CONFIDENCE_OPTIONS.map((opt) => (
                <span
                  key={opt.value}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    selected === opt.value
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-stone-100 text-stone-300'
                  }`}
                >
                  {opt.label}
                </span>
              ))}
            </div>
            <p className="text-xs text-stone-400 mt-1">Thanks for the note.</p>
          </div>
        ) : !chipExpanded ? (
          <button
            onClick={() => setChipExpanded(true)}
            aria-expanded={false}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
          >
            How was that? →
          </button>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-xs text-stone-400">How was that?</p>
            <div className="flex gap-1.5 flex-wrap justify-center">
              {CONFIDENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className="text-xs px-3 py-1 rounded-full border border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(TourCompletion);
