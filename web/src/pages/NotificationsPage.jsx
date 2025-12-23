import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import api from '../services/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await api.get('/notifications');

        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unread);
      } catch (err) {
        console.error('Failed to load notifications', err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const filteredNotifications =
    filter === 'all'
      ? notifications
      : filter === 'unread'
      ? notifications.filter(n => !n.is_read)
      : notifications.filter(n => n.is_read);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}`);

      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);

      setNotifications(prev =>
        prev.filter(n => n.id !== id)
      );
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading notifications…
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Notifications
        </h1>
        <p className="text-gray-600">
          Stay updated with your tasks and projects
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {['all', 'unread', 'read'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === type
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type[0].toUpperCase() + type.slice(1)}
              {type === 'unread' && unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white text-green-600 rounded-full text-xs">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg"
          >
            <CheckCheck className="w-5 h-5" />
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {filter === 'unread'
              ? 'You’re all caught up!'
              : 'No notifications'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map(notification => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationCard({ notification, onMarkAsRead, onDelete }) {
  const typeIcons = {
    task_assigned: '📋',
    comment_mention: '💬',
    deadline_reminder: '⏰',
    task_completed: '✅',
  };

  return (
    <div
      className={`border-l-4 rounded-lg p-4 ${
        notification.is_read
          ? 'bg-white border-gray-200'
          : 'bg-blue-50 border-blue-200'
      }`}
    >
      <div className="flex gap-4">
        <div className="text-2xl">
          {typeIcons[notification.type] || '📬'}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {notification.title}
          </h3>

          <p className="text-gray-700 mb-2">
            {notification.message}
          </p>

          <div className="text-sm text-gray-500 flex gap-4">
            {notification.project_name && (
              <span>{notification.project_name}</span>
            )}
            <span>
              {new Date(notification.created_at).toLocaleString('ru-RU')}
            </span>
          </div>

          <div className="flex gap-3 mt-3">
            {notification.related_task_id && (
              <Link
                to={`/tasks/${notification.related_task_id}`}
                className="text-green-600 text-sm"
              >
                View task →
              </Link>
            )}

            {!notification.is_read && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="text-blue-600 text-sm flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Mark as read
              </button>
            )}

            <button
              onClick={() => onDelete(notification.id)}
              className="ml-auto text-red-600 text-sm flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
