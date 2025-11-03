import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { supabase, RentalItem } from '../lib/supabase';
import RentalCard from '../components/RentalCard';
import ItemDetailsModal from '../components/ItemDetailsModal';
import { useAuth } from '../contexts/AuthContext';

interface BrowsePageProps {
  onNavigate: (page: string) => void;
}

const CATEGORIES = [
  'All',
  'Electronics',
  'Furniture',
  'Tools',
  'Sports',
  'Vehicles',
  'Outdoor',
  'Party',
  'Other',
];

export default function BrowsePage({ onNavigate }: BrowsePageProps) {
  const [items, setItems] = useState<RentalItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [locationFilter, setLocationFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RentalItem | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    loadItems();
    if (user) {
      loadFavorites();
    }
  }, [user]);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, selectedCategory, locationFilter]);

  async function loadItems() {
    try {
      const { data, error } = await supabase
        .from('rental_items')
        .select('*, owner:profiles(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadFavorites() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(new Set(data?.map(f => f.item_id) || []));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }

  function filterItems() {
    let filtered = items;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (locationFilter) {
      const location = locationFilter.toLowerCase();
      filtered = filtered.filter((item) =>
        item.location.toLowerCase().includes(location)
      );
    }

    setFilteredItems(filtered);
  }

  async function handleFavoriteToggle(itemId: string) {
    if (!user) {
      onNavigate('auth');
      return;
    }

    try {
      if (favorites.has(itemId)) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId);

        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, item_id: itemId });

        setFavorites(prev => new Set(prev).add(itemId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }

  async function handleItemClick(item: RentalItem) {
    await supabase
      .from('rental_items')
      .update({ views: item.views + 1 })
      .eq('id', item.id);

    setSelectedItem(item);
  }

  function clearFilters() {
    setSearchQuery('');
    setSelectedCategory('All');
    setLocationFilter('');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Browse Rentals
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find the perfect item for your needs
          </p>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-xl shadow-lg p-6 mb-8 transition-colors">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          <div
            className={`${
              showFilters ? 'block' : 'hidden'
            } lg:block mt-4 space-y-4`}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {(searchQuery || selectedCategory !== 'All' || locationFilter) && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                <X className="h-4 w-4" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        <div className="mb-4 text-gray-600 dark:text-gray-400">
          Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No items found matching your criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <RentalCard
                key={item.id}
                item={item}
                onItemClick={handleItemClick}
                onFavoriteToggle={user ? handleFavoriteToggle : undefined}
                isFavorited={favorites.has(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}
