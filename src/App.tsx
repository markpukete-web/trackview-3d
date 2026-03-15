import TrackViewer from './components/Map/TrackViewer';
import { getTrack, DEFAULT_TRACK_ID } from './data/tracks';

const track = getTrack(DEFAULT_TRACK_ID)!;

export default function App() {
  return (
    <div className="relative w-screen h-screen">
      <TrackViewer track={track} />

      <div className="absolute top-0 left-0 p-4 pointer-events-none">
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
