import React from 'react';
import { Badge, IconButton, Tooltip } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { useNotifications } from '../../hooks/useNotifications';

interface NotificationBadgeProps {
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  color?: 'inherit' | 'primary' | 'secondary' | 'default';
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  onClick,
  size = 'medium',
  color = 'inherit',
}) => {
  const { unreadCount, loading } = useNotifications(true, 60000); // Auto-refresh a cada 1 minuto

  return (
    <Tooltip title={`${unreadCount} notificações não lidas`}>
      <IconButton
        color={color}
        onClick={onClick}
        size={size}
        disabled={loading}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          max={99}
          invisible={unreadCount === 0}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default NotificationBadge; 