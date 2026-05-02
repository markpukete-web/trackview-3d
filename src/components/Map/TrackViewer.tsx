import { useEffect, useRef, useCallback, MutableRefObject, useState, CSSProperties } from 'react';
import { Home } from 'lucide-react';
import {
  Viewer,
  Cartesian2,
  Cartesian3,
  Cartographic,
  Math as CesiumMath,
  Cesium3DTileset,
  createGooglePhotorealistic3DTileset,
  EllipsoidGeodesic,
  Ellipsoid,
  HeadingPitchRange,
  NearFarScalar,
  VerticalOrigin,
  HeightReference,
  Color,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  ConstantProperty,
  JulianDate,
  SceneTransforms,
  defined,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { TrackConfig, PointOfInterest, POICategory } from '../../types/track';
import { CATEGORY_CONFIG } from '../UI/CategoryFilter';
import { CATEGORY_ICONS } from '../../utils/icons';
import { useDevWaypointCapture } from '../../hooks/useDevWaypointCapture';
import { useRouteOverlay } from '../../hooks/useRouteOverlay';
import { MOBILE_SHEET_COLLAPSED_HEIGHT } from '../../constants/layout';


interface TrackViewerProps {
  track: TrackConfig;
  activeCategories: Set<POICategory>;
  selectedPOI: PointOfInterest | null;
  onLoadingChange?: (loading: boolean) => void;
  onError?: (message: string) => void;
  onPOIClick?: (poi: PointOfInterest) => void;
  viewerRef?: MutableRefObject<Viewer | null>;
  tourActive?: boolean;
  tourFocusPoiId?: string | null;
  tourHidePoiMarkers?: boolean;
  tourCalloutOffset?: number | null;
  activeRouteId?: string | null;
}

export default function TrackViewer({
  track,
  activeCategories,
  selectedPOI,
  onLoadingChange,
  onError,
  onPOIClick,
  viewerRef: externalViewerRef,
  tourActive,
  tourFocusPoiId,
  tourHidePoiMarkers,
  tourCalloutOffset,
  activeRouteId,
}: TrackViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [viewerInstance, setViewerInstance] = useState<Viewer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompactViewport, setIsCompactViewport] = useState(isMobileMapViewport);
  useDevWaypointCapture(viewerInstance);
  useRouteOverlay(viewerInstance, track, activeRouteId ?? null);
  const tourCalloutRef = useRef<HTMLDivElement>(null);
  const selectedPoiCalloutRef = useRef<HTMLDivElement>(null);
  // Track hovered entity ID to avoid redundant state updates
  const hoveredEntityRef = useRef<string | null>(null);

  const tourActiveRef = useRef(tourActive ?? false);
  tourActiveRef.current = tourActive ?? false;
  const activeCategoriesRef = useRef(activeCategories);
  activeCategoriesRef.current = activeCategories;
  const tourFocusPoiIdRef = useRef(tourFocusPoiId ?? null);
  tourFocusPoiIdRef.current = tourFocusPoiId ?? null;
  const tourHidePoiMarkersRef = useRef(tourHidePoiMarkers ?? false);
  tourHidePoiMarkersRef.current = tourHidePoiMarkers ?? false;
  const selectedPoiIdRef = useRef(selectedPOI?.id ?? null);
  selectedPoiIdRef.current = selectedPOI?.id ?? null;
  const isCompactViewportRef = useRef(isCompactViewport);
  isCompactViewportRef.current = isCompactViewport;

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
      requestRenderMode: true,
      maximumRenderTimeChange: Number.POSITIVE_INFINITY,
    });

    viewerRef.current = viewer;
    setViewerInstance(viewer);
    if (externalViewerRef) externalViewerRef.current = viewer;
    if (import.meta.env.DEV) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__cesiumViewer = viewer;
    }
    const viewerContainer = viewer.container as HTMLElement;
    viewer.scene.globe.show = false;

    // Configure camera controls for smooth interaction
    configureCameraControls(viewer);

    const initialCamera = getDefaultCamera(track);

    // Set initial camera position
    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(
        initialCamera.longitude,
        initialCamera.latitude,
        initialCamera.height,
      ),
      orientation: {
        heading: CesiumMath.toRadians(initialCamera.heading),
        pitch: CesiumMath.toRadians(initialCamera.pitch),
        roll: 0,
      },
    });
    viewer.scene.requestRender();

    // Enforce camera bounds after camera interactions end
    const trackCenter = Cartesian3.fromDegrees(
      track.coordinates.longitude,
      track.coordinates.latitude,
    );
    const removeBoundsListener = enforceCameraBounds(viewer, trackCenter, track.bounds);

    // Add POI markers
    addPOIMarkers(viewer, track.pois);
    applyPoiPresentation(
      viewer,
      activeCategoriesRef.current,
      tourActiveRef.current,
      tourFocusPoiIdRef.current,
      tourHidePoiMarkersRef.current,
      selectedPoiIdRef.current,
      hoveredEntityRef.current,
      isCompactViewportRef.current,
    );
    viewer.scene.requestRender();

    let disposed = false;
    let removeTilesetLoadListener: (() => void) | undefined;
    let loadingTimeoutId: number | undefined;
    let dismissScheduled = false;
    const loadStartedAt = performance.now();

    // Load Google Photorealistic 3D Tiles
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      void (async () => {
        let createdTileset: Cesium3DTileset | undefined;

        try {
          try {
            createdTileset = await createGooglePhotorealistic3DTileset({ key: apiKey });
          } catch (innerErr) {
            console.warn('createGooglePhotorealistic3DTileset failed, trying manual URL:', innerErr);
            createdTileset = await Cesium3DTileset.fromUrl(
              `https://tile.googleapis.com/v1/3dtiles/root.json?key=${apiKey}`,
            );
          }

          if (disposed || viewer.isDestroyed()) {
            createdTileset.destroy();
            return;
          }

          createdTileset.showCreditsOnScreen = true;
          viewer.scene.primitives.add(createdTileset);
          viewer.scene.requestRender();

          removeTilesetLoadListener = createdTileset.initialTilesLoaded.addEventListener(() => {
            if (disposed || viewer.isDestroyed() || dismissScheduled) return;
            dismissScheduled = true;
            if (loadingTimeoutId !== undefined) {
              window.clearTimeout(loadingTimeoutId);
              loadingTimeoutId = undefined;
            }
            const elapsed = performance.now() - loadStartedAt;
            const waitMs = Math.max(0, LOADER_FLOOR_MS - elapsed) + LOADER_DWELL_MS;
            loadingTimeoutId = window.setTimeout(() => {
              if (disposed || viewer.isDestroyed()) return;
              setIsLoading(false);
              onLoadingChangeRef.current?.(false);
              viewer.scene.requestRender();
            }, waitMs);
          });

          loadingTimeoutId = window.setTimeout(() => {
            if (disposed || viewer.isDestroyed()) return;
            setIsLoading(false);
            onLoadingChangeRef.current?.(false);
            viewer.scene.requestRender();
          }, 10000);
        } catch (err) {
          if (disposed) return;
          setIsLoading(false);
          onLoadingChangeRef.current?.(false);
          const message = err instanceof Error ? err.message : 'Failed to load 3D tiles';
          onErrorRef.current?.(message);
        }
      })();
    } else {
      setIsLoading(false);
      onLoadingChangeRef.current?.(false);
      onErrorRef.current?.('Google Maps API key is missing. Add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
    }

    // Set up click handler for POI entities
    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

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
        hoveredEntityRef.current = isPoiHover;
        viewerContainer.style.cursor = isPoiHover ? 'pointer' : 'default';
        applyPoiPresentation(
          viewer,
          activeCategoriesRef.current,
          tourActiveRef.current,
          tourFocusPoiIdRef.current,
          tourHidePoiMarkersRef.current,
          selectedPoiIdRef.current,
          hoveredEntityRef.current,
          isCompactViewportRef.current,
        );
        viewer.scene.requestRender();
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      disposed = true;
      handler.destroy();
      hoveredEntityRef.current = null;
      viewerContainer.style.cursor = 'default';
      removeBoundsListener();
      removeTilesetLoadListener?.();
      if (loadingTimeoutId !== undefined) {
        window.clearTimeout(loadingTimeoutId);
      }
      if (!viewer.isDestroyed()) {
        viewer.destroy();
      }
      viewerRef.current = null;
      setViewerInstance(null);
      if (externalViewerRef) externalViewerRef.current = null;
    };
  }, [track, externalViewerRef]);

  useEffect(() => {
    const onViewportChange = () => {
      setIsCompactViewport(isMobileMapViewport());
    };

    onViewportChange();
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('orientationchange', onViewportChange);

    return () => {
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('orientationchange', onViewportChange);
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    const callout = tourCalloutRef.current;
    if (!viewer || viewer.isDestroyed() || !callout || !tourActive || !tourFocusPoiId) {
      if (callout) {
        callout.style.opacity = '0';
      }
      return;
    }

    const entity = viewer.entities.getById(`poi-${tourFocusPoiId}`);
    if (!entity?.position) {
      callout.style.opacity = '0';
      return;
    }

    const updateCallout = () => {
      if (!callout || viewer.isDestroyed()) return;
      const position = entity.position?.getValue(JulianDate.now());
      if (!position) {
        callout.style.opacity = '0';
        return;
      }

      const screenPosition = SceneTransforms.worldToWindowCoordinates(
        viewer.scene,
        position,
      );

      if (!screenPosition) {
        callout.style.opacity = '0';
        return;
      }

      callout.textContent = entity.name ?? '';
      callout.style.opacity = '1';
      const calloutOffsetY = tourCalloutOffset ?? TOUR_CALLOUT_OFFSET;
      callout.style.transform = `translate(${screenPosition.x}px, ${screenPosition.y - calloutOffsetY}px) translate(-50%, -100%)`;
    };

    viewer.scene.postRender.addEventListener(updateCallout);
    updateCallout();
    viewer.scene.requestRender();

    return () => {
      if (!viewer.isDestroyed()) {
        viewer.scene.postRender.removeEventListener(updateCallout);
      }
      if (callout) {
        callout.style.opacity = '0';
      }
    };
  }, [tourActive, tourFocusPoiId, tourCalloutOffset]);

  useEffect(() => {
    const viewer = viewerRef.current;
    const callout = selectedPoiCalloutRef.current;
    if (
      !viewer ||
      viewer.isDestroyed() ||
      !callout ||
      !isCompactViewport ||
      tourActive ||
      !selectedPOI
    ) {
      if (callout) {
        callout.style.opacity = '0';
      }
      return;
    }

    const entity = viewer.entities.getById(`poi-${selectedPOI.id}`);
    if (!entity?.position) {
      callout.style.opacity = '0';
      return;
    }

    const updateCallout = () => {
      if (!callout || viewer.isDestroyed()) return;
      const position = entity.position?.getValue(JulianDate.now());
      if (!position) {
        callout.style.opacity = '0';
        return;
      }

      const screenPosition = SceneTransforms.worldToWindowCoordinates(viewer.scene, position);
      if (!screenPosition) {
        callout.style.opacity = '0';
        return;
      }

      callout.textContent = selectedPOI.name;
      const calloutWidth = callout.offsetWidth || 0;
      const safePadding = 12;
      const minX = calloutWidth / 2 + safePadding;
      const maxX = viewer.canvas.clientWidth - calloutWidth / 2 - safePadding;
      const x = Math.max(minX, Math.min(maxX, screenPosition.x));
      const y = Math.max(68, screenPosition.y - SELECTED_POI_CALLOUT_OFFSET);

      callout.style.opacity = '1';
      callout.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
    };

    viewer.scene.postRender.addEventListener(updateCallout);
    updateCallout();
    viewer.scene.requestRender();

    return () => {
      if (!viewer.isDestroyed()) {
        viewer.scene.postRender.removeEventListener(updateCallout);
      }
      if (callout) {
        callout.style.opacity = '0';
      }
    };
  }, [isCompactViewport, selectedPOI, tourActive]);

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

    applyPoiPresentation(
      viewer,
      activeCategories,
      tourActive ?? false,
      tourFocusPoiId ?? null,
      tourHidePoiMarkers ?? false,
      selectedPOI?.id ?? null,
      hoveredEntityRef.current,
      isCompactViewport,
    );
    viewer.scene.requestRender();
  }, [activeCategories, tourActive, tourFocusPoiId, tourHidePoiMarkers, selectedPOI?.id, isCompactViewport]);

  const resetView = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    const camera = getDefaultCamera(track, isCompactViewport);
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(
        camera.longitude,
        camera.latitude,
        camera.height,
      ),
      orientation: {
        heading: CesiumMath.toRadians(camera.heading),
        pitch: CesiumMath.toRadians(camera.pitch),
        roll: 0,
      },
      duration: 1.5,
    });
  }, [track, isCompactViewport]);

  return (
    <div className="relative w-full h-full bg-stone-900">
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-[1500ms] ${
          isLoading ? 'z-50 opacity-100 bg-stone-900/40 backdrop-blur-md' : 'z-0 opacity-0 bg-transparent backdrop-blur-0'
        }`}
      >
        {track.placeholderImage && (
          <img
            src={track.placeholderImage}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              isLoading ? 'opacity-40 blur-md scale-[1.02]' : 'opacity-0'
            }`}
          />
        )}
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight drop-shadow-lg">
            {track.shortName ?? track.name}
          </h2>
          <p className="text-lg sm:text-xl text-stone-200 mt-4 drop-shadow">
            See the venue before you get there.
          </p>
        </div>
      </div>
      <div
        ref={tourCalloutRef}
        className="pointer-events-none absolute left-0 top-0 z-10 rounded-full bg-blue-600/95 px-3 py-1.5 text-sm font-semibold text-white shadow-lg ring-2 ring-white/80 whitespace-nowrap opacity-0 transition-opacity duration-150"
      />
      <div
        ref={selectedPoiCalloutRef}
        className="pointer-events-none absolute left-0 top-0 z-10 max-w-[min(72vw,18rem)] rounded-lg bg-stone-950/90 px-3 py-2 text-center text-xs font-semibold leading-tight text-white shadow-lg ring-1 ring-white/70 opacity-0 transition-opacity duration-150"
      />
      <ResetViewButton onClick={resetView} />
    </div>
  );
}

