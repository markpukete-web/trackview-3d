import { useEffect } from 'react';
import * as Cesium from 'cesium';
import { TrackConfig, WalkingRoute } from '../types/track';

export function useRouteOverlay(
  viewer: Cesium.Viewer | null,
  track: TrackConfig,
  activeRouteId: string | null
) {
  useEffect(() => {
    console.log(`[useRouteOverlay] Effect triggered for track: ${track.name}, activeRouteId: ${activeRouteId}`);
    if (!viewer || viewer.isDestroyed() || !activeRouteId) return;

    const route = track.routes?.find((r: WalkingRoute) => r.id === activeRouteId);
    if (!route) return;

    console.log(`🗺️ Rendering route: ${route.name} (${route.waypoints.length} points)`);

    const flatCoords = route.waypoints.flatMap((vp: [number, number]) => [vp[0], vp[1]]);
    
    // Use a bright, high-contrast cyan/blue instead of the dark track brand color
    // so it stands out against the dark asphalt and grass in satellite imagery.
    const color = Cesium.Color.fromCssColorString('#0ea5e9'); // Tailwind sky-500

    const cartesianPositions = Cesium.Cartesian3.fromDegreesArray(flatCoords);

    // We can confidently use Entity API here directly on the viewer
    const entity = viewer.entities.add({
      id: `route-${route.id}`,
      polyline: {
        positions: cartesianPositions,
        width: 8, // Thicker line for better visibility
        material: color,
        clampToGround: true,
      },
    });

    // Compute bouncing sphere manually from the raw coordinates. 
    // This avoids a Cesium bug where ground clamper entities occasionally generate globe-sized spheres.
    const boundingSphere = Cesium.BoundingSphere.fromPoints(cartesianPositions);

    viewer.camera.cancelFlight();
    viewer.camera.flyToBoundingSphere(boundingSphere, {
      duration: 1.5,
      offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(track.camera.heading),
        Cesium.Math.toRadians(-45),
        0 // 0 lets Cesium automatically compute the perfect distance to frame the sphere
      ),
    });

    return () => {
      if (!viewer.isDestroyed()) {
        viewer.entities.remove(entity);
      }
    };
  }, [viewer, track, activeRouteId]);
}
