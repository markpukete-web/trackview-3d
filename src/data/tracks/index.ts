import { TrackConfig } from '../../types/track';
import { eagleFarm } from './eagle-farm';
import { doomben } from './doomben';
import { isTrackId, TRACK_IDS, type TrackId } from './ids';
import { validateTracks } from './validate';

// `satisfies Record<TrackId, TrackConfig>` enforces three invariants at compile time:
//   1. Every TrackId declared in `./ids.ts` has a config here (no missing tracks).
//   2. The literal keys are preserved so `keyof typeof tracks === TrackId`.
//   3. Each value is a valid TrackConfig.
export const tracks = {
  'eagle-farm': eagleFarm,
  doomben,
} satisfies Record<TrackId, TrackConfig>;

export { TRACK_IDS, isTrackId };
export type { TrackId };

export const DEFAULT_TRACK_ID: TrackId = 'doomben';

export function getTrack(id: string): TrackConfig | undefined {
  return isTrackId(id) ? tracks[id] : undefined;
}

// Throws at module load if any track config is invalid (unknown poiId references,
// duplicate POI ids, mismatched registry keys, etc). Build/dev fail loudly.
validateTracks(tracks);
