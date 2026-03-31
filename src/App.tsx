import { useState, useMemo, useCallback, useRef } from 'react';
import { Viewer } from 'cesium';
import TrackViewer from './components/Map/TrackViewer';
import ErrorBoundary from './components/UI/ErrorBoundary';
import ContextDrawer, { DrawerTab } from './components/UI/ContextDrawer';
import WeatherBadge from './components/UI/WeatherBadge';
import { getTrack, DEFAULT_TRACK_ID } from './data/tracks';
import { PointOfInterest, POICategory } from './types/track';
import { useWeather } from './hooks/useWeather';
import { useTour } from './hooks/useTour';

const track = getTrack(DEFAULT_TRACK_ID)!;

export default function App() {
  const viewerRef = useRef<Viewer | null>(null);
  const tour = useTour(viewerRef, track);

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

  const { data: weather, isLoading: weatherLoading, error: weatherError } = useWeather(track);

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

  const handleWeatherBadgeClick = useCallback(() => {
    setActiveTab('getting-here');
  }, []);

  const firstTour = track.tours?.[0] ?? null;

  const handleStartTour = useCallback(() => {
    if (firstTour) {
      setSelectedPOI(null);
      tour.startTour(firstTour);
    }
  }, [firstTour, tour]);

  return (
    <div className="relative w-screen h-screen">
      <ErrorBoundary>
        <TrackViewer
          track={track}
          activeCategories={activeCategories}
          selectedPOI={selectedPOI}
          onLoadingChange={setLoading}
          onError={setError}
          onPOIClick={handlePOIClick}
          viewerRef={viewerRef}
          tourActive={tour.isActive}
        />
      </ErrorBoundary>

      {/* Map Loading overlay */}
      {loading && (
        <div className="absolute bottom-10 md:bottom-24 left-1/2 -translate-x-1/2 md:-translate-x-[180px] z-10 pointer-events-none transition-opacity duration-500">
          <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg px-5 py-3 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-700 whitespace-nowrap">
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

      {/* Weather badge — top right of viewer */}
      <WeatherBadge
        weather={weather}
        isLoading={weatherLoading}
        onClick={handleWeatherBadgeClick}
      />

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
        weather={weather}
        weatherLoading={weatherLoading}
        weatherError={weatherError}
        onStartTour={handleStartTour}
        tour={{
          isActive: tour.isActive,
          currentStop: tour.currentStop,
          currentIndex: tour.currentIndex,
          totalStops: tour.totalStops,
          isAutoPlay: tour.isAutoPlay,
          onNext: tour.nextStop,
          onPrev: tour.prevStop,
          onToggleAutoPlay: tour.toggleAutoPlay,
          onEndTour: tour.endTour,
        }}
      />
    </div>
  );
}
