import type { TrackConditionInfo, TrackConditionCategory } from '../types/trackCondition';

function getConditionDescription(category: TrackConditionCategory): string {
  switch (category) {
    case 'firm':
      return 'Dry, hard track surface with minimal give.';
    case 'good':
      return 'Ideal track condition with good give — excellent for race day.';
    case 'soft':
      return 'Moist track surface with noticeable give underfoot.';
    case 'heavy':
      return 'Rain-affected, wet track surface with significant give.';
  }
}

function getFootwearTip(category: TrackConditionCategory): string {
  switch (category) {
    case 'firm':
      return 'Lawns and spectator precincts are firm and dry — any footwear is suitable.';
    case 'good':
      return 'Ideal conditions for outdoor viewing — neat casual or formal shoes are fine.';
    case 'soft':
      return 'Grass lawns have give. Block heels, wedges, or smart boots recommended over thin stilettos.';
    case 'heavy':
      return 'Lawns are damp and rain-affected. Covered or waterproof footwear is recommended.';
  }
}

export function calculateTrackCondition(
  recentRainfallMm: number,
  railOverride?: string,
  overrideRating?: string,
): TrackConditionInfo {
  if (overrideRating) {
    const ratingLower = overrideRating.toLowerCase();
    let category: TrackConditionCategory = 'good';
    if (ratingLower.includes('firm')) category = 'firm';
    else if (ratingLower.includes('soft')) category = 'soft';
    else if (ratingLower.includes('heavy')) category = 'heavy';

    return {
      rating: overrideRating,
      category,
      description: getConditionDescription(category),
      rail: railOverride || 'True position',
      footwearTip: getFootwearTip(category),
      isEstimated: false,
      recentRainfallMm,
    };
  }

  // Option B: Estimate from 7-day recent rainfall
  if (recentRainfallMm >= 30) {
    return {
      rating: 'Heavy 8',
      category: 'heavy',
      description: getConditionDescription('heavy'),
      rail: railOverride || 'True position',
      footwearTip: getFootwearTip('heavy'),
      penetrometer: 6.85,
      isEstimated: true,
      recentRainfallMm,
    };
  } else if (recentRainfallMm >= 12) {
    return {
      rating: 'Soft 6',
      category: 'soft',
      description: getConditionDescription('soft'),
      rail: railOverride || 'True position',
      footwearTip: getFootwearTip('soft'),
      penetrometer: 5.75,
      isEstimated: true,
      recentRainfallMm,
    };
  } else if (recentRainfallMm >= 3) {
    return {
      rating: 'Good 4',
      category: 'good',
      description: getConditionDescription('good'),
      rail: railOverride || 'True position',
      footwearTip: getFootwearTip('good'),
      penetrometer: 5.15,
      isEstimated: true,
      recentRainfallMm,
    };
  } else {
    return {
      rating: 'Good 3',
      category: 'good',
      description: getConditionDescription('good'),
      rail: railOverride || 'True position',
      footwearTip: getFootwearTip('good'),
      penetrometer: 4.85,
      isEstimated: true,
      recentRainfallMm,
    };
  }
}

export function getCategoryBadgeStyle(category: TrackConditionCategory): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (category) {
    case 'firm':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'good':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'soft':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        dot: 'bg-yellow-500',
      };
    case 'heavy':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
      };
  }
}
