import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { supabase, RentalItem } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import RentalCard from '../components/RentalCard';
import ItemDetailsModal from '../components/ItemDetailsModal';
import AddEditItemModal from '../components/AddEditItemModal';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [myItems, setMyItems] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<RentalItem | null>(null);
  const [editingItem, setEditingItem] = useState<RentalItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user) {
      loadMyItems();
    }
  }, [user]);

  async function loadMyItems() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('rental_items')
        .select('*, owner:profiles(*)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyItems(data || []);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(itemId: string) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('rental_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await loadMyItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  }

  async function handleItemSaved() {
    setShowAddModal(false);
    setEditingItem(null);
    await loadMyItems();
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Please log in to access your dashboard
          </p>
          <button
            onClick={() => onNavigate('auth')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                My Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Welcome back, {profile?.full_name}!
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span>Add New Item</span>
            </button>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            My Listings
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : myItems.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                You haven't listed any items yet
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                List Your First Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myItems.map((item) => (
                <div key={item.id} className="relative">
                  <RentalCard
                    item={item}
                    onItemClick={setSelectedItem}
                    showOwner={false}
                  />
                  <div className="absolute top-2 left-2 flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem(item);
                      }}
                      className="p-2 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onNavigate={onNavigate}
        />
      )}

      {showAddModal && (
        <AddEditItemModal
          onClose={() => setShowAddModal(false)}
          onSaved={handleItemSaved}
        />
      )}

      {editingItem && (
        <AddEditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={handleItemSaved}
        />
      )}
    </div>
  );
}
