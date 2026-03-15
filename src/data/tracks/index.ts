import { TrackConfig } from '../../types/track';
import { eagleFarm } from './eagle-farm';

export const tracks: Record<string, TrackConfig> = {
  'eagle-farm': eagleFarm,
};

export const DEFAULT_TRACK_ID = 'eagle-farm';

export function getTrack(id: string): TrackConfig | undefined {
  return tracks[id];
}
