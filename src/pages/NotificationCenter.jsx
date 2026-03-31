import React, { useState } from 'react';
import { Bell, CheckCircle, AlertCircle, Clock, FileText, DollarSign, Trash2, Settings, Filter, BellOff } from 'lucide-react';

const mockNotifications = [
  { id: 1, type: 'deadline', title: 'Bid deadline approaching', message: 'IT Equipment Supply tender closes in 2 days', timestamp: '2026-03-29 09:30', read: false, tender: 'IT Equipment Supply' },
  { id: 2, type: 'result', title: 'Bid result announced', message: 'Your bid for Office Renovation has been awarded', timestamp: '2026-03-28 14:15', read: false, tender: 'Office Renovation' },
  { id: 3, type: 'payment', title: 'Payment received', message: 'MVR 1,250,000 received from Ministry of Education', timestamp: '2026-03-27 11:00', read: true, tender: 'IT Equipment Supply' },
  { id: 4, type: 'system', title: 'New tender alert', message: '3 new tenders matching your criteria', timestamp: '2026-03-26 08:00', read: true, tender: null },
  { id: 5, type: 'deadline', title: 'Contract renewal', message: 'Maldives Ports contract expires in 30 days', timestamp: '2026-03-25 16:45', read: true, tender: 'Annual Maintenance' },
  { id: 6, type: 'mention', title: 'You were mentioned', message: 'Ahmed mentioned you in Office Renovation comments', timestamp: '2026-03-24 10:30', read: true, tender: 'Office Renovation' },
];

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'deadline': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'result': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'payment': return <DollarSign className="w-5 h-5 text-blue-500" />;
      case 'system': return <AlertCircle className="w-5 h-5 text-purple-500" />;
      case 'mention': return <FileText className="w-5 h-5 text-pink-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'deadline': return 'bg-amber-50 border-amber-200';
      case 'result': return 'bg-emerald-50 border-emerald-200';
      case 'payment': return 'bg-blue-50 border-blue-200';
      case 'system': return 'bg-purple-50 border-purple-200';
      case 'mention': return 'bg-pink-50 border-pink-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Center</h1>
          <p className="text-gray-500 mt-1">Manage your alerts and notifications</p>
        </div>
        <div className="flex gap-3">
          <button onClick={markAllRead} className="btn btn-secondary flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Mark All Read
          </button>
          <button className="btn btn-secondary p-2">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 text-center">
          <Bell className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-3xl font-bold text-blue-700">{notifications.length}</p>
          <p className="text-sm text-gray-600">Total Notifications</p>
        </div>
        <div className="card bg-gradient-to-br from-amber-50 to-amber-100 text-center">
          <Bell className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <p className="text-3xl font-bold text-amber-700">{unreadCount}</p>
          <p className="text-sm text-gray-600">Unread</p>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100 text-center">
          <Clock className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-3xl font-bold text-red-700">
            {notifications.filter(n => n.type === 'deadline').length}
          </p>
          <p className="text-sm text-gray-600">Deadlines</p>
        </div>
        <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 text-center">
          <DollarSign className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-3xl font-bold text-emerald-700">
            {notifications.filter(n => n.type === 'payment').length}
          </p>
          <p className="text-sm text-gray-600">Payments</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <div className="flex gap-2 flex-wrap">
          {['all', 'unread', 'deadline', 'result', 'payment', 'mention'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <div 
            key={notification.id}
            className={`card flex items-start gap-4 transition-all ${getTypeColor(notification.type)} ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}
          >
            <div className="flex-shrink-0 mt-1">
              {getIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                    {notification.title}
                    {!notification.read && <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block" />}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{notification.timestamp}</span>
                    {notification.tender && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-1 bg-white/50 rounded">{notification.tender}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!notification.read && (
                <button 
                  onClick={() => markAsRead(notification.id)}
                  className="p-2 hover:bg-white/50 rounded-lg"
                  title="Mark as read"
                >
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                </button>
              )}
              <button 
                onClick={() => deleteNotification(notification.id)}
                className="p-2 hover:bg-white/50 rounded-lg"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="card text-center py-12">
            <BellOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}
