import { POICategory } from '../../types/track';

const CATEGORY_CONFIG: Record<POICategory, { label: string; colour: string }> = {
  grandstand: { label: 'Grandstands', colour: '#3b82f6' },
  'food-drink': { label: 'Food & Drink', colour: '#f97316' },
  amenities: { label: 'Amenities', colour: '#22c55e' },
  viewing: { label: 'Viewing', colour: '#a855f7' },
  transport: { label: 'Transport', colour: '#6b7280' },
  entertainment: { label: 'Entertainment', colour: '#ec4899' },
  operations: { label: 'Operations', colour: '#14b8a6' },
};

export { CATEGORY_CONFIG };

interface CategoryFilterProps {
  categories: POICategory[];
  activeCategories: Set<POICategory>;
  onToggle: (category: POICategory) => void;
}

export default function CategoryFilter({ categories, activeCategories, onToggle }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {categories.map((cat) => {
        const config = CATEGORY_CONFIG[cat];
        const isActive = activeCategories.has(cat);

        return (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all duration-300 cursor-pointer border backdrop-blur-md ${
              isActive
                ? 'shadow-sm'
                : 'bg-white/60 text-stone-500 border-white/40 hover:bg-white/90 hover:shadow-sm'
            }`}
            style={
              isActive
                ? {
                    backgroundColor: config.colour + '26', // 15% opacity fallback
                    color: config.colour,
                    borderColor: config.colour + '66', // 40% opacity fallback
                  }
                : undefined
            }
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