function ResetViewButton({ onClick }: { onClick: () => void }) {
  const style = {
    '--mobile-sheet-collapsed-height': MOBILE_SHEET_COLLAPSED_HEIGHT,
  } as CSSProperties;

  return (
    <button
      type="button"
      onClick={onClick}
      title="Reset view"
      aria-label="Reset map view"
      style={style}
      className="absolute bottom-[calc(var(--mobile-sheet-collapsed-height)+1rem)] right-4 md:bottom-6 md:right-[390px] bg-white/80 backdrop-blur-md rounded-full shadow-lg p-3 hover:bg-white hover:shadow-xl transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
    >
      <Home className="w-5 h-5 text-stone-700" />
    </button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function flyToPOI(viewer: Viewer, entity: any, track: TrackConfig) {
  const compact = isMobileMapViewport();
  viewer.camera.cancelFlight();
  viewer.flyTo(entity, {
    offset: new HeadingPitchRange(
      CesiumMath.toRadians(track.camera.heading),
      CesiumMath.toRadians(compact ? -55 : -45),
      compact ? 150 : 200,
    ),
    duration: 1.0,
  });
}

function isMobileMapViewport() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 767px), (orientation: portrait)').matches;
}

function getDefaultCamera(track: TrackConfig, compact = isMobileMapViewport()) {
  return compact && track.mobileCamera ? track.mobileCamera : track.camera;
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

const DEFAULT_LABEL_FONT = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const DEFAULT_LABEL_BG = Color.fromCssColorString('rgba(0, 0, 0, 0.7)');
const DEFAULT_LABEL_OFFSET = new Cartesian2(0, -60);
const DEFAULT_MARKER_COLOUR = Color.WHITE;
const DIMMED_MARKER_COLOUR = Color.fromCssColorString('rgba(255, 255, 255, 0.38)');
const DEFAULT_MARKER_SCALE = 1.0;
const TOUR_FOCUS_MARKER_SCALE = 1.45;
const TOUR_CALLOUT_OFFSET = 126;
const SELECTED_POI_CALLOUT_OFFSET = 96;
const LOADER_FLOOR_MS = 1000;
const LOADER_DWELL_MS = 600;

function applyPoiPresentation(
  viewer: Viewer,
  activeCategories: Set<POICategory>,
  tourActive: boolean,
  tourFocusPoiId: string | null,
  tourHidePoiMarkers: boolean,
  selectedPoiId: string | null,
  hoveredEntityId: string | null,
  compactViewport: boolean,
) {
  const hasTourFocus = tourActive && !!tourFocusPoiId;
  // Selection focus only applies outside a tour — tour focus takes priority.
  const hasSelectionFocus = !hasTourFocus && !!selectedPoiId;
  const hasFocus = hasTourFocus || hasSelectionFocus;
  const focusPoiId = hasTourFocus ? tourFocusPoiId : selectedPoiId;

  for (const entity of viewer.entities.values) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const poiData = (entity as any)._poiData as PointOfInterest | undefined;
    if (!poiData) continue;

    const isFocused = hasFocus && poiData.id === focusPoiId;
    const isHiddenForTourStop = tourActive && tourHidePoiMarkers && !isFocused;
    const isVisible = activeCategories.has(poiData.category) && !isHiddenForTourStop;
    const isHovered = hoveredEntityId === entity.id;
    const baseScale = isFocused ? TOUR_FOCUS_MARKER_SCALE : DEFAULT_MARKER_SCALE;
    const hoverScaleBoost = isHovered ? 0.15 : 0;

    entity.show = isVisible;

    if (entity.billboard) {
      entity.billboard.scale = new ConstantProperty(baseScale + hoverScaleBoost);
      entity.billboard.color = new ConstantProperty(
        hasFocus && !isFocused ? DIMMED_MARKER_COLOUR : DEFAULT_MARKER_COLOUR,
      );
    }

    if (entity.label) {
      // Tour focus hides all labels (uses an HTML callout for the active stop).
      // Selection focus keeps the selected POI's label visible, hides the rest.
      // Compact screens use an HTML callout instead; Cesium labels are too unstable on mobile Safari.
      const labelVisible =
        isVisible &&
        !compactViewport &&
        (!hasFocus || (hasSelectionFocus && isFocused));
      entity.label.show = new ConstantProperty(labelVisible);
      entity.label.font = new ConstantProperty(DEFAULT_LABEL_FONT);
      entity.label.backgroundColor = new ConstantProperty(DEFAULT_LABEL_BG);
      entity.label.pixelOffset = new ConstantProperty(DEFAULT_LABEL_OFFSET);
      entity.label.scale = new ConstantProperty(1.0);
    }
  }
}

