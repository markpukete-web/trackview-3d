import { type CSSProperties } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { tracks, type TrackId } from '../../data/tracks';
import type { TrackConfig } from '../../types/track';

interface TrackLandingScreenProps {
  onSelect: (trackId: TrackId) => void;
}

const trackList = Object.values(tracks);

export default function TrackLandingScreen({ onSelect }: TrackLandingScreenProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-stone-50 via-white to-stone-100 flex flex-col">
      <header className="px-6 pt-12 md:pt-20 text-center">
        <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-stone-500">
          TrackView 3D
        </p>
        <h1 className="mt-3 text-3xl md:text-5xl font-bold text-stone-900 tracking-tight">
          Explore Australian racecourses
        </h1>
        <p className="mt-3 text-base md:text-lg text-stone-600 max-w-xl mx-auto leading-relaxed">
          Walk a venue in interactive 3D before you arrive — find grandstands,
          food, transport and the best viewing spots.
        </p>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10 md:py-14">
        <h2 className="sr-only">Choose a racecourse</h2>
        <ul className="grid gap-4 md:gap-6 md:grid-cols-2">
          {trackList.map((track, index) => (
            <li key={track.id}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
              >
                <TrackCard track={track} onSelect={() => onSelect(track.id)} />
              </motion.div>
            </li>
          ))}
        </ul>
      </main>

      <footer className="px-6 pb-8 text-center text-xs text-stone-500">
        Educational wayfinding · Not a gambling product · Imagery © Google
      </footer>
    </div>
  );
}

interface TrackCardProps {
  track: TrackConfig;
  onSelect: () => void;
}

function TrackCard({ track, onSelect }: TrackCardProps) {
  const brand = track.brandColour || '#1c1917';
  const heroImage = track.placeholderImage;

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{ '--track-brand': brand } as CSSProperties}
      className="group relative w-full overflow-hidden rounded-2xl border border-stone-200 bg-white text-left shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--track-brand)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100"
      aria-label={`Explore ${track.name} in 3D`}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
        {heroImage ? (
          <img
            src={heroImage}
            alt=""
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 motion-reduce:transition-none motion-reduce:transform-none"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backgroundImage: `linear-gradient(135deg, ${brand} 0%, ${shadeColour(brand, -10)} 55%, ${shadeColour(brand, 25)} 100%)`,
            }}
          >
            <MapPin
              className="h-20 w-20 text-white/15 group-hover:text-white/25 transition-colors duration-300 motion-reduce:transition-none"
              strokeWidth={1.25}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />
      </div>

      <div className="p-5 md:p-6">
        <h3 className="text-xl md:text-2xl font-bold text-stone-900 tracking-tight">
          {track.name}
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-stone-600">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{track.location}</span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span className="truncate">{track.operator}</span>
        </p>

        {track.tagline && (
          <p className="mt-3 text-sm text-stone-600 leading-relaxed">{track.tagline}</p>
        )}

        <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--track-brand)] group-hover:gap-2.5 transition-[gap] duration-200 motion-reduce:transition-none">
          Explore in 3D
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
    </button>
  );
}

// Lighten/darken a hex colour by `percent` (-100 to 100). Used to build a
// pleasing gradient from a single brand colour when no hero photo is set.
function shadeColour(hex: string, percent: number): string {
  const sanitised = hex.replace('#', '');
  if (sanitised.length !== 6) return hex;
  const num = parseInt(sanitised, 16);
  const amt = Math.round(2.55 * percent);
  const r = clamp((num >> 16) + amt);
  const g = clamp(((num >> 8) & 0x00ff) + amt);
  const b = clamp((num & 0x0000ff) + amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}
