import { useState, useCallback, useRef, MutableRefObject } from 'react';
import { Viewer, Cartesian3, Math as CesiumMath } from 'cesium';
import { Tour, TourStop } from '../types/tour';
import { TrackConfig } from '../types/track';

export interface UseTourReturn {
  isActive: boolean;
  currentStop: TourStop | null;
  currentIndex: number;
  totalStops: number;
  isAutoPlay: boolean;

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
  const tourRef = useRef<Tour | null>(null);

  const flyToStop = useCallback(
    (stop: TourStop) => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;

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
      });
    },
    [viewerRef],
  );

  const resetCamera = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

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
  }, [viewerRef, track]);

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
    tourRef.current = null;
    setIsActive(false);
    setCurrentIndex(0);
    setIsAutoPlay(false);
    resetCamera();
  }, [resetCamera]);

  const goToStop = useCallback(
    (index: number) => {
      const tour = tourRef.current;
      if (!tour || index < 0 || index >= tour.stops.length) return;
      setCurrentIndex(index);
      flyToStop(tour.stops[index]);
    },
    [flyToStop],
  );

  const nextStop = useCallback(() => {
    const tour = tourRef.current;
    if (!tour) return;
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= tour.stops.length) return prev;
      flyToStop(tour.stops[next]);
      return next;
    });
  }, [flyToStop]);

  const prevStop = useCallback(() => {
    const tour = tourRef.current;
    if (!tour) return;
    setCurrentIndex((prev) => {
      const next = prev - 1;
      if (next < 0) return prev;
      flyToStop(tour.stops[next]);
      return next;
    });
  }, [flyToStop]);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlay((prev) => !prev);
  }, []);

  const currentStop = tourRef.current?.stops[currentIndex] ?? null;
  const totalStops = tourRef.current?.stops.length ?? 0;

  return {
    isActive,
    currentStop,
    currentIndex,
    totalStops,
    isAutoPlay,
    startTour,
    endTour,
    nextStop,
    prevStop,
    goToStop,
    toggleAutoPlay,
  };
}
