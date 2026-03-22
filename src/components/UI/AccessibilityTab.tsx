import { TrackAccessibility } from '../../types/track';

interface AccessibilityTabProps {
  accessibility?: TrackAccessibility;
}

const FEATURE_CONFIG: { key: keyof TrackAccessibility['features']; label: string; icon: string }[] = [
  { key: 'wheelchairAccess', label: 'Wheelchair Access', icon: '♿' },
  { key: 'companionCard', label: 'Companion Card', icon: '👥' },
  { key: 'hearingLoop', label: 'Hearing Loop', icon: '🔊' },
  { key: 'assistanceDogs', label: 'Assistance Dogs', icon: '🐕' },
];

export default function AccessibilityTab({ accessibility }: AccessibilityTabProps) {
  if (!accessibility) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        Accessibility information coming soon.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <p className="text-sm text-gray-600 leading-relaxed">{accessibility.summary}</p>

      {/* Feature badges */}
      <div className="grid grid-cols-2 gap-2">
        {FEATURE_CONFIG.map((feat) => {
          const available = accessibility.features[feat.key];
          return (
            <div
              key={feat.key}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                available
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'bg-gray-50 text-gray-400'
              }`}
            >
              <span className="text-base flex-shrink-0">{feat.icon}</span>
              <span className="font-medium text-xs leading-tight">{feat.label}</span>
            </div>
          );
        })}
      </div>

      {/* Mobility details */}
      {accessibility.mobilityDetails.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Mobility
          </h3>
          <ul className="space-y-2">
            {accessibility.mobilityDetails.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600">
                <span className="text-gray-300 flex-shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Assistance details */}
      {accessibility.assistanceDetails && accessibility.assistanceDetails.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Assistance & Services
          </h3>
          <ul className="space-y-2">
            {accessibility.assistanceDetails.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600">
                <span className="text-gray-300 flex-shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes */}
      {accessibility.notes && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 leading-relaxed">{accessibility.notes}</p>
        </div>
      )}
    </div>
  );
}
