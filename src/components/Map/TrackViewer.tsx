import { useEffect, useRef, useCallback } from 'react';
import {
  Viewer,
  Cartesian2,
  Cartesian3,
  Cartographic,
  Math as CesiumMath,
  Cesium3DTileset,
  createGooglePhotorealistic3DTileset,
  Ellipsoid,
  HeadingPitchRange,
  NearFarScalar,
  VerticalOrigin,
  HeightReference,
  Color,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { TrackConfig, PointOfInterest, POICategory } from '../../types/track';
import { CATEGORY_CONFIG } from '../UI/CategoryFilter';
import { CATEGORY_ICONS } from '../../utils/icons';


interface TrackViewerProps {
  track: TrackConfig;
  activeCategories: Set<POICategory>;
  selectedPOI: PointOfInterest | null;
  onLoadingChange?: (loading: boolean) => void;
  onError?: (message: string) => void;
  onPOIClick?: (poi: PointOfInterest) => void;
}

export default function TrackViewer({
  track,
  activeCategories,
  selectedPOI,
  onLoadingChange,
  onError,
  onPOIClick,
}: TrackViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const handlerRef = useRef<ScreenSpaceEventHandler | null>(null);
  // Track hovered entity ID to avoid redundant state updates
  const hoveredEntityRef = useRef<string | null>(null);

  // Store latest callbacks in refs to avoid re-running the effect
  const onPOIClickRef = useRef(onPOIClick);
  onPOIClickRef.current = onPOIClick;
  const onLoadingChangeRef = useRef(onLoadingChange);
  onLoadingChangeRef.current = onLoadingChange;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!containerRef.current) return;

    onLoadingChangeRef.current?.(true);

    const viewer = new Viewer(containerRef.current, {
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
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
      loadTileset(viewer, apiKey, onLoadingChangeRef, onErrorRef);
    } else {
      onLoadingChangeRef.current?.(false);
      onErrorRef.current?.('Google Maps API key is missing. Add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
    }

    // Set initial camera position
    viewer.camera.setView({
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
    });

    // Enforce camera bounds with smooth easing
    const trackCenter = Cartesian3.fromDegrees(
      track.coordinates.longitude,
      track.coordinates.latitude,
    );
    const boundsListener = enforceCameraBounds(viewer, trackCenter, track.bounds);

    // Add POI markers
    addPOIMarkers(viewer, track.pois);

    // Set up click handler for POI entities
    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handlerRef.current = handler;

    handler.setInputAction((click: { position: Cartesian2 }) => {
      // Debug: log clicked ground coordinates
      if (import.meta.env.DEV) {
        const cartesian = viewer.scene.pickPosition(click.position);
        if (cartesian) {
          const carto = Cartographic.fromCartesian(cartesian, Ellipsoid.WGS84);
          const lng = (carto.longitude * 180 / Math.PI).toFixed(4);
          const lat = (carto.latitude * 180 / Math.PI).toFixed(4);
          console.log(`📍 Clicked: { longitude: ${lng}, latitude: ${lat} }`);
        }
      }

      const picked = viewer.scene.pick(click.position);
      if (defined(picked) && picked.id && picked.id._poiData) {
        const poi = picked.id._poiData as PointOfInterest;
        onPOIClickRef.current?.(poi);
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    // Set up hover handler for POI entities
    handler.setInputAction((movement: { endPosition: Cartesian2 }) => {
      const picked = viewer.scene.pick(movement.endPosition);
      const isPoiHover = defined(picked) && picked.id && picked.id._poiData ? (picked.id.id as string) : null;

      if (isPoiHover !== hoveredEntityRef.current) {
        // Reset old entity
        if (hoveredEntityRef.current) {
          const oldEntity = viewer.entities.getById(hoveredEntityRef.current);
          if (oldEntity && oldEntity.billboard) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            oldEntity.billboard.scale = 1.0 as any;
          }
          document.body.style.cursor = 'default';
        }
        
        // Update new entity
        hoveredEntityRef.current = isPoiHover;
        if (isPoiHover) {
          const newEntity = viewer.entities.getById(isPoiHover);
          if (newEntity && newEntity.billboard) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            newEntity.billboard.scale = 1.25 as any;
          }
          document.body.style.cursor = 'pointer';
        }
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      handler.destroy();
      handlerRef.current = null;
      hoveredEntityRef.current = null;
      document.body.style.cursor = 'default';
      viewer.scene.postUpdate.removeEventListener(boundsListener);
      if (!viewer.isDestroyed()) {
        viewer.destroy();
      }
      viewerRef.current = null;
    };
  }, [track]);

  // Fly camera to selected POI (triggered by list click or map click)
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed() || !selectedPOI) return;

    // Find the entity matching this POI
    const entity = viewer.entities.values.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e) => (e as any)._poiData?.id === selectedPOI.id,
    );
    if (!entity) return;

    flyToPOI(viewer, entity, track);
  }, [selectedPOI, track]);

  // Update entity visibility when active categories change
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    for (const entity of viewer.entities.values) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const poiData = (entity as any)._poiData as PointOfInterest | undefined;
      if (poiData) {
        entity.show = activeCategories.has(poiData.category);
      }
    }
    viewer.scene.requestRender();
  }, [activeCategories]);

  const resetView = useCallback(() => {
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
      className="absolute bottom-6 right-6 md:right-[390px] bg-white/80 backdrop-blur-md rounded-full shadow-lg p-3 hover:bg-white hover:shadow-xl transition-all duration-200 cursor-pointer"
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
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" />
      </svg>
    </button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function flyToPOI(viewer: Viewer, entity: any, track: TrackConfig) {
  viewer.flyTo(entity, {
    offset: new HeadingPitchRange(
      CesiumMath.toRadians(track.camera.heading),
      CesiumMath.toRadians(-45),
      200,
    ),
    duration: 1.0,
  });
}

function createMarkerIcon(cssColour: string, category: POICategory): string {
  const iconPaths = CATEGORY_ICONS[category] || CATEGORY_ICONS.operations;
  
  // Create a nice map pin SVG container with drop-shadow parameters and the specific icon inside
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
    <path d="M20 2C9 2 1 10 1 21c0 14 17.653 25 18 25.5l1 1 1-1C21.347 46 39 35 39 21 39 10 31 2 20 2z" fill="${cssColour}" stroke="#ffffff" stroke-width="2"/>
    <circle cx="20" cy="18" r="11" fill="#ffffff"/>
    <g transform="translate(10, 8) scale(0.833)" color="${cssColour}">
      ${iconPaths}
    </g>
  </svg>`;
  
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function addPOIMarkers(viewer: Viewer, pois: PointOfInterest[]) {
  for (const poi of pois) {
    const config = CATEGORY_CONFIG[poi.category];
    const markerIcon = createMarkerIcon(config.colour, poi.category);

    const entity = viewer.entities.add({
      id: `poi-${poi.id}`,
      name: poi.name,
      position: Cartesian3.fromDegrees(
        poi.position.longitude,
        poi.position.latitude,
        poi.position.height ?? 0,
      ),
      billboard: {
        image: markerIcon,
        verticalOrigin: VerticalOrigin.BOTTOM,
        heightReference: HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scale: 1.0,
        scaleByDistance: new NearFarScalar(200, 1.0, 2000, 0.5),
      },
      label: {
        text: poi.name,
        font: '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fillColor: Color.WHITE,
        style: 2, // FILL_AND_OUTLINE
        outlineColor: Color.fromCssColorString('rgba(0, 0, 0, 0.8)'),
        outlineWidth: 2,
        showBackground: true,
        backgroundColor: Color.fromCssColorString('rgba(0, 0, 0, 0.7)'),
        backgroundPadding: new Cartesian2(8, 5),
        verticalOrigin: VerticalOrigin.BOTTOM,
        pixelOffset: new Cartesian2(0, -60),
        heightReference: HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scaleByDistance: new NearFarScalar(200, 1.0, 2000, 0.5),
      },
      description: `${config.label}: ${poi.description}`,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (entity as any)._poiData = poi;
  }
}

function configureCameraControls(viewer: Viewer) {
  const controller = viewer.scene.screenSpaceCameraController;

  controller.minimumZoomDistance = 50;
  controller.maximumZoomDistance = 2000;

  controller.inertiaSpin = 0.9;
  controller.inertiaTranslate = 0.9;
  controller.inertiaZoom = 0.8;

  controller.minimumCollisionTerrainHeight = 100;

  controller.enableTilt = true;
  controller.enableZoom = true;
  controller.enableRotate = true;
  controller.enableTranslate = true;
}

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

    if (camCarto.height > bounds.maxAltitude) {
      targetHeight = bounds.maxAltitude;
      needsCorrection = true;
    } else if (camCarto.height < bounds.minAltitude) {
      targetHeight = bounds.minAltitude;
      needsCorrection = true;
    }

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
  onLoadingChangeRef: React.RefObject<((loading: boolean) => void) | undefined>,
  onErrorRef: React.RefObject<((message: string) => void) | undefined>,
) {
  try {
    let tileset: Cesium3DTileset;
    try {
      tileset = await createGooglePhotorealistic3DTileset({ key: apiKey });
    } catch (innerErr) {
      console.warn('createGooglePhotorealistic3DTileset failed, trying manual URL:', innerErr);
      tileset = await Cesium3DTileset.fromUrl(
        `https://tile.googleapis.com/v1/3dtiles/root.json?key=${apiKey}`,
      );
    }

    if (viewer.isDestroyed()) return;

    tileset.showCreditsOnScreen = true;
    viewer.scene.primitives.add(tileset);

    const removeListener = tileset.tileLoad.addEventListener(() => {
      onLoadingChangeRef.current?.(false);
      removeListener();
    });

    setTimeout(() => onLoadingChangeRef.current?.(false), 10000);
  } catch (err) {
    onLoadingChangeRef.current?.(false);
    const message = err instanceof Error ? err.message : 'Failed to load 3D tiles';
    onErrorRef.current?.(message);
  }
}
