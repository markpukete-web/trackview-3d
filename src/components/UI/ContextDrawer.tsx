import { PointOfInterest, POICategory, TrackConfig } from '../../types/track';
import type { TrackWeatherData } from '../../types/weather';
import { TourStop } from '../../types/tour';
import ExploreTab from './ExploreTab';
import GettingHereTab from './GettingHereTab';
import TourCard from './TourCard';
import TourBar from './TourBar';
import { motion, PanInfo } from 'framer-motion';
import { useState } from 'react';
import { MOBILE_SHEET_COLLAPSED_HEIGHT } from '../../constants/layout';

export type DrawerTab = 'explore' | 'getting-here';

interface TourProps {
  isActive: boolean;
  currentStop: TourStop | null;
  currentIndex: number;
  totalStops: number;
  tourId: string;
  isAutoPlay: boolean;
  autoPlayWasActive: boolean;
  isOrbiting: boolean;
  dwellRemaining: number;
  onNext: () => void;
  onPrev: () => void;
  onToggleAutoPlay: () => void;
  onEndTour: () => void;
  onPlanArrival: () => void;
}

interface ContextDrawerProps {
  track: TrackConfig;
  activeTab: DrawerTab;
  onTabChange: (tab: DrawerTab) => void;
  activeCategories: Set<POICategory>;
  availableCategories: POICategory[];
  selectedPOI: PointOfInterest | null;
  onCategoryToggle: (category: POICategory) => void;
  onPOIClick: (poi: PointOfInterest) => void;
  onPOIClose: () => void;
  weather: TrackWeatherData | null;
  weatherLoading: boolean;
  weatherError: string | null;
  tour?: TourProps;
  onStartTour?: () => void;
  activeRouteId?: string | null;
  onRouteSelect?: (routeId: string | null) => void;
}

const TABS: { id: DrawerTab; label: string }[] = [
  { id: 'explore', label: 'Explore' },
  { id: 'getting-here', label: 'Getting Here' },
];

const MOBILE_SHEET_CONTENT_ID = 'trackview-mobile-sheet-content';

