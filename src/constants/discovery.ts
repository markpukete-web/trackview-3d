import { POICategory } from '../types/track';
import { POIIntentId } from '../types/discovery';

export const POI_INTENT_ORDER: POIIntentId[] = ['watch', 'food-drink', 'amenities'];

export const POI_INTENT_CONFIG: Record<
  POIIntentId,
  { label: string; categories: POICategory[] }
> = {
  watch: {
    label: 'Where to watch',
    categories: ['grandstand', 'viewing'],
  },
  'food-drink': {
    label: 'Food & drink',
    categories: ['food-drink'],
  },
  amenities: {
    label: 'Info & amenities',
    // Eagle Farm's operations POI is the public-facing Raceday Office.
    categories: ['amenities', 'operations'],
  },
};
