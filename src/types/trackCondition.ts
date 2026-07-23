export type TrackConditionCategory = 'firm' | 'good' | 'soft' | 'heavy';

export interface TrackConditionInfo {
  rating: string;
  category: TrackConditionCategory;
  description: string;
  rail: string;
  footwearTip: string;
  penetrometer?: number;
  isEstimated: boolean;
  recentRainfallMm: number;
}