export default function ContextDrawer({
  track,
  activeTab,
  onTabChange,
  activeCategories,
  availableCategories,
  selectedPOI,
  onCategoryToggle,
  onPOIClick,
  onPOIClose,
  weather,
  weatherLoading,
  weatherError,
  tour,
  onStartTour,
  activeRouteId,
  onRouteSelect,
}: ContextDrawerProps) {
  const isTourActive = tour?.isActive && tour.currentStop;
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // If dragged up significantly or swiped up fast
    if (info.offset.y < -50 || info.velocity.y < -500) {
      setSheetExpanded(true);
    } 
    // If dragged down significantly or swiped down fast
    else if (info.offset.y > 50 || info.velocity.y > 500) {
      setSheetExpanded(false);
    }
  };

  const drawerStyle = { '--track-brand': track.brandColour || '#1c1917' } as React.CSSProperties;

  return (
    <>
      {/* Desktop: right-side drawer */}
      <div className="hidden md:flex absolute top-0 right-0 h-full w-[360px] z-20 pointer-events-none">
        <div 
          className="pointer-events-auto m-4 mt-4 w-full bg-white/70 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100%-2rem)] border border-white/50"
          style={drawerStyle}
        >
          <DrawerHeader
            track={track}
            tourMode={!!isTourActive}
          />
          {!isTourActive && (
            <TabBar activeTab={activeTab} onTabChange={onTabChange} />
          )}
          <div className="flex-1 overflow-y-auto p-4">
            {isTourActive ? (
              <TourCard
                currentStop={tour.currentStop!}
                currentIndex={tour.currentIndex}
                totalStops={tour.totalStops}
                isAutoPlay={tour.isAutoPlay}
                autoPlayWasActive={tour.autoPlayWasActive}
                isOrbiting={tour.isOrbiting}
                dwellRemaining={tour.dwellRemaining}
                pois={track.pois}
                trackId={track.id}
                tourId={tour.tourId}
                onNext={tour.onNext}
                onPrev={tour.onPrev}
                onToggleAutoPlay={tour.onToggleAutoPlay}
                onEndTour={tour.onEndTour}
                onPlanArrival={tour.onPlanArrival}
              />
            ) : (
              <TabContent
                track={track}
                activeTab={activeTab}
                activeCategories={activeCategories}
                availableCategories={availableCategories}
                selectedPOI={selectedPOI}
                onCategoryToggle={onCategoryToggle}
                onPOIClick={onPOIClick}
                onPOIClose={onPOIClose}
                weather={weather}
                weatherLoading={weatherLoading}
                weatherError={weatherError}
                onStartTour={onStartTour}
                activeRouteId={activeRouteId}
                onRouteSelect={onRouteSelect}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile: tour bar OR bottom sheet */}
      {isTourActive ? (
        <TourBar
          currentStop={tour.currentStop!}
          currentIndex={tour.currentIndex}
          totalStops={tour.totalStops}
          isAutoPlay={tour.isAutoPlay}
          autoPlayWasActive={tour.autoPlayWasActive}
          isOrbiting={tour.isOrbiting}
          dwellRemaining={tour.dwellRemaining}
          pois={track.pois}
          trackId={track.id}
          tourId={tour.tourId}
          onNext={tour.onNext}
          onPrev={tour.onPrev}
          onToggleAutoPlay={tour.onToggleAutoPlay}
          onEndTour={tour.onEndTour}
          onPlanArrival={tour.onPlanArrival}
        />
      ) : (
        <motion.div
          className="md:hidden fixed bottom-0 left-0 right-0 z-20 pointer-events-auto bg-white/80 backdrop-blur-2xl rounded-t-[32px] shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col border-t border-white/60"
          style={drawerStyle}
          initial={false}
          animate={{ height: sheetExpanded ? '85vh' : MOBILE_SHEET_COLLAPSED_HEIGHT }}
          transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
        >
          {/* Draggable Header Area */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            className="w-full flex flex-col pt-3 pb-1 cursor-grab active:cursor-grabbing flex-shrink-0"
          >
            <div className="w-full flex justify-center pb-2">
              <div className="w-12 h-1.5 bg-stone-300 rounded-full" />
            </div>
            <DrawerHeader
              track={track}
              compact
              expanded={sheetExpanded}
              controlsId={MOBILE_SHEET_CONTENT_ID}
              onClick={() => setSheetExpanded(!sheetExpanded)}
            />
          </motion.div>
          <TabBar activeTab={activeTab} onTabChange={onTabChange} />
          
          <div id={MOBILE_SHEET_CONTENT_ID} className="flex-1 overflow-y-auto p-4 overscroll-contain pb-safe">
            <TabContent
              track={track}
              activeTab={activeTab}
              activeCategories={activeCategories}
              availableCategories={availableCategories}
              selectedPOI={selectedPOI}
              onCategoryToggle={onCategoryToggle}
              onPOIClick={onPOIClick}
              onPOIClose={onPOIClose}
              weather={weather}
              weatherLoading={weatherLoading}
              weatherError={weatherError}
              onStartTour={onStartTour}
              activeRouteId={activeRouteId}
              onRouteSelect={onRouteSelect}
            />
          </div>
        </motion.div>
      )}
    </>
  );
}

function DrawerHeader({
  track,
  compact,
  tourMode,
  expanded,
  controlsId,
  onClick,
}: {
  track: TrackConfig;
  compact?: boolean;
  tourMode?: boolean;
  expanded?: boolean;
  controlsId?: string;
  onClick?: () => void;
}) {
  if (compact) {
    return (
      <button
        type="button"
        className="w-full px-4 pb-1 text-left cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--track-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-white/80"
        onClick={onClick}
        aria-expanded={expanded}
        aria-controls={controlsId}
        aria-label={expanded ? `Collapse ${track.name} details` : `Expand ${track.name} details`}
      >
        <h1 className="text-base font-bold text-[var(--track-brand)]">
          {tourMode ? 'Guided Tour' : track.name}
        </h1>
        <p className="text-xs text-stone-500">
          {tourMode ? track.name : track.location}
        </p>
      </button>
    );
  }

  return (
    <div className="px-4 pt-4 pb-2 border-t-[4px] border-[var(--track-brand)]" style={!track.brandColour ? { borderTopColor: 'transparent' } : undefined}>
      <p className="text-[10px] text-stone-400 uppercase tracking-widest font-medium">
        {tourMode ? 'Guided Tour' : 'TrackView 3D'}
      </p>
      <h1 className="text-lg font-bold text-[var(--track-brand)] mt-0.5">
        {track.name}
      </h1>
      <p className="text-sm text-stone-500">
        {tourMode ? track.operator : `${track.location} · ${track.operator}`}
      </p>
    </div>
  );
}

function TabBar({ activeTab, onTabChange }: { activeTab: DrawerTab; onTabChange: (tab: DrawerTab) => void }) {
  return (
    <div className="flex border-b border-stone-200 px-4 flex-shrink-0">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            type="button"
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            aria-pressed={isActive}
            className={`px-3 py-2 text-xs font-medium transition-colors duration-150 cursor-pointer border-b-2 -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--track-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
              isActive
                ? 'text-[var(--track-brand)] border-[var(--track-brand)]'
                : 'text-stone-400 border-transparent hover:text-stone-600'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function TabContent({
  track,
  activeTab,
  activeCategories,
  availableCategories,
  selectedPOI,
  onCategoryToggle,
  onPOIClick,
  onPOIClose,
  weather,
  weatherLoading,
  weatherError,
  onStartTour,
  activeRouteId,
  onRouteSelect,
}: {
  track: TrackConfig;
  activeTab: DrawerTab;
  activeCategories: Set<POICategory>;
  availableCategories: POICategory[];
  selectedPOI: PointOfInterest | null;
  onCategoryToggle: (category: POICategory) => void;
  onPOIClick: (poi: PointOfInterest) => void;
  onPOIClose: () => void;
  weather: TrackWeatherData | null;
  weatherLoading: boolean;
  weatherError: string | null;
  onStartTour?: () => void;
  activeRouteId?: string | null;
  onRouteSelect?: (routeId: string | null) => void;
}) {
  const firstTour = track.tours?.[0];
  switch (activeTab) {
    case 'explore':
      return (
        <ExploreTab
          pois={track.pois}
          activeCategories={activeCategories}
          availableCategories={availableCategories}
          selectedPOI={selectedPOI}
          onCategoryToggle={onCategoryToggle}
          onPOIClick={onPOIClick}
          onPOIClose={onPOIClose}
          trackId={track.id}
          trackName={track.name}
          tourAvailable={!!firstTour}
          tourMinutes={firstTour?.estimatedMinutes}
          onStartTour={onStartTour}
        />
      );
    case 'getting-here':
      return (
        <GettingHereTab
          weather={weather}
          weatherLoading={weatherLoading}
          weatherError={weatherError}
          track={track}
          activeRouteId={activeRouteId}
          onRouteSelect={onRouteSelect}
        />
      );
  }
}
