import { useEffect, useRef } from 'react';
import {
  Viewer,
  Cartesian3,
  Math as CesiumMath,
  Matrix4,
  HeadingPitchRange,
  Cesium3DTileset,
  createGooglePhotorealistic3DTileset,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__cesiumViewer = viewer;
    viewer.scene.globe.show = false;

    // Load Google Photorealistic 3D Tiles
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      loadTileset(viewer, apiKey);
    }

    // Set initial camera position
    const target = Cartesian3.fromDegrees(
      track.coordinates.longitude,
      track.coordinates.latitude,
    );

    viewer.camera.lookAt(
      target,
      new HeadingPitchRange(
        CesiumMath.toRadians(track.camera.heading),
        CesiumMath.toRadians(track.camera.pitch),
        track.camera.range,
      ),
    );

    // Unlock camera so user can interact freely
    viewer.camera.lookAtTransform(Matrix4.IDENTITY);

    return () => {
      if (!viewer.isDestroyed()) {
        viewer.destroy();
      }
      viewerRef.current = null;
    };
  }, [track]);

  return <div ref={containerRef} className="w-screen h-screen" />;
}

async function loadTileset(viewer: Viewer, apiKey: string) {
  try {
    // Try the built-in helper first (CesiumJS 1.113+)
    const tileset = await createGooglePhotorealistic3DTileset(apiKey);
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
