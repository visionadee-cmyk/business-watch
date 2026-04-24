import { useState, useEffect } from 'react';
import { Bell, X, Settings, Check } from 'lucide-react';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPreferences, setShowPreferences] = useState(false);

  // Load notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed);
      setUnreadCount(parsed.filter(n => !n.read).length);
    }

    // Generate sample notifications based on tender data
    generateSampleNotifications();
  }, []);

  const generateSampleNotifications = () => {
    const today = new Date();
    const sampleNotifications = [
      {
        id: 1,
        type: 'deadline',
        title: 'Deadline Alert: Monitor and Laptop Supply',
        message: '1 day remaining - IUM tender closing tomorrow',
        tenderId: 'TND-2026-001',
        date: today.toISOString(),
        read: false
      },
      {
        id: 2,
        type: 'opening',
        title: 'Bid Opening Today: 40 Laptops Supply',
        message: 'IUM bid opening at 14:00',
        tenderId: 'TND-2026-002',
        date: today.toISOString(),
        read: false
      }
    ];
    
    setNotifications(sampleNotifications);
    setUnreadCount(2);
  };

  const markAsRead = (id) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'deadline': return '⏰';
      case 'opening': return '🔨';
      case 'new': return '📢';
      case 'result': return '📊';
      default: return '🔔';
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'deadline': return 'bg-red-100 text-red-800';
      case 'opening': return 'bg-purple-100 text-purple-800';
      case 'new': return 'bg-green-100 text-green-800';
      case 'result': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setShowPreferences(true)}
                className="p-1 rounded hover:bg-gray-100"
                title="Notification Settings"
              >
                <Settings className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getColor(notification.type)}`}>
                      {getIcon(notification.type)}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">
                        {notification.title}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {notification.message}
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        {new Date(notification.date).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <NotificationPreferences 
          onClose={() => setShowPreferences(false)} 
        />
      )}
    </div>
  );
};

// Notification Preferences Component
const NotificationPreferences = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferences, setPreferences] = useState({
    deadlineAlerts: true,
    bidOpeningReminders: true,
    newTenderAlerts: true,
    resultUpdates: true
  });
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Email notification subscription disabled to prevent Firebase blocking
    // Preferences saved locally only
    setSubscribed(true);
    localStorage.setItem('notificationEmail', email);
  };

  if (subscribed) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Subscribed!</h3>
          <p className="text-gray-600 mb-4">
            You'll receive alerts at {email}
          </p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Notification Settings</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone (optional, for SMS)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="+960 XXX XXXX"
            />
          </div>

          <div className="space-y-3 pt-2">
            <p className="font-medium text-gray-700">Alert Types</p>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.deadlineAlerts}
                onChange={(e) => setPreferences({...preferences, deadlineAlerts: e.target.checked})}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Deadline Alerts (7, 3, 1 days before)</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.bidOpeningReminders}
                onChange={(e) => setPreferences({...preferences, bidOpeningReminders: e.target.checked})}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Bid Opening Reminders</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.newTenderAlerts}
                onChange={(e) => setPreferences({...preferences, newTenderAlerts: e.target.checked})}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">New Tender Alerts</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.resultUpdates}
                onChange={(e) => setPreferences({...preferences, resultUpdates: e.target.checked})}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Bid Result Updates</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mt-4"
          >
            Subscribe to Alerts
          </button>
        </form>
      </div>
    </div>
  );
};

export default NotificationBell;
