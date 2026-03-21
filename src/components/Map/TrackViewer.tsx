import { useEffect, useRef, useCallback } from 'react';
import {
  Viewer,
  Cartesian3,
  Cartographic,
  Math as CesiumMath,
  Matrix4,
  HeadingPitchRange,
  Cesium3DTileset,
  createGooglePhotorealistic3DTileset,
  Ellipsoid,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { TrackConfig } from '../../types/track';

interface TrackViewerProps {
  track: TrackConfig;
  onLoadingChange?: (loading: boolean) => void;
  onError?: (message: string) => void;
}

export default function TrackViewer({ track, onLoadingChange, onError }: TrackViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    onLoadingChange?.(true);

    const viewer = new Viewer(containerRef.current, {
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
    });

    viewerRef.current = viewer;
    if (import.meta.env.DEV) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__cesiumViewer = viewer;
    }
    viewer.scene.globe.show = false;

    // Configure camera controls for smooth interaction
    configureCameraControls(viewer);

    // Load Google Photorealistic 3D Tiles
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      loadTileset(viewer, apiKey, onLoadingChange, onError);
    } else {
      onLoadingChange?.(false);
      onError?.('Google Maps API key is missing. Add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
    }

    // Set initial camera position
    const trackCenter = Cartesian3.fromDegrees(
      track.coordinates.longitude,
      track.coordinates.latitude,
    );

    viewer.camera.lookAt(
      trackCenter,
      new HeadingPitchRange(
        CesiumMath.toRadians(track.camera.heading),
        CesiumMath.toRadians(track.camera.pitch),
        track.camera.range,
      ),
    );

    // Unlock camera so user can interact freely
    viewer.camera.lookAtTransform(Matrix4.IDENTITY);

    // Enforce camera bounds with smooth easing
    const boundsListener = enforceCameraBounds(viewer, trackCenter, track.bounds);

    return () => {
      viewer.scene.postUpdate.removeEventListener(boundsListener);
      if (!viewer.isDestroyed()) {
        viewer.destroy();
      }
      viewerRef.current = null;
    };
  }, [track]);

  const resetView = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    const target = Cartesian3.fromDegrees(
      track.coordinates.longitude,
      track.coordinates.latitude,
    );

    viewer.camera.flyTo({
      destination: target,
      orientation: {
        heading: CesiumMath.toRadians(track.camera.heading),
        pitch: CesiumMath.toRadians(track.camera.pitch),
        roll: 0,
      },
      duration: 1.5,
    });
  }, [track]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
      <ResetViewButton onClick={resetView} />
    </div>
  );
}

function ResetViewButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Reset view"
      className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm rounded-full shadow-lg p-3 hover:bg-white hover:shadow-xl transition-all duration-200 cursor-pointer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 text-gray-700"
      >
        {/* Compass icon */}
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" />
      </svg>
    </button>
  );
}

function configureCameraControls(viewer: Viewer) {
  const controller = viewer.scene.screenSpaceCameraController;

  // Zoom limits — keep within useful range for racecourse viewing
  controller.minimumZoomDistance = 50;
  controller.maximumZoomDistance = 2000;

  // Smooth inertia for orbit, pan, and zoom gestures
  controller.inertiaSpin = 0.9;
  controller.inertiaTranslate = 0.9;
  controller.inertiaZoom = 0.8;

  // Prevent camera going underground
  controller.minimumCollisionTerrainHeight = 100;

  // Enable tilt on all devices (default touch: one-finger tilt, two-finger rotate)
  controller.enableTilt = true;
  controller.enableZoom = true;
  controller.enableRotate = true;
  controller.enableTranslate = true;
}

// Easing strength: 0 = no correction, 1 = instant snap. 0.1 gives a gentle pull-back.
const EASE_FACTOR = 0.1;

function enforceCameraBounds(
  viewer: Viewer,
  center: Cartesian3,
  bounds: TrackConfig['bounds'],
) {
  const centerCartographic = Cartographic.fromCartesian(center, Ellipsoid.WGS84);

  const listener = () => {
    const camera = viewer.camera;
    const camCarto = Cartographic.fromCartesian(
      camera.positionWC,
      Ellipsoid.WGS84,
    );

    let needsCorrection = false;
    let targetHeight = camCarto.height;
    let targetLon = camCarto.longitude;
    let targetLat = camCarto.latitude;

    // Clamp altitude
    if (camCarto.height > bounds.maxAltitude) {
      targetHeight = bounds.maxAltitude;
      needsCorrection = true;
    } else if (camCarto.height < bounds.minAltitude) {
      targetHeight = bounds.minAltitude;
      needsCorrection = true;
    }

    // Clamp distance from track centre
    const distance = Cartesian3.distance(camera.positionWC, center);
    if (distance > bounds.maxDistance) {
      const fraction = bounds.maxDistance / distance;
      targetLon =
        centerCartographic.longitude +
        (camCarto.longitude - centerCartographic.longitude) * fraction;
      targetLat =
        centerCartographic.latitude +
        (camCarto.latitude - centerCartographic.latitude) * fraction;
      needsCorrection = true;
    }

    if (needsCorrection) {
      // Ease toward the corrected position instead of snapping
      const easedLon = camCarto.longitude + (targetLon - camCarto.longitude) * EASE_FACTOR;
      const easedLat = camCarto.latitude + (targetLat - camCarto.latitude) * EASE_FACTOR;
      const easedHeight = camCarto.height + (targetHeight - camCarto.height) * EASE_FACTOR;

      camera.setView({
        destination: Cartesian3.fromRadians(easedLon, easedLat, easedHeight),
        orientation: {
          heading: camera.heading,
          pitch: camera.pitch,
          roll: camera.roll,
        },
      });
    }
  };

  viewer.scene.postUpdate.addEventListener(listener);
  return listener;
}

async function loadTileset(
  viewer: Viewer,
  apiKey: string,
  onLoadingChange?: (loading: boolean) => void,
  onError?: (message: string) => void,
) {
  try {
    let tileset: Cesium3DTileset;
    try {
      tileset = await createGooglePhotorealistic3DTileset({ key: apiKey });
    } catch {
      tileset = await Cesium3DTileset.fromUrl(
        `https://tile.googleapis.com/v1/3dtiles/root.json?key=${apiKey}`,
      );
    }

    if (viewer.isDestroyed()) return;

    tileset.showCreditsOnScreen = true;
    viewer.scene.primitives.add(tileset);

    // Wait for initial tiles to load before hiding the spinner
    const removeListener = tileset.tileLoad.addEventListener(() => {
      onLoadingChange?.(false);
      removeListener();
    });

    // Fallback: if no tiles load within 10s, hide spinner anyway
    setTimeout(() => onLoadingChange?.(false), 10000);
  } catch (err) {
    onLoadingChange?.(false);
    const message = err instanceof Error ? err.message : 'Failed to load 3D tiles';
    onError?.(message);
  }
}
