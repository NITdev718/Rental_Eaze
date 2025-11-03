import { useState, useEffect } from 'react';
import { Search, TrendingUp, Package, Shield, Zap } from 'lucide-react';
import { supabase, RentalItem } from '../lib/supabase';
import RentalCard from '../components/RentalCard';
import ItemDetailsModal from '../components/ItemDetailsModal';
import { useAuth } from '../contexts/AuthContext';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [trendingItems, setTrendingItems] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<RentalItem | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    loadTrendingItems();
    if (user) {
      loadFavorites();
    }
  }, [user]);

  async function loadTrendingItems() {
    try {
      const { data, error } = await supabase
        .from('rental_items')
        .select('*, owner:profiles(*)')
        .eq('availability', true)
        .order('views', { ascending: false })
        .limit(6);

      if (error) throw error;
      setTrendingItems(data || []);
    } catch (error) {
      console.error('Error loading trending items:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 transition-colors">
      <div className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-700/90 dark:from-blue-800/90 dark:to-indigo-900/90 backdrop-blur-sm"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Rent Anything, Anytime
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              The easiest way to rent items from people around you
            </p>
            <button
              onClick={() => onNavigate('browse')}
              className="px-8 py-4 bg-white/95 backdrop-blur-md text-blue-600 rounded-lg font-semibold text-lg hover:bg-white transition-all transform hover:scale-105 shadow-xl border border-white/40"
            >
              Start Browsing
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 p-6 rounded-xl shadow-lg text-center transition-all hover:bg-white/80 dark:hover:bg-gray-800/80">
            <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Easy Search
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Find exactly what you need with powerful filters
            </p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 p-6 rounded-xl shadow-lg text-center transition-all hover:bg-white/80 dark:hover:bg-gray-800/80">
            <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Secure Platform
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your data and transactions are always protected
            </p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 p-6 rounded-xl shadow-lg text-center transition-all hover:bg-white/80 dark:hover:bg-gray-800/80">
            <div className="bg-yellow-100 dark:bg-yellow-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Quick Rentals
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with owners and rent items in minutes
            </p>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Trending Rentals
            </h2>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            View All
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : trendingItems.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              No items available yet
            </p>
            {user && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                List Your First Item
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingItems.map((item) => (
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
