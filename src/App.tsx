import { useState, useMemo, useCallback } from 'react';
import TrackViewer from './components/Map/TrackViewer';
import ContextDrawer, { DrawerTab } from './components/UI/ContextDrawer';
import { getTrack, DEFAULT_TRACK_ID } from './data/tracks';
import { PointOfInterest, POICategory } from './types/track';

const track = getTrack(DEFAULT_TRACK_ID)!;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<PointOfInterest | null>(null);
  const [activeTab, setActiveTab] = useState<DrawerTab>('explore');
  const [activeCategories, setActiveCategories] = useState<Set<POICategory>>(() => {
    const categories = new Set<POICategory>();
    for (const poi of track.pois) {
      categories.add(poi.category);
    }
    return categories;
  });

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
    setActiveTab('explore');
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

      {/* Minimal branding — top left */}
      <div className="absolute top-3 left-3 pointer-events-none z-20">
        <p className="text-[10px] text-white/70 drop-shadow-md">
          Powered by Google 3D Tiles
        </p>
      </div>

      {/* Context drawer */}
      <ContextDrawer
        track={track}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeCategories={activeCategories}
        availableCategories={availableCategories}
        selectedPOI={selectedPOI}
        onCategoryToggle={handleCategoryToggle}
        onPOIClick={handlePOIClick}
        onPOIClose={handlePOIClose}
      />
    </div>
  );
}
