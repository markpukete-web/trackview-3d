import { TrackTransport, TransportMode } from '../../types/track';

interface GettingHereTabProps {
  transport?: TrackTransport;
}

const MODE_CONFIG: Record<TransportMode, { label: string; groupLabel: string; icon: string }> = {
  train: { label: 'Train', groupLabel: 'Public Transport', icon: 'T' },
  bus: { label: 'Bus', groupLabel: 'Public Transport', icon: 'B' },
  ferry: { label: 'Ferry', groupLabel: 'Public Transport', icon: 'F' },
  car: { label: 'Parking', groupLabel: 'Parking', icon: 'P' },
  rideshare: { label: 'Rideshare', groupLabel: 'Rideshare & Taxi', icon: 'R' },
};

// Group order for sections
const GROUP_ORDER: { key: string; label: string; modes: TransportMode[] }[] = [
  { key: 'public-transport', label: 'Public Transport', modes: ['train', 'bus', 'ferry'] },
  { key: 'parking', label: 'Parking', modes: ['car'] },
  { key: 'rideshare', label: 'Rideshare & Taxi', modes: ['rideshare'] },
];

export default function GettingHereTab({ transport }: GettingHereTabProps) {
  if (!transport) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        Transport information coming soon.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {GROUP_ORDER.map((group) => {
        const options = transport.options.filter((opt) => group.modes.includes(opt.mode));
        if (options.length === 0) return null;

        return (
          <div key={group.key}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {group.label}
            </h3>
            <div className="flex flex-col gap-3">
              {options.map((opt, i) => {
                const modeConfig = MODE_CONFIG[opt.mode];
                return (
                  <div key={i} className="flex gap-3">
                    {/* Mode badge */}
                    <div className="flex-shrink-0 w-7 h-7 rounded-md bg-gray-800 text-white text-xs font-bold flex items-center justify-center">
                      {modeConfig.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{opt.name}</p>
                      <p className="text-sm text-gray-500 leading-relaxed mt-0.5">
                        {opt.description}
                      </p>

                      {/* Warning callout */}
                      {opt.warning && (
                        <div className="mt-2 px-3 py-2 rounded-md bg-amber-50 border border-amber-200">
                          <p className="text-xs text-amber-800 leading-relaxed">
                            <span className="font-semibold">Heads up:</span> {opt.warning}
                          </p>
                        </div>
                      )}

                      {/* Tips */}
                      {opt.tips && opt.tips.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {opt.tips.map((tip, j) => (
                            <li key={j} className="text-xs text-gray-500 flex gap-1.5">
                              <span className="text-gray-300 flex-shrink-0">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* General notes */}
      {transport.notes && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 leading-relaxed">{transport.notes}</p>
        </div>
      )}
    </div>
  );
}
