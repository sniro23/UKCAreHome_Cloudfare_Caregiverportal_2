import { useState, useEffect, useMemo } from 'react';
import { Bell, Calendar, MessageSquare, AlertTriangle, Settings, Check, BellRing } from 'lucide-react';
import { AppNotification } from '@shared/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
const notificationIcons: Record<AppNotification['type'], React.ReactNode> = {
  roster: <Calendar className="h-5 w-5 text-blue-500" />,
  alert: <AlertTriangle className="h-5 w-5 text-red-500" />,
  message: <MessageSquare className="h-5 w-5 text-purple-500" />,
  system: <Settings className="h-5 w-5 text-gray-500" />,
};
const NotificationItem = ({ notification, onMarkAsRead }: { notification: AppNotification; onMarkAsRead: (id: string) => void; }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
    className={cn(
      "flex items-start gap-4 p-4 rounded-lg transition-colors",
      !notification.read ? "bg-primary/5" : "hover:bg-muted/50"
    )}
  >
    <div className="flex-shrink-0">{notificationIcons[notification.type]}</div>
    <div className="flex-1">
      <p className="font-semibold">{notification.title}</p>
      <p className="text-sm text-muted-foreground">{notification.description}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
      </p>
    </div>
    {!notification.read && (
      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => onMarkAsRead(notification.id)}>
        <Check className="h-4 w-4" />
        <span className="sr-only">Mark as read</span>
      </Button>
    )}
  </motion.div>
);
const NotificationSkeleton = () => (
    <div className="flex items-start gap-4 p-4">
        <Skeleton className="h-6 w-6 rounded-full" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/3" />
        </div>
    </div>
)
const EmptyState = ({ isFiltered }: { isFiltered: boolean }) => (
    <div className="flex flex-col items-center justify-center text-center py-16">
        <BellRing className="h-16 w-16 text-primary/50 mb-4" />
        <h2 className="text-2xl font-bold font-display">{isFiltered ? "No Matching Notifications" : "All Caught Up!"}</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
            {isFiltered ? "Try adjusting your filter criteria." : "You have no new notifications. We'll let you know when something new comes up."}
        </p>
    </div>
);
export function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const fetchNotifications = async () => {
    try {
      const data = await api<AppNotification[]>('/api/notifications');
      setNotifications(data);
    } catch (error) {
      toast.error("Failed to load notifications.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchNotifications();
  }, []);
  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === filter);
  }, [notifications, filter]);
  const handleMarkAsRead = async (id: string) => {
    const originalNotifications = [...notifications];
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await api('/api/notifications/read', {
        method: 'POST',
        body: JSON.stringify({ ids: [id] }),
      });
    } catch (error) {
      toast.error("Failed to mark notification as read.");
      setNotifications(originalNotifications);
    }
  };
  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    const originalNotifications = [...notifications];
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    try {
      await api('/api/notifications/read', {
        method: 'POST',
        body: JSON.stringify({ ids: unreadIds }),
      });
    } catch (error) {
      toast.error("Failed to mark all notifications as read.");
      setNotifications(originalNotifications);
    }
  };
  const unreadCount = notifications.filter(n => !n.read).length;
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            Notifications
          </h1>
          <p className="text-muted-foreground">
            Here are your recent alerts and updates.
          </p>
        </div>
        {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
                Mark all as read
            </Button>
        )}
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>
                {unreadCount > 0 ? `You have ${unreadCount} unread notifications.` : 'All caught up!'}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <ToggleGroup 
                type="single" 
                defaultValue="all" 
                className="justify-start mb-4"
                value={filter}
                onValueChange={(value) => value && setFilter(value)}
            >
                <ToggleGroupItem value="all">All</ToggleGroupItem>
                <ToggleGroupItem value="unread">Unread</ToggleGroupItem>
                <ToggleGroupItem value="alert">Alerts</ToggleGroupItem>
                <ToggleGroupItem value="roster">Roster</ToggleGroupItem>
                <ToggleGroupItem value="message">Messages</ToggleGroupItem>
            </ToggleGroup>
            <div className="space-y-2 border-t pt-2">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <NotificationSkeleton key={i} />)
                ) : filteredNotifications.length > 0 ? (
                    <AnimatePresence>
                        {filteredNotifications.map((notification) => (
                            <NotificationItem key={notification.id} notification={notification} onMarkAsRead={handleMarkAsRead} />
                        ))}
                    </AnimatePresence>
                ) : (
                    <EmptyState isFiltered={filter !== 'all'} />
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}