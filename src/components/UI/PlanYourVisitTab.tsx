import { memo } from 'react';
import { Map } from 'lucide-react';
import { PointOfInterest, TrackRaceDayInfo } from '../../types/track';

interface PlanYourVisitTabProps {
  raceDay: TrackRaceDayInfo;
  /** All POIs for the track — used to resolve a gate's poiId for "Show on map". */
  pois: PointOfInterest[];
  onPOIClick: (poi: PointOfInterest) => void;
}

function PlanYourVisitTab({ raceDay, pois, onPOIClick }: PlanYourVisitTabProps) {
  const { intro, dressCode, arrival, entry } = raceDay;

  return (
    <div className="flex flex-col gap-6 pb-6">
      {intro && <p className="text-sm text-stone-600 leading-relaxed">{intro}</p>}

      {/* Dress code */}
      {dressCode && (
        <section>
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
            Dress Code
          </h3>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-stone-600 leading-relaxed">{dressCode.summary}</p>
            <div className="flex flex-col gap-3">
              {dressCode.areas.map((area, i) => (
                <div key={i} className="rounded-lg border border-stone-200 bg-white p-3">
                  <p className="text-sm font-semibold text-stone-800">{area.area}</p>
                  <p className="text-sm text-stone-500 leading-relaxed mt-0.5">{area.standard}</p>
                  {area.notes && (
                    <p className="text-xs text-stone-400 leading-relaxed mt-1.5">{area.notes}</p>
                  )}
                </div>
              ))}
            </div>
            {dressCode.tips && dressCode.tips.length > 0 && (
              <ul className="space-y-1.5">
                {dressCode.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-stone-500 leading-relaxed">
                    <span className="text-stone-300 flex-shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Gates & arrival */}
      {arrival && (
        <section className="pt-1 border-t border-stone-100">
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3 pt-4">
            Gates & Arrival
          </h3>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-stone-600 leading-relaxed">{arrival.summary}</p>
            <div className="flex flex-col gap-3">
              {arrival.gates.map((gate, i) => {
                const poi = gate.poiId ? pois.find((p) => p.id === gate.poiId) : undefined;
                return (
                  <div
                    key={i}
                    className="flex justify-between items-start gap-4 rounded-lg border border-stone-200 bg-white p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-800">{gate.name}</p>
                      <p className="text-sm text-stone-500 leading-relaxed mt-0.5">{gate.detail}</p>
                    </div>
                    {poi && (
                      <button
                        type="button"
                        onClick={() => onPOIClick(poi)}
                        className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--track-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
                      >
                        <Map className="w-3.5 h-3.5" />
                        Show on map
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {arrival.tips && arrival.tips.length > 0 && (
              <ul className="space-y-1.5">
                {arrival.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-stone-500 leading-relaxed">
                    <span className="text-stone-300 flex-shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Entry essentials */}
      {entry && (
        <section className="pt-1 border-t border-stone-100">
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3 pt-4">
            Entry Essentials
          </h3>
          <div className="flex flex-col gap-4">
            {entry.ticketTypes && entry.ticketTypes.length > 0 && (
              <div className="flex flex-col gap-3">
                {entry.ticketTypes.map((t, i) => (
                  <div key={i}>
                    <p className="text-sm font-semibold text-stone-800">{t.name}</p>
                    <p className="text-sm text-stone-500 leading-relaxed mt-0.5">{t.detail}</p>
                  </div>
                ))}
              </div>
            )}
            {entry.items.length > 0 && (
              <ul className="space-y-1.5">
                {entry.items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-stone-500 leading-relaxed">
                    <span className="text-stone-300 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            {entry.payment && (
              <p className="text-sm text-stone-500 leading-relaxed">{entry.payment}</p>
            )}
            {entry.notes && (
              <p className="text-xs text-stone-400 leading-relaxed p-3 bg-stone-50 rounded-lg">
                {entry.notes}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default memo(PlanYourVisitTab);
