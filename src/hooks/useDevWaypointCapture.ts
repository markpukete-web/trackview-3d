import { useEffect, useState } from 'react';
import * as Cesium from 'cesium';

export function useDevWaypointCapture(viewer: Cesium.Viewer | null) {
  const [isActive, setIsActive] = useState(false);
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);

  // Handle click to capture waypoint
  useEffect(() => {
    if (!import.meta.env.DEV || !viewer || !isActive) return;

    console.log('💡 Waypoint Capture Mode ACTIVE. Click on the 3D map to add points.');
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      // For 3D tiles, pickPosition is the most accurate
      const cartesian = viewer.scene.pickPosition(movement.position);

      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const lon = Cesium.Math.toDegrees(cartographic.longitude);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        
        // Round to 6 decimal places (approx 10cm accuracy)
        const point: [number, number] = [
          Number(lon.toFixed(6)),
          Number(lat.toFixed(6))
        ];

        setWaypoints((prev) => {
          const next = [...prev, point];
          console.log(`📍 Point ${next.length}: [${point[0]}, ${point[1]}]`);
          return next;
        });
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
    };
  }, [isActive, viewer]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle capture mode: Shift + W
      if (e.key === 'W' && e.shiftKey) {
        setIsActive((prev) => {
          const next = !prev;
          if (!next) {
            console.log('🛑 Waypoint Capture Mode OFF');
          }
          return next;
        });
        return; // prevent other actions
      }

      if (!isActive) return;

      // Undo: z
      if (e.key === 'z') {
        setWaypoints((prev) => {
          if (prev.length === 0) return prev;
          const next = prev.slice(0, -1);
          console.log(`↩️ Undo point. Remaining: ${next.length}`);
          return next;
        });
      }

      // Copy to console & clipboard: ENTER or c
      if (e.key === 'Enter' || e.key === 'c') {
        if (waypoints.length === 0) {
          console.log('⚠️ No waypoints to copy.');
          return;
        }

        const formatted = JSON.stringify(waypoints)
          .replace(/\],/g, '],\n  ')
          .replace('[[', '[\n  [')
          .replace(']]', ']\n]');
          
        console.log('--- 🗺️ ROUTE DATA ---');
        console.log(formatted);
        console.log('----------------------');

        // Attempt clipboard copy
        try {
          navigator.clipboard.writeText(formatted);
          console.log('📋 Array copied to clipboard!');
        } catch (err) {
          console.error('Failed to copy to clipboard', err);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, waypoints]);

  return { isActive, waypoints };
}
