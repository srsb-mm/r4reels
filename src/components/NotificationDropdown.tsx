import { Bell } from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const NotificationItem = ({ notification, onClick }: { notification: Notification; onClick: () => void }) => {
  const typeText = {
    follow: 'started following you',
    like: 'liked your post',
    comment: 'commented on your post',
  }[notification.type] || '';

  return (
    <div
      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}
      onClick={onClick}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={notification.actor?.avatar_url || undefined} />
        <AvatarFallback>{notification.actor?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-semibold">{notification.actor?.username}</span>{' '}
          {typeText}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
      {notification.post && (
        <img src={notification.post.image_url} alt="" className="h-10 w-10 rounded object-cover" />
      )}
      {!notification.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
    </div>
  );
};

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();

  const handleClick = (n: Notification) => {
    if (n.type === 'follow') {
      navigate(`/user/${n.actor?.username}`);
    } else if (n.post_id) {
      navigate(`/post/${n.post_id}`);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 max-h-96 overflow-y-auto" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">
              Mark all read
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">No notifications yet</p>
        ) : (
          notifications.map(n => (
            <NotificationItem key={n.id} notification={n} onClick={() => handleClick(n)} />
          ))
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
