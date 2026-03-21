import { useEffect, useRef } from 'react';
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
}

export default function TrackViewer({ track }: TrackViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

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
      loadTileset(viewer, apiKey);
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

    // Enforce camera bounds — keep user within the racecourse precinct
    const boundsListener = enforceCameraBounds(viewer, trackCenter, track.bounds);

    return () => {
      viewer.scene.postUpdate.removeEventListener(boundsListener);
      if (!viewer.isDestroyed()) {
        viewer.destroy();
      }
      viewerRef.current = null;
    };
  }, [track]);

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen"
      style={{ touchAction: 'none' }}
    />
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

function enforceCameraBounds(
  viewer: Viewer,
  center: Cartesian3,
  bounds: TrackConfig['bounds'],
) {
  const listener = () => {
    const camera = viewer.camera;
    const cameraCartographic = Cartographic.fromCartesian(
      camera.positionWC,
      Ellipsoid.WGS84,
    );

    let needsCorrection = false;
    let correctedHeight = cameraCartographic.height;
    let correctedLon = cameraCartographic.longitude;
    let correctedLat = cameraCartographic.latitude;

    // Clamp altitude
    if (cameraCartographic.height > bounds.maxAltitude) {
      correctedHeight = bounds.maxAltitude;
      needsCorrection = true;
    } else if (cameraCartographic.height < bounds.minAltitude) {
      correctedHeight = bounds.minAltitude;
      needsCorrection = true;
    }

    // Clamp distance from track centre
    const distance = Cartesian3.distance(camera.positionWC, center);
    if (distance > bounds.maxDistance) {
      // Pull camera back toward centre along the same direction
      const centerCartographic = Cartographic.fromCartesian(center, Ellipsoid.WGS84);
      const fraction = bounds.maxDistance / distance;
      correctedLon =
        centerCartographic.longitude +
        (cameraCartographic.longitude - centerCartographic.longitude) * fraction;
      correctedLat =
        centerCartographic.latitude +
        (cameraCartographic.latitude - centerCartographic.latitude) * fraction;
      needsCorrection = true;
    }

    if (needsCorrection) {
      camera.setView({
        destination: Cartesian3.fromRadians(
          correctedLon,
          correctedLat,
          correctedHeight,
        ),
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

async function loadTileset(viewer: Viewer, apiKey: string) {
  try {
    // Try the built-in helper first (CesiumJS 1.113+)
    const tileset = await createGooglePhotorealistic3DTileset({ key: apiKey });
    tileset.showCreditsOnScreen = true;
    viewer.scene.primitives.add(tileset);
  } catch {
    // Fallback to manual URL
    const tileset = await Cesium3DTileset.fromUrl(
      `https://tile.googleapis.com/v1/3dtiles/root.json?key=${apiKey}`,
    );
    tileset.showCreditsOnScreen = true;
    viewer.scene.primitives.add(tileset);
  }
}
