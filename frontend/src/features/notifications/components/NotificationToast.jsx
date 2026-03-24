import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { Heart, MessageCircle, UserPlus, X } from 'lucide-react';
import './NotificationToast.css';

function NotificationToast() {
  const { socket } = useSocket();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!socket) return;
    const handler = (data) => {
      setNotification(data);
      setTimeout(() => setNotification(null), 5000);
    };
    socket.on('newNotification', handler);
    return () => socket.off('newNotification', handler);
  }, [socket]);

  if (!notification) return null;

  const getIcon = () => {
    if (notification.type === 'like') return <Heart fill="red" color="red" size={20} />;
    if (notification.type === 'comment') return <MessageCircle color="#0095f6" size={20} />;
    return <UserPlus color="#2ecc71" size={20} />;
  };

  const getText = () => {
    const name = notification.sender?.username || 'Someone';
    if (notification.type === 'like') return `${name} liked your post`;
    if (notification.type === 'comment') return `${name} commented: "${notification.text}"`;
    return `${name} started following you`;
  };

  return (
    <div className="notification-toast" onClick={() => setNotification(null)}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-content">
        <p>{getText()}</p>
      </div>
      <button className="toast-close"><X size={16} /></button>
    </div>
  );
}

export default NotificationToast;
