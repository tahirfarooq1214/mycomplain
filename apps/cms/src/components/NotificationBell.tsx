'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'new' | 'escalated' | 'updated';
  time: Date;
  read: boolean;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const socketUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace('/api', '');
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join:ops');
    });

    socket.on('complaint:new', (data: any) => {
      addNotification({
        title: 'New Complaint',
        body: `${data.complaintNumber || 'New'} - ${data.brand?.name || 'Unknown'} ${data.category?.name || ''}`,
        type: 'new',
      });
    });

    socket.on('complaint:escalated', (data: any) => {
      addNotification({
        title: 'Complaint Escalated!',
        body: `${data.complaintNumber || 'A complaint'} has been escalated by the customer`,
        type: 'escalated',
      });
    });

    socket.on('complaint:updated', (data: any) => {
      addNotification({
        title: 'Status Updated',
        body: `${data.complaintNumber || 'Complaint'} - ${(data.status || '').replace(/_/g, ' ')}`,
        type: 'updated',
      });
    });

    return () => { socket.disconnect(); };
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function addNotification(n: Omit<Notification, 'id' | 'time' | 'read'>) {
    setNotifications((prev) => [
      { ...n, id: `${Date.now()}-${Math.random()}`, time: new Date(), read: false },
      ...prev,
    ].slice(0, 50));
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function clearAll() {
    setNotifications([]);
    setIsOpen(false);
  }

  const typeIcons = { new: '🆕', escalated: '🔴', updated: '🔄' };
  const typeBgs = { new: 'bg-blue-50', escalated: 'bg-red-50', updated: 'bg-gray-50' };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) markAllRead();
        }}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <span className="text-3xl block mb-2">🔔</span>
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs mt-1">Real-time updates will appear here</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    !n.read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-lg flex-shrink-0 w-8 h-8 rounded-full ${typeBgs[n.type]} flex items-center justify-center`}>
                      {typeIcons[n.type]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{n.body}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {n.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
