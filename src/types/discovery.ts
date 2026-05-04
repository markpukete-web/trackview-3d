export type POIIntentId = 'watch' | 'food-drink' | 'amenities';

export type ActiveFilter =
  | { kind: 'none' }
  | { kind: 'intent'; id: POIIntentId }
  | { kind: 'search'; query: string };

export type DrawerState = 'closed' | 'resting' | 'results' | 'expanded';
