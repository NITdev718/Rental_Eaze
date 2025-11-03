import { MapPin, Eye, Heart } from 'lucide-react';
import { RentalItem } from '../lib/supabase';

interface RentalCardProps {
  item: RentalItem;
  onItemClick: (item: RentalItem) => void;
  onFavoriteToggle?: (itemId: string) => void;
  isFavorited?: boolean;
  showOwner?: boolean;
}

export default function RentalCard({
  item,
  onItemClick,
  onFavoriteToggle,
  isFavorited,
  showOwner = true
}: RentalCardProps) {
  return (
    <div
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
      onClick={() => onItemClick(item)}
    >
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            No Image
          </div>
        )}

        {!item.availability && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Unavailable
          </div>
        )}

        <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {item.category}
        </div>

        {onFavoriteToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(item.id);
            }}
            className="absolute bottom-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorited
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            />
          </button>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
          {item.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{item.location}</span>
          <div className="ml-auto flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            <span>{item.views}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ₹{item.price_per_day}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/day</span>
            </p>
            {item.price_per_week && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ₹{item.price_per_week}/week
              </p>
            )}
          </div>

          {showOwner && item.owner && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              by {item.owner.full_name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