function configureCameraControls(viewer: Viewer) {
  const controller = viewer.scene.screenSpaceCameraController;

  controller.minimumZoomDistance = 50;
  controller.maximumZoomDistance = 1000;

  controller.inertiaSpin = 0.9;
  controller.inertiaTranslate = 0.9;
  controller.inertiaZoom = 0.8;

  controller.minimumCollisionTerrainHeight = 100;

  controller.enableTilt = true;
  controller.enableZoom = true;
  controller.enableRotate = true;
  controller.enableTranslate = true;
}

const CAMERA_POSITION_EPSILON = 0.5;
const HEIGHT_EPSILON = 0.5;

function enforceCameraBounds(
  viewer: Viewer,
  center: Cartesian3,
  bounds: TrackConfig['bounds'],
) {
  const centerCartographic = Cartographic.fromCartesian(center, Ellipsoid.WGS84);

  const listener = () => {
    const camera = viewer.camera;
    const nextPosition = clampCameraPosition(
      camera.positionCartographic,
      centerCartographic,
      bounds,
    );
    if (!nextPosition) return;

    camera.cancelFlight();
    camera.flyTo({
      destination: Cartesian3.fromRadians(
        nextPosition.longitude,
        nextPosition.latitude,
        nextPosition.height,
      ),
      orientation: {
        heading: camera.heading,
        pitch: camera.pitch,
        roll: camera.roll,
      },
      duration: 0.25,
    });
  };

  viewer.camera.percentageChanged = 0.01;
  viewer.camera.moveEnd.addEventListener(listener);

  return () => {
    viewer.camera.moveEnd.removeEventListener(listener);
  };
}

