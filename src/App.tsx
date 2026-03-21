import { useState } from 'react';
import TrackViewer from './components/Map/TrackViewer';
import { getTrack, DEFAULT_TRACK_ID } from './data/tracks';

const track = getTrack(DEFAULT_TRACK_ID)!;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="relative w-screen h-screen">
      <TrackViewer
        track={track}
        onLoadingChange={setLoading}
        onError={setError}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10 pointer-events-none">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-gray-600 border-t-white rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-sm text-gray-400">
              Loading {track.name}...
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10">
          <div className="text-center max-w-sm px-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Track info overlay */}
      <div className="absolute top-0 left-0 p-4 pointer-events-none z-20">
        <div className="pointer-events-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            TrackView 3D
          </p>
          <h1 className="text-lg font-bold text-gray-900">{track.name}</h1>
          <p className="text-sm text-gray-600">{track.location}</p>
          <p className="mt-2 text-[10px] text-gray-400">
            Powered by Google 3D Tiles
          </p>
        </div>
      </div>
    </div>
  );
}
