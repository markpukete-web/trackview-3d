import { CSSProperties, ReactNode } from 'react';
import { Map, X } from 'lucide-react';
import { motion, PanInfo, useReducedMotion } from 'framer-motion';
import { PointOfInterest, TrackConfig } from '../../types/track';
import type { TrackWeatherData } from '../../types/weather';
import { TourStop } from '../../types/tour';
import { DrawerState } from '../../types/discovery';
import {
  MOBILE_SHEET_EXPANDED_HEIGHT,
  MOBILE_SHEET_RESTING_HEIGHT,
  MOBILE_SHEET_RESULTS_HEIGHT,
} from '../../constants/layout';
import ExploreTab from './ExploreTab';
import GettingHereTab from './GettingHereTab';
import TourCard from './TourCard';
import TourBar from './TourBar';
import TourWelcome from './TourWelcome';

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
  drawerState: DrawerState;
  onDrawerStateChange: (state: DrawerState) => void;
  onDrawerClose: () => void;
  activeTab: DrawerTab;
  onTabChange: (tab: DrawerTab) => void;
  pois: PointOfInterest[];
  resultSummary: string;
  hasActiveFilter: boolean;
  onClearFilter: () => void;
  selectedPOI: PointOfInterest | null;
  onPOIClick: (poi: PointOfInterest) => void;
  onPOIClose: () => void;
  onPOIViewOnMap: () => void;
  weather: TrackWeatherData | null;
  weatherLoading: boolean;
  weatherError: string | null;
  tour?: TourProps;
  showTourIntro: boolean;
  tourAvailable?: boolean;
  tourMinutes?: number;
  onStartTour?: () => void;
  onDismissTourIntro?: () => void;
  onResetTourIntro?: () => void;
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
  drawerState,
  onDrawerStateChange,
  onDrawerClose,
  activeTab,
  onTabChange,
  pois,
  resultSummary,
  hasActiveFilter,
  onClearFilter,
  selectedPOI,
  onPOIClick,
  onPOIClose,
  onPOIViewOnMap,
  weather,
  weatherLoading,
  weatherError,
  tour,
  showTourIntro,
  tourAvailable,
  tourMinutes,
  onStartTour,
  onDismissTourIntro,
  onResetTourIntro,
  activeRouteId,
  onRouteSelect,
}: ContextDrawerProps) {
  const isTourActive = tour?.isActive && tour.currentStop;
  const shouldReduceMotion = useReducedMotion();
  const drawerStyle = { '--track-brand': track.brandColour || '#1c1917' } as CSSProperties;
  const isFullDrawer = drawerState === 'results' || drawerState === 'expanded';

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y < -50 || info.velocity.y < -500) {
      onDrawerStateChange('expanded');
      return;
    }

    if (info.offset.y > 50 || info.velocity.y > 500) {
      onDrawerStateChange(drawerState === 'expanded' ? 'results' : 'resting');
    }
  };

  const toggleMobileSheet = () => {
    if (drawerState === 'expanded') {
      onDrawerStateChange('results');
      return;
    }
    onDrawerStateChange(drawerState === 'resting' ? 'results' : 'expanded');
  };

  const mobileHeight =
    drawerState === 'expanded'
      ? MOBILE_SHEET_EXPANDED_HEIGHT
      : drawerState === 'results'
        ? MOBILE_SHEET_RESULTS_HEIGHT
        : MOBILE_SHEET_RESTING_HEIGHT;

  return (
    <>
      {isTourActive ? (
        <DesktopTourDrawer track={track} drawerStyle={drawerStyle} tour={tour} />
      ) : (
        <DesktopDrawerShell
          track={track}
          drawerStyle={drawerStyle}
          drawerState={drawerState}
          onOpen={() => onDrawerStateChange('results')}
          onClose={onDrawerClose}
        >
          <DrawerBody
            track={track}
            activeTab={activeTab}
            onTabChange={onTabChange}
            pois={pois}
            resultSummary={resultSummary}
            hasActiveFilter={hasActiveFilter}
            onClearFilter={onClearFilter}
            selectedPOI={selectedPOI}
            onPOIClick={onPOIClick}
            onPOIClose={onPOIClose}
            onPOIViewOnMap={onPOIViewOnMap}
            weather={weather}
            weatherLoading={weatherLoading}
            weatherError={weatherError}
            showTourIntro={showTourIntro}
            tourAvailable={tourAvailable}
            tourMinutes={tourMinutes}
            onStartTour={onStartTour}
            onDismissTourIntro={onDismissTourIntro}
            onResetTourIntro={onResetTourIntro}
            activeRouteId={activeRouteId}
            onRouteSelect={onRouteSelect}
          />
        </DesktopDrawerShell>
      )}

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
          className="md:hidden fixed bottom-0 left-0 right-0 z-20 pointer-events-auto bg-white/90 backdrop-blur-xl rounded-t-[24px] shadow-[0_-14px_32px_-20px_rgba(0,0,0,0.24)] flex flex-col border-t border-white/70"
          style={drawerStyle}
          initial={false}
          animate={{ height: mobileHeight }}
          transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0.12, duration: 0.45 }}
        >
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.18}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            className="w-full flex-shrink-0 cursor-grab pt-3 active:cursor-grabbing"
          >
            <div className="flex w-full justify-center pb-2">
              <div className="h-1.5 w-12 rounded-full bg-stone-300" />
            </div>
            <MobileDrawerHeader
              track={track}
              expanded={drawerState === 'expanded'}
              controlsId={MOBILE_SHEET_CONTENT_ID}
              onToggle={toggleMobileSheet}
              onClose={onDrawerClose}
              compact={drawerState === 'resting'}
            />
          </motion.div>

          {isFullDrawer && (
            <div id={MOBILE_SHEET_CONTENT_ID} className="flex min-h-0 flex-1 flex-col overflow-hidden pb-safe">
              <DrawerBody
                track={track}
                activeTab={activeTab}
                onTabChange={onTabChange}
                pois={pois}
                resultSummary={resultSummary}
                hasActiveFilter={hasActiveFilter}
                onClearFilter={onClearFilter}
                selectedPOI={selectedPOI}
                onPOIClick={onPOIClick}
                onPOIClose={onPOIClose}
                onPOIViewOnMap={onPOIViewOnMap}
                weather={weather}
                weatherLoading={weatherLoading}
                weatherError={weatherError}
                showTourIntro={showTourIntro}
                tourMinutes={tourMinutes}
                onStartTour={onStartTour}
                onDismissTourIntro={onDismissTourIntro}
                activeRouteId={activeRouteId}
                onRouteSelect={onRouteSelect}
              />
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}

function DesktopTourDrawer({
  track,
  drawerStyle,
  tour,
}: {
  track: TrackConfig;
  drawerStyle: CSSProperties;
  tour: TourProps;
}) {
  return (
    <div className="hidden md:flex absolute top-0 right-0 h-full w-[360px] z-20 pointer-events-none">
      <div
        className="pointer-events-auto m-4 mt-4 w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[calc(100%-2rem)] border border-white/60"
        style={drawerStyle}
      >
        <DrawerHeader track={track} tourMode />
        <div className="flex-1 overflow-y-auto p-4">
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
        </div>
      </div>
    </div>
  );
}

function DesktopDrawerShell({
  track,
  drawerStyle,
  drawerState,
  onOpen,
  onClose,
  children,
}: {
  track: TrackConfig;
  drawerStyle: CSSProperties;
  drawerState: DrawerState;
  onOpen: () => void;
  onClose: () => void;
  children: ReactNode;
}) {
  if (drawerState === 'closed') return null;

  if (drawerState === 'resting') {
    return (
      <div className="hidden md:block absolute right-4 top-20 z-20 pointer-events-none">
        <button
          type="button"
          onClick={onOpen}
          className="pointer-events-auto w-64 rounded-2xl border border-white/70 bg-white/85 p-3 text-left shadow-lg backdrop-blur-xl transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--track-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900 motion-reduce:transition-none"
          style={drawerStyle}
          aria-label={`Open ${track.name} details`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
            TrackView 3D
          </p>
          <p className="mt-0.5 text-sm font-bold text-[var(--track-brand)]">
            {track.name}
          </p>
          <p className="mt-0.5 text-xs text-stone-500">
            {track.location}
          </p>
        </button>
      </div>
    );
  }

  return (
    <div className="hidden md:flex absolute top-0 right-0 h-full w-[360px] z-20 pointer-events-none">
      <div
        className="pointer-events-auto m-4 mt-4 w-full bg-white/85 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[calc(100%-2rem)] border border-white/60"
        style={drawerStyle}
      >
        <DrawerHeader track={track} onClose={onClose} />
        {children}
      </div>
    </div>
  );
}

function DrawerHeader({
  track,
  tourMode,
  onClose,
}: {
  track: TrackConfig;
  tourMode?: boolean;
  onClose?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 border-t-[4px] border-[var(--track-brand)] px-4 pb-2 pt-4" style={!track.brandColour ? { borderTopColor: 'transparent' } : undefined}>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-stone-400 uppercase tracking-widest font-medium">
          {tourMode ? 'Guided Tour' : 'TrackView 3D'}
        </p>
        <h1 className="mt-0.5 truncate text-lg font-bold text-[var(--track-brand)]">
          {track.name}
        </h1>
        <p className="text-sm text-stone-500">
          {tourMode ? track.operator : `${track.location} · ${track.operator}`}
        </p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--track-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
          aria-label="Close details"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function MobileDrawerHeader({
  track,
  expanded,
  controlsId,
  onToggle,
  onClose,
  compact,
}: {
  track: TrackConfig;
  expanded: boolean;
  controlsId: string;
  onToggle: () => void;
  onClose: () => void;
  compact: boolean;
}) {
  return (
    <div className="flex items-center gap-2 px-4 pb-2">
      <button
        type="button"
        className="min-w-0 flex-1 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--track-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={controlsId}
        aria-label={expanded ? `Collapse ${track.name} details` : `Expand ${track.name} details`}
      >
        <h1 className="truncate text-base font-bold text-[var(--track-brand)]">
          {compact ? `Explore ${track.shortName ?? track.name}` : track.name}
        </h1>
        <p className="truncate text-xs text-stone-500">
          {compact ? 'Tap for places, transport, and details' : track.location}
        </p>
      </button>
      {!compact && (
        <button
          type="button"
          onClick={onClose}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-600 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--track-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
          aria-label="View map"
        >
          <Map className="h-3.5 w-3.5" />
          <span>View map</span>
        </button>
      )}
    </div>
  );
}

function TabBar({ activeTab, onTabChange }: { activeTab: DrawerTab; onTabChange: (tab: DrawerTab) => void }) {
  return (
    <div className="flex flex-shrink-0 border-b border-stone-200 px-4">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            type="button"
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            aria-pressed={isActive}
            className={`-mb-px border-b-2 px-3 py-2 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--track-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none ${
              isActive
                ? 'border-[var(--track-brand)] text-[var(--track-brand)]'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function DrawerBody({
  track,
  activeTab,
  onTabChange,
  pois,
  resultSummary,
  hasActiveFilter,
  onClearFilter,
  selectedPOI,
  onPOIClick,
  onPOIClose,
  onPOIViewOnMap,
  weather,
  weatherLoading,
  weatherError,
  showTourIntro,
  tourAvailable,
  tourMinutes,
  onStartTour,
  onDismissTourIntro,
  onResetTourIntro,
  activeRouteId,
  onRouteSelect,
}: {
  track: TrackConfig;
  activeTab: DrawerTab;
  onTabChange: (tab: DrawerTab) => void;
  pois: PointOfInterest[];
  resultSummary: string;
  hasActiveFilter: boolean;
  onClearFilter: () => void;
  selectedPOI: PointOfInterest | null;
  onPOIClick: (poi: PointOfInterest) => void;
  onPOIClose: () => void;
  onPOIViewOnMap: () => void;
  weather: TrackWeatherData | null;
  weatherLoading: boolean;
  weatherError: string | null;
  showTourIntro: boolean;
  tourAvailable?: boolean;
  tourMinutes?: number;
  onStartTour?: () => void;
  onDismissTourIntro?: () => void;
  onResetTourIntro?: () => void;
  activeRouteId?: string | null;
  onRouteSelect?: (routeId: string | null) => void;
}) {
  if (showTourIntro && tourMinutes && onStartTour && onDismissTourIntro) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <TourWelcome
          trackName={track.name}
          estimatedMinutes={tourMinutes}
          onStartTour={onStartTour}
          onDismiss={onDismissTourIntro}
        />
      </div>
    );
  }

  return (
    <>
      <TabBar activeTab={activeTab} onTabChange={onTabChange} />
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'explore' ? (
          <ExploreTab
            pois={pois}
            selectedPOI={selectedPOI}
            resultSummary={resultSummary}
            hasActiveFilter={hasActiveFilter}
            onClearFilter={onClearFilter}
            onPOIClick={onPOIClick}
            onPOIClose={onPOIClose}
            onPOIViewOnMap={onPOIViewOnMap}
            trackId={track.id}
          />
        ) : (
          <GettingHereTab
            weather={weather}
            weatherLoading={weatherLoading}
            weatherError={weatherError}
            track={track}
            activeRouteId={activeRouteId}
            onRouteSelect={onRouteSelect}
            tourAvailable={tourAvailable}
            tourMinutes={tourMinutes}
            onResetTourIntro={onResetTourIntro}
          />
        )}
      </div>
    </>
  );
}
