import { POICategory } from '../../types/track';

const CATEGORY_CONFIG: Record<POICategory, { label: string; colour: string; activeClass: string }> = {
  grandstand: { label: 'Grandstands', colour: '#3b82f6', activeClass: 'bg-blue-500 text-white' },
  'food-drink': { label: 'Food & Drink', colour: '#f97316', activeClass: 'bg-orange-500 text-white' },
  amenities: { label: 'Amenities', colour: '#22c55e', activeClass: 'bg-green-500 text-white' },
  viewing: { label: 'Viewing', colour: '#a855f7', activeClass: 'bg-purple-500 text-white' },
  transport: { label: 'Transport', colour: '#6b7280', activeClass: 'bg-gray-500 text-white' },
  entertainment: { label: 'Entertainment', colour: '#ec4899', activeClass: 'bg-pink-500 text-white' },
  operations: { label: 'Operations', colour: '#14b8a6', activeClass: 'bg-teal-500 text-white' },
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
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
              isActive
                ? config.activeClass
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
