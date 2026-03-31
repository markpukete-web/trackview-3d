import { PointOfInterest, POICategory, TrackConfig } from '../../types/track';
import type { TrackWeatherData } from '../../types/weather';
import { TourStop } from '../../types/tour';
import ExploreTab from './ExploreTab';
import GettingHereTab from './GettingHereTab';
import AccessibilityTab from './AccessibilityTab';
import TourCard from './TourCard';
import TourBar from './TourBar';

export type DrawerTab = 'explore' | 'getting-here' | 'accessibility';

interface TourProps {
  isActive: boolean;
  currentStop: TourStop | null;
  currentIndex: number;
  totalStops: number;
  isAutoPlay: boolean;
  dwellRemaining: number;
  onNext: () => void;
  onPrev: () => void;
  onToggleAutoPlay: () => void;
  onEndTour: () => void;
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
}

const TABS: { id: DrawerTab; label: string }[] = [
  { id: 'explore', label: 'Explore' },
  { id: 'getting-here', label: 'Getting Here' },
  { id: 'accessibility', label: 'Accessibility' },
];

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
}: ContextDrawerProps) {
  const isTourActive = tour?.isActive && tour.currentStop;

  return (
    <>
      {/* Desktop: right-side drawer */}
      <div className="hidden md:flex absolute top-0 right-0 h-full w-[360px] z-20 pointer-events-none">
        <div className="pointer-events-auto m-3 w-full bg-white/85 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[calc(100%-1.5rem)]">
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
                dwellRemaining={tour.dwellRemaining}
                pois={track.pois}
                onNext={tour.onNext}
                onPrev={tour.onPrev}
                onToggleAutoPlay={tour.onToggleAutoPlay}
                onEndTour={tour.onEndTour}
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
          dwellRemaining={tour.dwellRemaining}
          pois={track.pois}
          onNext={tour.onNext}
          onPrev={tour.onPrev}
          onToggleAutoPlay={tour.onToggleAutoPlay}
          onEndTour={tour.onEndTour}
        />
      ) : (
        <div className="md:hidden absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
          <div className="pointer-events-auto bg-white/85 backdrop-blur-lg rounded-t-2xl shadow-xl max-h-[55vh] flex flex-col">
            <DrawerHeader track={track} compact />
            <TabBar activeTab={activeTab} onTabChange={onTabChange} />
            <div className="flex-1 overflow-y-auto p-4">
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
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DrawerHeader({ track, compact, tourMode }: { track: TrackConfig; compact?: boolean; tourMode?: boolean }) {
  if (compact) {
    return (
      <div className="px-4 pb-1">
        <h1 className="text-base font-bold text-gray-900">
          {tourMode ? 'Guided Tour' : track.name}
        </h1>
        <p className="text-xs text-gray-500">
          {tourMode ? track.name : track.location}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-2">
      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
        {tourMode ? 'Guided Tour' : 'TrackView 3D'}
      </p>
      <h1 className="text-lg font-bold text-gray-900 mt-0.5">{track.name}</h1>
      <p className="text-sm text-gray-500">
        {tourMode ? track.operator : `${track.location} · ${track.operator}`}
      </p>
    </div>
  );
}

function TabBar({ activeTab, onTabChange }: { activeTab: DrawerTab; onTabChange: (tab: DrawerTab) => void }) {
  return (
    <div className="flex border-b border-gray-200 px-4 flex-shrink-0">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-3 py-2 text-xs font-medium transition-colors duration-150 cursor-pointer border-b-2 -mb-px ${
            activeTab === tab.id
              ? 'text-gray-900 border-gray-900'
              : 'text-gray-400 border-transparent hover:text-gray-600'
          }`}
        >
          {tab.label}
        </button>
      ))}
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
          transport={track.transport}
          weather={weather}
          weatherLoading={weatherLoading}
          weatherError={weatherError}
        />
      );
    case 'accessibility':
      return <AccessibilityTab accessibility={track.accessibility} />;
  }
}
