import type { TrackId } from '../data/tracks/ids';

export type POICategory =
  | 'grandstand'
  | 'food-drink'
  | 'amenities'
  | 'viewing'
  | 'transport'
  | 'entertainment'
  | 'operations';

export interface PointOfInterest {
  id: string;
  name: string;
  category: POICategory;
  description: string;
  position: {
    longitude: number;
    latitude: number;
    height?: number;
  };
  tips?: string[];
  accessibility?: string;
  imageUrl?: string;
  /**
   * Manual pixel offset for the label, in screen-space (x, y).
   * When set, this overrides the dynamic offset that scales with the marker
   * on hover/selection — useful to disambiguate two markers that share an
   * almost-identical position, but expect the label to stay put rather than
   * track the growing marker.
   */
  labelOffset?: { x: number; y: number };
}

// --- Transport ---

export type TransportMode = 'train' | 'bus' | 'ferry' | 'car' | 'rideshare';

export interface TransportOption {
  mode: TransportMode;
  name: string;
  description: string;
  tips?: string[];
  warning?: string;
  /** Reference to a POI id if this has a map marker (e.g. car park POI) */
  poiId?: string;
}

export interface TrackTransport {
  /** All transport options — UI groups these by mode */
  options: TransportOption[];
  /** General notes shown at the bottom of the Getting Here tab */
  notes?: string;
}

// --- Accessibility ---

export interface TrackAccessibility {
  summary: string;
  /** Quick-scan feature flags — UI renders as icon badges */
  features: {
    wheelchairAccess: boolean;
    companionCard: boolean;
    hearingLoop: boolean;
    assistanceDogs: boolean;
  };
  /** Each string is one line item in the UI */
  mobilityDetails: string[];
  assistanceDetails?: string[];
  notes?: string;
}

// --- Walking Routes ---

export interface WalkingRoute {
  id: string;
  name: string;
  description?: string;
  estimatedMinutes: number;
  accessibleAlternative?: string;
  waypoints: [number, number][];
  fromPOI?: string;
  toPOI?: string;
}

// --- Plan Your Visit (evergreen race-day guidance) ---

export interface DressCodeArea {
  area: string;
  standard: string;
  notes?: string;
}

export interface RaceDayDressCode {
  /** One-line overview of the general expectation. */
  summary: string;
  /** Standards per area / enclosure. */
  areas: DressCodeArea[];
  /** Optional general tips (e.g. "a hat and sunscreen in summer"). */
  tips?: string[];
}

export interface ArrivalGate {
  name: string;
  detail: string;
  /** Optional link to a gate POI in the same track, for "Show on map". */
  poiId?: string;
}

export interface RaceDayArrival {
  /** One-line overview of arriving on a race day. */
  summary: string;
  /** Entry points. A gate may link to a gate POI for "Show on map". */
  gates: ArrivalGate[];
  /** When to arrive, queues, entry flow. */
  tips?: string[];
}

export interface TicketType {
  name: string;
  detail: string;
}

export interface RaceDayEntry {
  /** Ticket / enclosure types, if worth explaining. */
  ticketTypes?: TicketType[];
  /** Bring / don't-bring line items (bag policy, prohibited items, what to pack). */
  items: string[];
  /** Cash vs card / ATMs. */
  payment?: string;
  notes?: string;
}

export interface TrackRaceDayInfo {
  /** Short intro shown at the top of the Plan Your Visit tab. */
  intro?: string;
  dressCode?: RaceDayDressCode;
  arrival?: RaceDayArrival;
  entry?: RaceDayEntry;
}

// --- Track Config ---

export interface TrackConfig {
  id: TrackId;
  name: string;
  shortName?: string;
  location: string;
  operator: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  timezone: string;
  camera: {
    longitude: number;
    latitude: number;
    height: number;
    heading: number;
    pitch: number;
  };
  mobileCamera?: {
    longitude: number;
    latitude: number;
    height: number;
    heading: number;
    pitch: number;
  };
  bounds: {
    maxAltitude: number;
    minAltitude: number;
    maxDistance: number;
    maxLatitude?: number;
    minLatitude?: number;
    maxLongitude?: number;
    minLongitude?: number;
  };
  pois: PointOfInterest[];
  nearbyTracks?: TrackId[];
  brandColour?: string;
  placeholderImage?: string;
  /** Short one-line description shown on the landing screen card. */
  tagline?: string;
  transport?: TrackTransport;
  accessibility?: TrackAccessibility;
  tours?: import('./tour').Tour[];
  routes?: WalkingRoute[];
  raceDay?: TrackRaceDayInfo;
  trackCondition?: {
    rating?: string;
    rail?: string;
  };
}
