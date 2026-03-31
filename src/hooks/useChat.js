import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Pusher from 'pusher-js';

// Pusher free tier: 200k messages/day, no credit card, no expiration
// Replace with your actual Pusher key from pusher.com
const PUSHER_KEY = 'a6f9d8c2a8e8c2a8e8c2'; // Placeholder - replace with real key
const PUSHER_CLUSTER = 'ap2'; // Mumbai cluster
const IS_DUMMY_KEY = PUSHER_KEY === 'a6f9d8c2a8e8c2a8e8c2';

export const useChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('bw_chat_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        return parsed.filter((m) => m.timestamp > oneDayAgo).slice(-100);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(IS_DUMMY_KEY ? 'Pusher not configured. Chat will work locally only. See USER_MANUAL.md for setup.' : null);
  const [needsSetup, setNeedsSetup] = useState(IS_DUMMY_KEY);
  const [pusher, setPusher] = useState(null);

  // Initialize Pusher (if key is valid)
  useEffect(() => {
    if (!user || IS_DUMMY_KEY) {
      setLoading(false);
      return;
    }

    let pusherClient;
    try {
      pusherClient = new Pusher(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
        forceTLS: true,
      });

      const channel = pusherClient.subscribe('business-watch-chat');

      channel.bind('message', (data) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) {
            return prev;
          }
          return [...prev, data].sort((a, b) => a.timestamp - b.timestamp);
        });
      });

      setLoading(false);

      return () => {
        pusherClient.unsubscribe('business-watch-chat');
        pusherClient.disconnect();
      };
    } catch (err) {
      setError('Failed to connect to chat. Please check your Pusher configuration.');
      setLoading(false);
      console.error('Pusher init error:', err);
    }
  }, [user]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('bw_chat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Send message (works locally even without Pusher)
  const sendMessage = useCallback(
    async (text, type = 'text') => {
      if (!user || !text.trim()) return false;

      try {
        const message = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: text.trim(),
          userId: user.uid,
          userName: user.displayName || user.email,
          userRole: user.role || 'Staff',
          timestamp: Date.now(),
          type,
        };

        setMessages((prev) => [...prev, message]);

        if (pusher) {
          const channel = pusher.channel('business-watch-chat');
          if (channel) {
            channel.trigger('client-message', message);
          }
        }

        return true;
      } catch (err) {
        setError('Failed to send message');
        console.error('Send message error:', err);
        return false;
      }
    },
    [user, pusher]
  );

  // Clear old messages (keep last 50)
  const clearOldMessages = useCallback(() => {
    setMessages((prev) => {
      const trimmed = prev.slice(-50);
      localStorage.setItem('bw_chat_messages', JSON.stringify(trimmed));
      return trimmed;
    });
  }, []);
    localStorage.setItem('bw_chat_messages', JSON.stringify(messages.slice(-50)));
  }, [messages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearOldMessages,
    currentUser: user,
  };
};
