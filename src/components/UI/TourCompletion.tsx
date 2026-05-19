import { memo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

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

  const reduceMotion = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const; // ease-out-quint

  return (
    <div className="pt-3 border-t border-stone-100 text-center">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease }}
        className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--track-brand)]/10"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <motion.path
            d="M5 12.5 L10 17.5 L19 7.5"
            stroke="var(--track-brand)"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, delay: 0.18, ease }}
          />
        </svg>
      </motion.div>
      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.32, ease }}
        className="text-sm font-semibold text-stone-900 mb-1"
      >
        Tour complete
      </motion.p>
      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.42, ease }}
        className="text-xs text-stone-500 mb-3"
      >
        You&apos;re ready for race day.
      </motion.p>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.52, ease }}
        className="flex flex-col gap-2"
      >
        <button
          onClick={onPlanArrival}
          className="w-full px-3 py-2 rounded-lg text-sm font-medium text-white bg-[var(--track-brand)] hover:bg-[var(--track-brand)]/90 transition-colors cursor-pointer"
        >
          Plan your arrival
        </button>
        <button
          onClick={onExplore}
          className="w-full px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          Explore the map
        </button>
      </motion.div>

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