function clampCameraPosition(
  currentPosition: Cartographic,
  centerPosition: Cartographic,
  bounds: TrackConfig['bounds'],
): Cartographic | null {
  const nextPosition = Cartographic.clone(currentPosition);
  let needsCorrection = false;

  if (nextPosition.height > bounds.maxAltitude) {
    nextPosition.height = bounds.maxAltitude;
    needsCorrection = true;
  } else if (nextPosition.height < bounds.minAltitude) {
    nextPosition.height = bounds.minAltitude;
    needsCorrection = true;
  }

  if (bounds.maxLatitude != null) {
    const limit = CesiumMath.toRadians(bounds.maxLatitude);
    if (nextPosition.latitude > limit) {
      nextPosition.latitude = limit;
      needsCorrection = true;
    }
  }

  if (bounds.minLatitude != null) {
    const limit = CesiumMath.toRadians(bounds.minLatitude);
    if (nextPosition.latitude < limit) {
      nextPosition.latitude = limit;
      needsCorrection = true;
    }
  }

  if (bounds.maxLongitude != null) {
    const limit = CesiumMath.toRadians(bounds.maxLongitude);
    if (nextPosition.longitude > limit) {
      nextPosition.longitude = limit;
      needsCorrection = true;
    }
  }

  if (bounds.minLongitude != null) {
    const limit = CesiumMath.toRadians(bounds.minLongitude);
    if (nextPosition.longitude < limit) {
      nextPosition.longitude = limit;
      needsCorrection = true;
    }
  }

  const geodesic = new EllipsoidGeodesic(centerPosition, nextPosition);
  if (geodesic.surfaceDistance > bounds.maxDistance) {
    const clampedSurfacePoint = geodesic.interpolateUsingSurfaceDistance(bounds.maxDistance);
    nextPosition.longitude = clampedSurfacePoint.longitude;
    nextPosition.latitude = clampedSurfacePoint.latitude;
    needsCorrection = true;
  }

  if (!needsCorrection) {
    return null;
  }

  const nextCartesian = Cartesian3.fromRadians(
    nextPosition.longitude,
    nextPosition.latitude,
    nextPosition.height,
  );
  const currentCartesian = Cartesian3.fromRadians(
    currentPosition.longitude,
    currentPosition.latitude,
    currentPosition.height,
  );

  if (
    Cartesian3.distance(nextCartesian, currentCartesian) < CAMERA_POSITION_EPSILON &&
    Math.abs(nextPosition.height - currentPosition.height) < HEIGHT_EPSILON
  ) {
    return null;
  }

  return nextPosition;
}
