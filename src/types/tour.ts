export interface TourStop {
  id: string;
  title: string;
  narrative: string;
  /** Optional extra vertical offset for the tour callout badge, in screen pixels */
  calloutOffset?: number;
  /** Optional orbit / focus target when this stop is not tied to a POI */
  target?: {
    longitude: number;
    latitude: number;
    height?: number;
  };
  camera: {
    longitude: number;
    latitude: number;
    height: number;
    heading: number;
    pitch: number;
  };
  /** Seconds to dwell at this stop (default 8) */
  dwellTime?: number;
  /** Orbit configuration during dwell */
  orbit?: {
    /** Degrees per second (default 2) */
    speed?: number;
    /** Orbit radius in metres — overrides camera height */
    range?: number;
  };
  /** Links to an existing POI for "Learn more" inline expansion */
  poiId?: string;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  estimatedMinutes: number;
  stops: TourStop[];
}
