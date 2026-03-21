import { motion, AnimatePresence } from 'framer-motion';
import { PointOfInterest } from '../../types/track';
import { CATEGORY_CONFIG } from './CategoryFilter';

interface POIPanelProps {
  poi: PointOfInterest | null;
  onClose: () => void;
}

export default function POIPanel({ poi, onClose }: POIPanelProps) {
  return (
    <AnimatePresence>
      {poi && (
        <>
          {/* Desktop: right side panel */}
          <motion.div
            key={`desktop-${poi.id}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="hidden md:flex absolute top-0 right-0 h-full w-80 z-30 pointer-events-none"
          >
            <div className="pointer-events-auto m-4 mt-4 w-full bg-white/95 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[calc(100%-2rem)]">
              <PanelContent poi={poi} onClose={onClose} />
            </div>
          </motion.div>

          {/* Mobile: bottom sheet */}
          <motion.div
            key={`mobile-${poi.id}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden absolute bottom-0 left-0 right-0 z-30"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-t-2xl shadow-xl max-h-[60vh] overflow-y-auto">
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>
              <PanelContent poi={poi} onClose={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PanelContent({ poi, onClose }: { poi: PointOfInterest; onClose: () => void }) {
  const categoryConfig = CATEGORY_CONFIG[poi.category];

  return (
    <div className="p-4 overflow-y-auto">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900">{poi.name}</h2>
          <span
            className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: categoryConfig.colour }}
          >
            {categoryConfig.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0"
          title="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-gray-500"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <p className="mt-3 text-sm text-gray-600 leading-relaxed">{poi.description}</p>

      {poi.tips && poi.tips.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Race-Day Tips
          </h3>
          <ul className="space-y-2">
            {poi.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600">
                <span className="text-amber-500 flex-shrink-0">★</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {poi.accessibility && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Accessibility
          </h3>
          <p className="text-sm text-gray-600">{poi.accessibility}</p>
        </div>
      )}
    </div>
  );
}
