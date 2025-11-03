import { useState, useRef, useEffect } from 'react';
import { X, MapPin, User, DollarSign, Calendar, MessageSquare } from 'lucide-react';
import { RentalItem, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ItemDetailsModalProps {
  item: RentalItem;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export default function ItemDetailsModal({ item, onClose, onNavigate }: ItemDetailsModalProps) {
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [subject, setSubject] = useState(`Inquiry about ${item.title}`);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const messageFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showMessageForm && messageFormRef.current) {
      messageFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showMessageForm]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      onClose();
      onNavigate('auth');
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        item_id: item.id,
        sender_id: user.id,
        recipient_id: item.owner_id,
        subject,
        message,
      });

      if (error) throw error;

      alert('Message sent successfully!');
      setShowMessageForm(false);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl border border-white/30 dark:border-gray-700/50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Item Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="relative h-64 md:h-96 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                  No Image Available
                </div>
              )}
              {!item.availability && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                  Currently Unavailable
                </div>
              )}
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full font-semibold">
                {item.category}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{item.location}</span>
                </div>
              </div>

              <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4">
                <div className="flex items-baseline space-x-4">
                  <div>
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      ₹{item.price_per_day}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      per day
                    </p>
                  </div>
                  {item.price_per_week && (
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{item.price_per_week}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        per week
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {item.owner && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Listed by
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {item.owner.full_name}
                      </p>
                    </div>
                  </div>
                  {item.owner.phone && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Phone: {item.owner.phone}
                    </p>
                  )}
                  {item.owner.location && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Location: {item.owner.location}
                    </p>
                  )}
                </div>
              )}

              {user?.id !== item.owner_id && (
                <button
                  onClick={() => setShowMessageForm(true)}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Contact Owner</span>
                </button>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Description
            </h4>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
                <Calendar className="h-4 w-4" />
                <span>Listed on</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
                <DollarSign className="h-4 w-4" />
                <span>Status</span>
              </div>
              <p className={`font-semibold ${
                item.availability
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {item.availability ? 'Available' : 'Unavailable'}
              </p>
            </div>
          </div>

          {showMessageForm && (
            <div ref={messageFormRef} className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Send Message to Owner
              </h4>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="I'm interested in renting this item..."
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMessageForm(false)}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
