import { useState, useMemo, useCallback } from 'react';
import TrackViewer from './components/Map/TrackViewer';
import CategoryFilter from './components/UI/CategoryFilter';
import POIPanel from './components/UI/POIPanel';
import { getTrack, DEFAULT_TRACK_ID } from './data/tracks';
import { PointOfInterest, POICategory } from './types/track';

const track = getTrack(DEFAULT_TRACK_ID)!;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<PointOfInterest | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<POICategory>>(() => {
    const categories = new Set<POICategory>();
    for (const poi of track.pois) {
      categories.add(poi.category);
    }
    return categories;
  });

  // Unique categories present in this track's POIs
  const availableCategories = useMemo(() => {
    const cats = new Set<POICategory>();
    for (const poi of track.pois) {
      cats.add(poi.category);
    }
    return [...cats];
  }, []);

  const handleCategoryToggle = useCallback((category: POICategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const handlePOIClick = useCallback((poi: PointOfInterest) => {
    setSelectedPOI(poi);
  }, []);

  const handlePOIClose = useCallback(() => {
    setSelectedPOI(null);
  }, []);

  return (
    <div className="relative w-screen h-screen">
      <TrackViewer
        track={track}
        activeCategories={activeCategories}
        onLoadingChange={setLoading}
        onError={setError}
        onPOIClick={handlePOIClick}
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

      {/* Track info overlay + category filters */}
      <div className="absolute top-0 left-0 p-4 pointer-events-none z-20 max-w-[calc(100%-2rem)]">
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
        <div className="pointer-events-auto mt-2">
          <CategoryFilter
            categories={availableCategories}
            activeCategories={activeCategories}
            onToggle={handleCategoryToggle}
          />
        </div>
      </div>

      {/* POI info panel */}
      <POIPanel poi={selectedPOI} onClose={handlePOIClose} />
    </div>
  );
}
