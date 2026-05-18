import { useState, useMemo, useCallback, useRef, useEffect, type CSSProperties } from 'react';
import { Viewer } from 'cesium';
import TrackViewer from './components/Map/TrackViewer';
import ErrorBoundary from './components/UI/ErrorBoundary';
import ContextDrawer, { DrawerTab } from './components/UI/ContextDrawer';
import WeatherBadge from './components/UI/WeatherBadge';
import MapDiscoveryControls from './components/UI/MapDiscoveryControls';
import { getTrack, DEFAULT_TRACK_ID } from './data/tracks';
import { PointOfInterest, POICategory } from './types/track';
import { ActiveFilter, DrawerState, POIIntentId } from './types/discovery';
import { POI_INTENT_CONFIG } from './constants/discovery';
import {
  MOBILE_SHEET_EXPANDED_HEIGHT,
  MOBILE_SHEET_RESTING_HEIGHT,
  MOBILE_SHEET_RESULTS_HEIGHT,
} from './constants/layout';
import { CATEGORY_CONFIG } from './components/UI/CategoryFilter';
import { useWeather } from './hooks/useWeather';
import { useTour } from './hooks/useTour';

// Resolve track from URL parameter if available, fallback to default.
// If `?track=` is set but unknown, strip it so the URL reflects what's actually loaded.
const urlParams = new URLSearchParams(window.location.search);
const requestedTrack = urlParams.get('track');
const resolved = requestedTrack ? getTrack(requestedTrack) : null;
if (requestedTrack && !resolved) {
  urlParams.delete('track');
  const search = urlParams.toString();
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`,
  );
}
const track = resolved ?? getTrack(DEFAULT_TRACK_ID)!;

const TOUR_INTRO_DISMISSED_PREFIX = 'trackview-tour-dismissed-';

// Storage key changes whenever the tour script is bumped, so previously-dismissed
// users see the welcome card again automatically when content materially changes.
function tourIntroDismissalKey(trackId: string, tourId: string, version: number) {
  return `${TOUR_INTRO_DISMISSED_PREFIX}${trackId}-${tourId}-v${version}`;
}

export default function App() {
  if (import.meta.env.DEV) {
    console.log(`[App] Track loaded: ${track.name} with ${track.routes?.length || 0} routes`);
  }

  const viewerRef = useRef<Viewer | null>(null);
  const tour = useTour(viewerRef, track);

  useEffect(() => {
    document.title = `${track.name} | TrackView 3D`;
  }, []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<PointOfInterest | null>(null);
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DrawerTab>('explore');
  const [drawerState, setDrawerState] = useState<DrawerState>('resting');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>({ kind: 'none' });
  const [searchValue, setSearchValue] = useState('');
  const [showTourIntro, setShowTourIntro] = useState(false);

  const availableCategories = useMemo(() => {
    const cats = new Set<POICategory>();
    for (const poi of track.pois) {
      cats.add(poi.category);
    }
    return [...cats];
  }, []);

  const visibleCategories = useMemo(() => {
    if (activeFilter.kind === 'intent') {
      return new Set(POI_INTENT_CONFIG[activeFilter.id].categories);
    }

    return new Set(availableCategories);
  }, [activeFilter, availableCategories]);

  const filteredPOIs = useMemo(() => {
    if (activeFilter.kind === 'intent') {
      const categories = POI_INTENT_CONFIG[activeFilter.id].categories;
      return track.pois.filter((poi) => categories.includes(poi.category));
    }

    if (activeFilter.kind === 'search') {
      const searchLower = activeFilter.query.toLowerCase();
      return track.pois.filter((poi) => {
        const categoryLabel = CATEGORY_CONFIG[poi.category].label.toLowerCase();
        return (
          poi.name.toLowerCase().includes(searchLower) ||
          poi.description.toLowerCase().includes(searchLower) ||
          categoryLabel.includes(searchLower)
        );
      });
    }

    return track.pois;
  }, [activeFilter]);

  const visiblePoiIds = useMemo(
    () => new Set(filteredPOIs.map((poi) => poi.id)),
    [filteredPOIs],
  );

  const resultSummary = useMemo(() => {
    const countLabel = `${filteredPOIs.length} ${filteredPOIs.length === 1 ? 'place' : 'places'}`;

    if (activeFilter.kind === 'intent') {
      return `${countLabel} for ${POI_INTENT_CONFIG[activeFilter.id].label.toLowerCase()}`;
    }

    if (activeFilter.kind === 'search') {
      return `${countLabel} matching "${activeFilter.query}"`;
    }

    return countLabel;
  }, [activeFilter, filteredPOIs.length]);

  const { data: weather, isLoading: weatherLoading, error: weatherError } = useWeather(track);
  const firstTour = track.tours?.[0] ?? null;
  const hasFullDrawer = drawerState === 'results' || drawerState === 'expanded' || tour.isActive;
  const mobileControlBottomOffset =
    tour.isActive
      ? MOBILE_SHEET_RESTING_HEIGHT
      : drawerState === 'expanded'
        ? MOBILE_SHEET_EXPANDED_HEIGHT
        : drawerState === 'results'
          ? MOBILE_SHEET_RESULTS_HEIGHT
          : MOBILE_SHEET_RESTING_HEIGHT;

  const openDrawerToResults = useCallback(() => {
    setDrawerState((prev) => (prev === 'expanded' ? 'expanded' : 'results'));
  }, []);

  const handleIntentSelect = useCallback((intentId: POIIntentId) => {
    setSearchValue('');
    setActiveFilter({ kind: 'intent', id: intentId });
    setSelectedPOI(null);
    setActiveRouteId(null);
    setShowTourIntro(false);
    setActiveTab('explore');
    openDrawerToResults();
  }, [openDrawerToResults]);

  const handleSearchChange = useCallback((value: string) => {
    const trimmed = value.trim();

    setSearchValue(value);
    setActiveFilter(trimmed ? { kind: 'search', query: trimmed } : { kind: 'none' });
    setSelectedPOI(null);
    setActiveRouteId(null);
    setShowTourIntro(false);
    setActiveTab('explore');

    if (trimmed) {
      openDrawerToResults();
    }
  }, [openDrawerToResults]);

  const handleClearFilter = useCallback(() => {
    setSearchValue('');
    setActiveFilter({ kind: 'none' });
    setSelectedPOI(null);
    setShowTourIntro(false);
    setDrawerState(isMobileDiscoveryViewport() ? 'resting' : 'results');
  }, []);

  // Map-level Clear acts as "back to default state" — returns to the Explore tab and
  // resets filters/search/arrival, so it works even when the user is on the Getting Here panel.
  const handleClearFilterFromMap = useCallback(() => {
    setActiveTab('explore');
    handleClearFilter();
  }, [handleClearFilter]);

  const handleDrawerClose = useCallback(() => {
    setDrawerState('resting');
    setShowTourIntro(false);
  }, []);

  const handleArrivalClick = useCallback(() => {
    setSearchValue('');
    setActiveFilter({ kind: 'none' });
    setSelectedPOI(null);
    setShowTourIntro(false);
    setActiveTab('getting-here');
    openDrawerToResults();
  }, [openDrawerToResults]);

  const handlePOIClick = useCallback((poi: PointOfInterest) => {
    setSelectedPOI(poi);
    setActiveTab('explore');
    setActiveRouteId(null);
    setShowTourIntro(false);
    setDrawerState((prev) => (prev === 'expanded' ? 'expanded' : 'results'));
  }, []);

  const handlePOIClose = useCallback(() => {
    setSelectedPOI(null);
  }, []);

  const handleViewSelectedPOIOnMap = useCallback(() => {
    setDrawerState('resting');
  }, []);

  const handleWeatherBadgeClick = useCallback(() => {
    setSelectedPOI(null);
    setShowTourIntro(false);
    setActiveTab('getting-here');
    openDrawerToResults();
  }, [openDrawerToResults]);

  const handleTourClick = useCallback(() => {
    setSearchValue('');
    setActiveFilter({ kind: 'none' });
    setSelectedPOI(null);
    setActiveRouteId(null);
    setActiveTab('explore');

    if (firstTour && hasDismissedTourIntro(track.id, firstTour.id, firstTour.version)) {
      setShowTourIntro(false);
      setDrawerState('resting');
      tour.startTour(firstTour);
      return;
    }

    setShowTourIntro(true);
    openDrawerToResults();
  }, [firstTour, openDrawerToResults, tour]);

  const handleStartTour = useCallback(() => {
    if (firstTour) {
      setSelectedPOI(null);
      setShowTourIntro(false);
      setDrawerState('resting');
      tour.startTour(firstTour);
    }
  }, [firstTour, tour]);

  const handleDismissTourIntro = useCallback(() => {
    setShowTourIntro(false);
    setDrawerState('resting');
    if (firstTour) {
      persistDismissedTourIntro(track.id, firstTour.id, firstTour.version);
    }
  }, [firstTour]);

  const handleResetTourIntro = useCallback(() => {
    if (firstTour) {
      clearDismissedTourIntro(track.id, firstTour.id, firstTour.version);
    }
    setSelectedPOI(null);
    setActiveTab('explore');
    setShowTourIntro(true);
    openDrawerToResults();
  }, [firstTour, openDrawerToResults]);

  const handlePlanArrival = useCallback(() => {
    setActiveTab('getting-here');
    setShowTourIntro(false);
    setDrawerState('results');
    tour.endTour();
  }, [tour]);

  return (
    <div
      className="relative w-screen h-screen"
      style={{ '--track-brand': track.brandColour || '#1c1917' } as CSSProperties}
    >
      <ErrorBoundary>
        <TrackViewer
          track={track}
          activeCategories={visibleCategories}
          visiblePoiIds={visiblePoiIds}
          selectedPOI={selectedPOI}
          onLoadingChange={setLoading}
          onError={setError}
          onPOIClick={handlePOIClick}
          viewerRef={viewerRef}
          tourActive={tour.isActive}
          tourFocusPoiId={tour.currentStop?.poiId ?? null}
          tourHidePoiMarkers={tour.currentStop?.hidePoiMarkers ?? false}
          tourCalloutOffset={tour.currentStop?.calloutOffset ?? null}
          activeRouteId={activeRouteId}
          desktopDrawerOpen={hasFullDrawer}
          mobileControlBottomOffset={mobileControlBottomOffset}
        />
      </ErrorBoundary>

      {loading && (
        <div className={`absolute bottom-10 md:bottom-24 left-1/2 z-10 pointer-events-none transition-opacity duration-500 motion-reduce:transition-none ${
          hasFullDrawer ? '-translate-x-1/2 md:-translate-x-[180px]' : '-translate-x-1/2'
        }`}>
          <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg px-5 py-3 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-stone-200 border-t-blue-600 rounded-full animate-spin motion-reduce:animate-none" />
            <p className="text-sm font-medium text-stone-700 whitespace-nowrap">
              Loading {track.name}...
            </p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-950 z-10">
          <div className="text-center max-w-sm px-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {!tour.isActive && (
        <MapDiscoveryControls
          trackId={track.id}
          trackName={track.shortName ?? track.name}
          activeFilter={activeFilter}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          onSearchClear={handleClearFilter}
          onIntentSelect={handleIntentSelect}
          onClearFilter={handleClearFilterFromMap}
          onArrivalClick={handleArrivalClick}
          onTourClick={handleTourClick}
          tourAvailable={!!firstTour}
          arrivalActive={activeTab === 'getting-here' && hasFullDrawer}
          desktopDrawerOpen={hasFullDrawer}
          mobileControlsHidden={drawerState === 'expanded'}
        />
      )}

      <WeatherBadge
        weather={weather}
        isLoading={weatherLoading}
        onClick={handleWeatherBadgeClick}
        avoidDesktopDrawer={hasFullDrawer}
      />

      <ContextDrawer
        track={track}
        drawerState={drawerState}
        onDrawerStateChange={setDrawerState}
        onDrawerClose={handleDrawerClose}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pois={filteredPOIs}
        resultSummary={resultSummary}
        hasActiveFilter={activeFilter.kind !== 'none' || searchValue.trim().length > 0}
        onClearFilter={handleClearFilter}
        selectedPOI={selectedPOI}
        onPOIClick={handlePOIClick}
        onPOIClose={handlePOIClose}
        onPOIViewOnMap={handleViewSelectedPOIOnMap}
        weather={weather}
        weatherLoading={weatherLoading}
        weatherError={weatherError}
        showTourIntro={showTourIntro}
        tourAvailable={!!firstTour}
        tourMinutes={firstTour?.estimatedMinutes}
        onStartTour={handleStartTour}
        onDismissTourIntro={handleDismissTourIntro}
        onResetTourIntro={handleResetTourIntro}
        tour={{
          isActive: tour.isActive,
          currentStop: tour.currentStop,
          currentIndex: tour.currentIndex,
          totalStops: tour.totalStops,
          tourId: firstTour?.id ?? '',
          isAutoPlay: tour.isAutoPlay,
          autoPlayWasActive: tour.autoPlayWasActive,
          isOrbiting: tour.isOrbiting,
          dwellRemaining: tour.dwellRemaining,
          onNext: tour.nextStop,
          onPrev: tour.prevStop,
          onToggleAutoPlay: tour.toggleAutoPlay,
          onEndTour: tour.endTour,
          onPlanArrival: handlePlanArrival,
        }}
        activeRouteId={activeRouteId}
        onRouteSelect={setActiveRouteId}
      />
    </div>
  );
}

function isMobileDiscoveryViewport() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 767px), (orientation: portrait)').matches;
}

function hasDismissedTourIntro(trackId: string, tourId: string, version: number) {
  try {
    return localStorage.getItem(tourIntroDismissalKey(trackId, tourId, version)) === '1';
  } catch {
    return false;
  }
}

function persistDismissedTourIntro(trackId: string, tourId: string, version: number) {
  try {
    localStorage.setItem(tourIntroDismissalKey(trackId, tourId, version), '1');
  } catch {
    // Private browsing or blocked storage should not break the tour flow.
  }
}

function clearDismissedTourIntro(trackId: string, tourId: string, version: number) {
  try {
    localStorage.removeItem(tourIntroDismissalKey(trackId, tourId, version));
  } catch {
    // Best-effort — failure to clear just means the welcome card wouldn't auto-show next session.
  }
}
