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

// --- Track Config ---

export interface TrackConfig {
  id: string;
  name: string;
  location: string;
  operator: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  camera: {
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
  };
  pois: PointOfInterest[];
  nearbyTracks?: string[];
  transport?: TrackTransport;
  accessibility?: TrackAccessibility;
}
