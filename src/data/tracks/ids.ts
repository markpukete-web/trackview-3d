// Single source of truth for track identifiers. Keep this file dependency-free
// so `types/track.ts` can import it without creating a cycle through the
// registry (which imports the track configs, which import `types/track.ts`).
//
// To add a new track:
//   1. Append its id to TRACK_IDS below
//   2. Create the config file and import it in `./index.ts`
//   3. The `Record<TrackId, TrackConfig>` satisfies clause in `./index.ts`
//      will error until you add the new key.
export const TRACK_IDS = ['eagle-farm', 'doomben'] as const;

export type TrackId = (typeof TRACK_IDS)[number];

export function isTrackId(value: string): value is TrackId {
  return (TRACK_IDS as readonly string[]).includes(value);
}
