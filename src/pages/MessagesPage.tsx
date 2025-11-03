import { useState, useEffect } from 'react';
import { Mail, Send, Package, User } from 'lucide-react';
import { supabase, Message } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MessagesPageProps {
  onNavigate: (page: string) => void;
}

export default function MessagesPage({ onNavigate }: MessagesPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  async function loadMessages() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*),
          recipient:profiles!messages_recipient_id_fkey(*),
          item:rental_items(*)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(messageId: string) {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId)
        .eq('recipient_id', user.id);

      await loadMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  async function handleMessageClick(message: Message) {
    setSelectedMessage(message);
    if (!message.read && message.recipient_id === user?.id) {
      await markAsRead(message.id);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Please log in to view your messages
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Messages
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your rental inquiries and conversations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-xl shadow-lg overflow-hidden transition-colors">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Inbox
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  No messages yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[calc(100vh-300px)] overflow-y-auto">
                {messages.map((message) => {
                  const isReceived = message.recipient_id === user.id;
                  const otherUser = isReceived ? message.sender : message.recipient;

                  return (
                    <button
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedMessage?.id === message.id
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : ''
                      } ${
                        !message.read && isReceived
                          ? 'bg-blue-50/50 dark:bg-blue-900/10'
                          : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          isReceived
                            ? 'bg-green-100 dark:bg-green-900'
                            : 'bg-blue-100 dark:bg-blue-900'
                        }`}>
                          {isReceived ? (
                            <Send className="h-4 w-4 text-green-600 dark:text-green-400 rotate-180" />
                          ) : (
                            <Send className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`text-sm font-semibold text-gray-900 dark:text-white truncate ${
                              !message.read && isReceived ? 'font-bold' : ''
                            }`}>
                              {otherUser?.full_name}
                            </p>
                            {!message.read && isReceived && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">
                            {message.subject}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {new Date(message.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-xl shadow-lg transition-colors">
            {selectedMessage ? (
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {selectedMessage.subject}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>
                            From: {selectedMessage.sender?.full_name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>
                            To: {selectedMessage.recipient?.full_name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </span>
                  </div>

                  {selectedMessage.item && (
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Regarding: {selectedMessage.item.title}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    Select a message to view
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
