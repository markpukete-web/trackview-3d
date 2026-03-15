import { useEffect, useRef } from 'react';
import { Viewer, Cesium3DTileset } from 'resium';
import {
  Cartesian3,
  Math as CesiumMath,
  HeadingPitchRange,
  Viewer as CesiumViewer,
} from 'cesium';
import { TrackConfig } from '../../types/track';

interface TrackViewerProps {
  track: TrackConfig;
}

const TILES_URL = `https://tile.googleapis.com/v1/3dtiles/root.json?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;

export default function TrackViewer({ track }: TrackViewerProps) {
  const viewerRef = useRef<CesiumViewer | null>(null);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.scene.globe.show = false;

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

    viewer.camera.lookAtTransform(
      viewer.camera.transform,
    );
  }, [track]);

  return (
    <Viewer
      ref={(e) => {
        if (e?.cesiumElement) {
          viewerRef.current = e.cesiumElement;
        }
      }}
      full
      requestRenderMode
      baseLayerPicker={false}
      geocoder={false}
      homeButton={false}
      sceneModePicker={false}
      navigationHelpButton={false}
      animation={false}
      timeline={false}
      fullscreenButton={false}
    >
      <Cesium3DTileset
        url={TILES_URL}
        showCreditsOnScreen
      />
    </Viewer>
  );
}
