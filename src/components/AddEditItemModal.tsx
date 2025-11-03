import { useState, useEffect } from 'react';
import { X, Camera, MapPin } from 'lucide-react';
import CameraCapture from './CameraCapture';
import { supabase, RentalItem } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AddEditItemModalProps {
  item?: RentalItem;
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Tools',
  'Sports',
  'Vehicles',
  'Outdoor',
  'Party',
  'Other',
];

export default function AddEditItemModal({ item, onClose, onSaved }: AddEditItemModalProps) {
  const [title, setTitle] = useState(item?.title || '');
  const [description, setDescription] = useState(item?.description || '');
  const [category, setCategory] = useState(item?.category || CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState(item?.image_url || '');
  const [pricePerDay, setPricePerDay] = useState(item?.price_per_day?.toString() || '');
  const [pricePerWeek, setPricePerWeek] = useState(item?.price_per_week?.toString() || '');
  const [location, setLocation] = useState(item?.location || '');
  const [availability, setAvailability] = useState(item?.availability ?? true);
  const [saving, setSaving] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!item && !location) {
      detectLocation();
    }
  }, []);

  async function detectLocation() {
    setDetectingLocation(true);
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const data = await response.json();
              const locationString = `${data.address.city || data.address.town || data.address.village || ''}, ${data.address.state || data.address.country || ''}`;
              setLocation(locationString.trim());
            } catch (error) {
              console.error('Error getting location name:', error);
              setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            } finally {
              setDetectingLocation(false);
            }
          },
          (error) => {
            console.error('Location error:', error);
            setDetectingLocation(false);
          }
        );
      } else {
        setDetectingLocation(false);
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      setDetectingLocation(false);
    }
  }

  function handleCameraCapture(imageDataUrl: string) {
    setImageUrl(imageDataUrl);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const itemData = {
        title: title.trim(),
        description: description.trim(),
        category,
        image_url: imageUrl.trim() || null,
        price_per_day: parseFloat(pricePerDay),
        price_per_week: pricePerWeek ? parseFloat(pricePerWeek) : null,
        location: location.trim(),
        availability,
        updated_at: new Date().toISOString(),
      };

      if (item) {
        const { error } = await supabase
          .from('rental_items')
          .update(itemData)
          .eq('id', item.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('rental_items')
          .insert({
            ...itemData,
            owner_id: user.id,
          });

        if (error) throw error;
      }

      onSaved();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl border border-white/30 dark:border-gray-700/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {item ? 'Edit Item' : 'Add New Item'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Item Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Professional Camera"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe your item in detail..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Image
            </label>
            <div className="space-y-3">
              {imageUrl && (
                <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Camera className="h-5 w-5" />
                  <span>Take Photo</span>
                </button>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Or paste image URL"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price per Day (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price per Week (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricePerWeek}
                onChange={(e) => setPricePerWeek(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="60.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location *
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Mumbai, Maharashtra"
                required
              />
              <button
                type="button"
                onClick={detectLocation}
                disabled={detectingLocation}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <MapPin className="h-5 w-5" />
                <span>{detectingLocation ? 'Detecting...' : 'Auto-detect'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="availability"
              checked={availability}
              onChange={(e) => setAvailability(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="availability"
              className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Item is currently available for rent
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : item ? 'Update Item' : 'Add Item'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
