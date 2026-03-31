import { useState, useCallback, useRef, useEffect, MutableRefObject } from 'react';
import {
  Viewer,
  Cartesian3,
  Math as CesiumMath,
  Matrix4,
  HeadingPitchRange,
} from 'cesium';
import { Tour, TourStop } from '../types/tour';
import { TrackConfig } from '../types/track';

const DEFAULT_DWELL = 8;
const DEFAULT_ORBIT_SPEED = 2; // degrees per second

/** Check if user prefers reduced motion */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface UseTourReturn {
  isActive: boolean;
  currentStop: TourStop | null;
  currentIndex: number;
  totalStops: number;
  isAutoPlay: boolean;
  dwellRemaining: number;
  isOrbiting: boolean;

  startTour: (tour: Tour) => void;
  endTour: () => void;
  nextStop: () => void;
  prevStop: () => void;
  goToStop: (index: number) => void;
  toggleAutoPlay: () => void;
}

export function useTour(
  viewerRef: MutableRefObject<Viewer | null>,
  track: TrackConfig,
): UseTourReturn {
  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [dwellRemaining, setDwellRemaining] = useState(0);
  const [isOrbiting, setIsOrbiting] = useState(false);

  const tourRef = useRef<Tour | null>(null);
  const orbitHeadingRef = useRef(0);
  const orbitListenerRef = useRef<(() => void) | null>(null);
  const orbitInterruptCleanupRef = useRef<(() => void) | null>(null);
  const dwellTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAutoPlayRef = useRef(false);
  const currentIndexRef = useRef(0);
  // Ref to break circular dependency: startDwell -> navigateToStop -> flyToStop -> startDwell
  const navigateRef = useRef<(index: number) => void>(() => {});

  // Keep refs in sync with state
  isAutoPlayRef.current = isAutoPlay;
  currentIndexRef.current = currentIndex;

  /** Remove orbit postUpdate listener and unlock camera */
  const stopOrbit = useCallback(() => {
    const viewer = viewerRef.current;
    if (orbitListenerRef.current && viewer && !viewer.isDestroyed()) {
      viewer.scene.postUpdate.removeEventListener(orbitListenerRef.current);
      viewer.camera.lookAtTransform(Matrix4.IDENTITY);
    }
    orbitListenerRef.current = null;
    if (orbitInterruptCleanupRef.current) {
      orbitInterruptCleanupRef.current();
      orbitInterruptCleanupRef.current = null;
    }
    setIsOrbiting(false);
  }, [viewerRef]);

  /** Clear dwell timer and auto-advance timeout */
  const clearTimers = useCallback(() => {
    if (dwellTimerRef.current) {
      clearInterval(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
    setDwellRemaining(0);
  }, []);

  /** Start orbiting around the track centre */
  const startOrbit = useCallback(
    (stop: TourStop) => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;
      if (prefersReducedMotion()) return;

      const speed = stop.orbit?.speed ?? DEFAULT_ORBIT_SPEED;
      const target = getTourStopTarget(stop, track);
      const cameraDestination = Cartesian3.fromDegrees(
        stop.camera.longitude,
        stop.camera.latitude,
        stop.camera.height,
      );
      const range =
        stop.orbit?.range ?? Cartesian3.distance(cameraDestination, target);

      // Start from current heading
      orbitHeadingRef.current = CesiumMath.toRadians(stop.camera.heading);

      let lastTime = performance.now();
      let paused = false;

      const listener = () => {
        if (!viewer || viewer.isDestroyed() || paused) return;

        const now = performance.now();
        const dt = (now - lastTime) / 1000;
        lastTime = now;
        orbitHeadingRef.current += CesiumMath.toRadians(speed) * dt;

        viewer.camera.lookAt(
          target,
          new HeadingPitchRange(
            orbitHeadingRef.current,
            CesiumMath.toRadians(stop.camera.pitch),
            range,
          ),
        );
        viewer.scene.requestRender();
      };

      const canvas = viewer.canvas;

      const pauseOrbit = () => {
        paused = true;
        viewer.camera.lookAtTransform(Matrix4.IDENTITY);
        setIsOrbiting(false);
        canvas.addEventListener('pointerup', resumeOrbit, { once: true });
      };

      const resumeOrbit = () => {
        if (viewer.isDestroyed()) return;
        orbitHeadingRef.current = viewer.camera.heading + Math.PI;
        lastTime = performance.now();
        paused = false;
        setIsOrbiting(true);
        viewer.scene.requestRender();
        canvas.addEventListener('pointerdown', pauseOrbit, { once: true });
      };

      viewer.scene.postUpdate.addEventListener(listener);
      orbitListenerRef.current = listener;
      setIsOrbiting(true);

      canvas.addEventListener('pointerdown', pauseOrbit, { once: true });
      orbitInterruptCleanupRef.current = () => {
        canvas.removeEventListener('pointerdown', pauseOrbit);
        canvas.removeEventListener('pointerup', resumeOrbit);
      };

      viewer.scene.requestRender();
    },
    [viewerRef, track],
  );

  /** Start dwell timer (countdown) and schedule auto-advance if auto-play is on */
  const startDwell = useCallback(
    (stop: TourStop) => {
      const dwellSeconds = stop.dwellTime ?? DEFAULT_DWELL;
      setDwellRemaining(dwellSeconds);

      // Countdown timer — ticks every second
      dwellTimerRef.current = setInterval(() => {
        setDwellRemaining((prev) => {
          if (prev <= 1) {
            if (dwellTimerRef.current) clearInterval(dwellTimerRef.current);
            dwellTimerRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Auto-advance after dwell (only in auto-play mode)
      if (isAutoPlayRef.current) {
        autoAdvanceRef.current = setTimeout(() => {
          autoAdvanceRef.current = null;
          const tour = tourRef.current;
          if (!tour) return;
          const nextIdx = currentIndexRef.current + 1;
          if (nextIdx < tour.stops.length) {
            navigateRef.current(nextIdx);
          } else {
            setIsAutoPlay(false);
          }
        }, dwellSeconds * 1000);
      }
    },
    [],
  );

  /** Fly to a stop, then start orbit + dwell after landing */
  const flyToStop = useCallback(
    (stop: TourStop) => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;

      // Clean up previous orbit and timers
      viewer.camera.cancelFlight();
      stopOrbit();
      clearTimers();

      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(
          stop.camera.longitude,
          stop.camera.latitude,
          stop.camera.height,
        ),
        orientation: {
          heading: CesiumMath.toRadians(stop.camera.heading),
          pitch: CesiumMath.toRadians(stop.camera.pitch),
          roll: 0,
        },
        duration: 1.5,
        complete: () => {
          // After flight completes, start orbit (only if configured) and dwell
          if (stop.orbit) {
            startOrbit(stop);
          }
          startDwell(stop);
        },
      });
    },
    [viewerRef, stopOrbit, clearTimers, startOrbit, startDwell],
  );

  /** Navigate to a specific stop index — used by next/prev/goTo and auto-advance */
  const navigateToStop = useCallback(
    (index: number) => {
      const tour = tourRef.current;
      if (!tour || index < 0 || index >= tour.stops.length) return;
      stopOrbit();
      clearTimers();
      setCurrentIndex(index);
      flyToStop(tour.stops[index]);
    },
    [flyToStop, stopOrbit, clearTimers],
  );

  // Keep navigateRef in sync
  navigateRef.current = navigateToStop;

  const startTour = useCallback(
    (tour: Tour) => {
      tourRef.current = tour;
      setIsActive(true);
      setCurrentIndex(0);
      setIsAutoPlay(false);
      if (tour.stops.length > 0) {
        flyToStop(tour.stops[0]);
      }
    },
    [flyToStop],
  );

  const endTour = useCallback(() => {
    // Mark tour as completed if user reached the last stop
    const tour = tourRef.current;
    if (tour && currentIndexRef.current >= tour.stops.length - 1) {
      try {
        localStorage.setItem(`trackview-tour-completed-${track.id}`, '1');
      } catch { /* private browsing */ }
    }

    stopOrbit();
    clearTimers();
    tourRef.current = null;
    setIsActive(false);
    setCurrentIndex(0);
    setIsAutoPlay(false);
    setDwellRemaining(0);

    // Fly back to default view
    const viewer = viewerRef.current;
    if (viewer && !viewer.isDestroyed()) {
      viewer.camera.cancelFlight();
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(
          track.camera.longitude,
          track.camera.latitude,
          track.camera.height,
        ),
        orientation: {
          heading: CesiumMath.toRadians(track.camera.heading),
          pitch: CesiumMath.toRadians(track.camera.pitch),
          roll: 0,
        },
        duration: 1.5,
      });
    }
  }, [viewerRef, track, stopOrbit, clearTimers]);

  const goToStop = useCallback(
    (index: number) => {
      // Manual navigation interrupts auto-play
      setIsAutoPlay(false);
      navigateToStop(index);
    },
    [navigateToStop],
  );

  const nextStop = useCallback(() => {
    const tour = tourRef.current;
    if (!tour) return;
    const next = currentIndexRef.current + 1;
    if (next >= tour.stops.length) return;
    // Manual next interrupts auto-play
    setIsAutoPlay(false);
    navigateToStop(next);
  }, [navigateToStop]);

  const prevStop = useCallback(() => {
    const tour = tourRef.current;
    if (!tour) return;
    const prev = currentIndexRef.current - 1;
    if (prev < 0) return;
    // Manual prev interrupts auto-play
    setIsAutoPlay(false);
    navigateToStop(prev);
  }, [navigateToStop]);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlay((prev) => {
      const next = !prev;
      if (next) {
        // If toggling on and dwell has expired, advance immediately
        // Otherwise the current dwell will finish and auto-advance will pick up
        // via the next flyToStop -> startDwell cycle
        const tour = tourRef.current;
        if (tour) {
          // Re-trigger dwell with auto-advance for current stop
          clearTimers();
          const stop = tour.stops[currentIndexRef.current];
          if (stop) {
            // Temporarily set ref so startDwell sees auto-play as on
            isAutoPlayRef.current = true;
            const dwellSeconds = stop.dwellTime ?? DEFAULT_DWELL;
            setDwellRemaining(dwellSeconds);

            dwellTimerRef.current = setInterval(() => {
              setDwellRemaining((p) => {
                if (p <= 1) {
                  if (dwellTimerRef.current) clearInterval(dwellTimerRef.current);
                  dwellTimerRef.current = null;
                  return 0;
                }
                return p - 1;
              });
            }, 1000);

            autoAdvanceRef.current = setTimeout(() => {
              autoAdvanceRef.current = null;
              const nextIdx = currentIndexRef.current + 1;
              if (nextIdx < tour.stops.length) {
                navigateRef.current(nextIdx);
              } else {
                setIsAutoPlay(false);
              }
            }, dwellSeconds * 1000);
          }
        }
      } else {
        // Toggling off — clear auto-advance but keep orbit
        if (autoAdvanceRef.current) {
          clearTimeout(autoAdvanceRef.current);
          autoAdvanceRef.current = null;
        }
      }
      return next;
    });
  }, [clearTimers]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopOrbit();
      clearTimers();
    };
  }, [stopOrbit, clearTimers]);

  const currentStop = tourRef.current?.stops[currentIndex] ?? null;
  const totalStops = tourRef.current?.stops.length ?? 0;

  return {
    isActive,
    currentStop,
    currentIndex,
    totalStops,
    isAutoPlay,
    dwellRemaining,
    isOrbiting,
    startTour,
    endTour,
    nextStop,
    prevStop,
    goToStop,
    toggleAutoPlay,
  };
}

function getTourStopTarget(stop: TourStop, track: TrackConfig): Cartesian3 {
  const linkedPoi = stop.poiId
    ? track.pois.find((poi) => poi.id === stop.poiId)
    : null;

  if (linkedPoi) {
    return Cartesian3.fromDegrees(
      linkedPoi.position.longitude,
      linkedPoi.position.latitude,
      linkedPoi.position.height ?? 0,
    );
  }

  if (stop.target) {
    return Cartesian3.fromDegrees(
      stop.target.longitude,
      stop.target.latitude,
      stop.target.height ?? 0,
    );
  }

  return Cartesian3.fromDegrees(
    track.coordinates.longitude,
    track.coordinates.latitude,
    0,
  );
}
