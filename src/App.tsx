import { useCallback, useEffect, useState } from 'react';
import TrackExperience from './TrackExperience';
import TrackLandingScreen from './components/UI/TrackLandingScreen';
import { getTrack, isTrackId, type TrackId } from './data/tracks';

// Session-scoped: rapid reloads skip the landing, but a new browsing session
// brings users back to the picker so the multi-track framing stays primary.
const SESSION_TRACK_KEY = 'trackview-session-track';

function resolveInitialTrackId(): TrackId | null {
  const urlParams = new URLSearchParams(window.location.search);
  const requestedTrack = urlParams.get('track');

  if (requestedTrack) {
    if (isTrackId(requestedTrack)) return requestedTrack;
    // Strip invalid ?track= so the URL reflects what's actually loaded.
    urlParams.delete('track');
    const search = urlParams.toString();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`,
    );
  }

  try {
    const saved = sessionStorage.getItem(SESSION_TRACK_KEY);
    if (saved && isTrackId(saved)) return saved;
  } catch {
    // Session storage unavailable (private mode, blocked) — fall through to landing.
  }

  return null;
}

export default function App() {
  const [trackId, setTrackId] = useState<TrackId | null>(resolveInitialTrackId);

  useEffect(() => {
    if (!trackId) {
      document.title = 'TrackView 3D — Explore Australian racecourses';
      return;
    }
    try {
      sessionStorage.setItem(SESSION_TRACK_KEY, trackId);
    } catch {
      // Session storage unavailable — track remains in-memory for this session.
    }
  }, [trackId]);

  const handleSelectTrack = useCallback((id: TrackId) => {
    const params = new URLSearchParams(window.location.search);
    params.set('track', id);
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${params.toString()}${window.location.hash}`,
    );
    setTrackId(id);
  }, []);

  const handleBackToLanding = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_TRACK_KEY);
    } catch {
      // Session storage unavailable — best-effort clear.
    }
    const params = new URLSearchParams(window.location.search);
    params.delete('track');
    const search = params.toString();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`,
    );
    setTrackId(null);
  }, []);

  if (!trackId) {
    return <TrackLandingScreen onSelect={handleSelectTrack} />;
  }

  const track = getTrack(trackId)!;
  return <TrackExperience key={trackId} track={track} onBackToLanding={handleBackToLanding} />;
}
