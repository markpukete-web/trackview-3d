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
}
