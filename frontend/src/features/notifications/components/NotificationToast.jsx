import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { Heart, MessageCircle, X } from 'lucide-react';
import './NotificationToast.css';

function NotificationToast() {
  const { socket } = useSocket();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('newNotification', (data) => {
      setNotification(data);
      // Auto-hide after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    });

    return () => socket.off('newNotification');
  }, [socket]);

  if (!notification) return null;

  return (
    <div className="notification-toast" onClick={() => setNotification(null)}>
      <div className="toast-icon">
        {notification.type === 'like' ? <Heart fill="red" color="red" size={20} /> : <MessageCircle color="#0095f6" size={20} />}
      </div>
      <div className="toast-content">
        <p>
          <strong>Someone</strong> {notification.type === 'like' ? 'liked your post' : 'commented on your post'}
        </p>
        {notification.text && <p className="toast-subtext">"{notification.text}"</p>}
      </div>
      <button className="toast-close"><X size={16} /></button>
    </div>
  );
}

export default NotificationToast;
