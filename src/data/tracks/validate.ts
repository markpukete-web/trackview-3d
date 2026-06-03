import type { TrackConfig } from '../../types/track';

class TrackConfigError extends Error {
  constructor(message: string) {
    super(`[track config] ${message}`);
    this.name = 'TrackConfigError';
  }
}

function validateTrack(track: TrackConfig, registryKey: string, knownTrackIds: ReadonlySet<string>): void {
  if (track.id !== registryKey) {
    throw new TrackConfigError(
      `registry key "${registryKey}" does not match track.id "${track.id}"`,
    );
  }

  const poiIds = new Set<string>();
  for (const poi of track.pois) {
    if (poiIds.has(poi.id)) {
      throw new TrackConfigError(`${track.id}: duplicate POI id "${poi.id}"`);
    }
    poiIds.add(poi.id);
  }

  for (const tour of track.tours ?? []) {
    for (const stop of tour.stops) {
      if (stop.poiId && !poiIds.has(stop.poiId)) {
        throw new TrackConfigError(
          `${track.id}: tour "${tour.id}" stop "${stop.id}" references unknown poiId "${stop.poiId}"`,
        );
      }
    }
  }

  for (const option of track.transport?.options ?? []) {
    if (option.poiId && !poiIds.has(option.poiId)) {
      throw new TrackConfigError(
        `${track.id}: transport option "${option.name}" references unknown poiId "${option.poiId}"`,
      );
    }
  }

  for (const route of track.routes ?? []) {
    if (route.fromPOI && !poiIds.has(route.fromPOI)) {
      throw new TrackConfigError(
        `${track.id}: route "${route.id}" references unknown fromPOI "${route.fromPOI}"`,
      );
    }
    if (route.toPOI && !poiIds.has(route.toPOI)) {
      throw new TrackConfigError(
        `${track.id}: route "${route.id}" references unknown toPOI "${route.toPOI}"`,
      );
    }
  }

  for (const gate of track.raceDay?.arrival?.gates ?? []) {
    if (gate.poiId && !poiIds.has(gate.poiId)) {
      throw new TrackConfigError(
        `${track.id}: race-day gate "${gate.name}" references unknown poiId "${gate.poiId}"`,
      );
    }
  }

  for (const nearby of track.nearbyTracks ?? []) {
    if (!knownTrackIds.has(nearby)) {
      throw new TrackConfigError(
        `${track.id}: nearbyTracks references unknown track "${nearby}"`,
      );
    }
  }
}

export function validateTracks(tracks: Record<string, TrackConfig>): void {
  const knownTrackIds = new Set(Object.keys(tracks));
  for (const [key, track] of Object.entries(tracks)) {
    validateTrack(track, key, knownTrackIds);
  }
}
