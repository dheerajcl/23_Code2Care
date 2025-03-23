import React, { useState, useEffect } from 'react';
import { Bell, Check, X, AlertCircle, Info } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { notificationService } from '@/services/notification.service';
import { useAuth } from '@/lib/authContext';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { markNotificationAsRead } from '@/services/notification.service';
import { handleTaskResponse } from '@/services/notification.service';
import { toast } from 'sonner';

interface NotificationCenterProps {
  isAdmin?: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isAdmin = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  // Get unread notification count
  const unreadCount = notifications.filter(notification => !notification.is_read).length;
  
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);
  
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      if (isAdmin) {
        // For admin - get overview of task assignments
        const { data } = await notificationService.getTaskAssignmentStatusCounts();
        // This would be expanded in a real implementation
        setNotifications([]);
      } else {
        // For volunteers - get their notifications
        const { data } = await notificationService.getVolunteerNotifications(user.id);
        setNotifications(data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleNotificationClick = async (notification) => {
    // Mark as read
    await markNotificationAsRead(notification.id);
    
    // Update local state
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
    );
    
    // Handle based on notification type
    if (notification.type === 'task_assignment') {
      const taskAssignmentId = notification.task_assignment_id;
      const taskId = notification.task_assignment?.task?.id;
      const eventId = notification.task_assignment?.event?.id;
      
      // Navigate to the task
      if (eventId && taskId) {
        navigate(`/volunteer/events/${eventId}/tasks/${taskId}`);
      }
    }
    
    setOpen(false);
  };
  
  const handleAcceptTask = async (notification) => {
    if (!notification.task_assignment_id) return;
    
    const { success, error } = await handleTaskResponse(
      notification.task_assignment_id,
      user.id,
      'accept'
    );
    
    if (success) {
      toast.success('Task accepted successfully!');
      // Update notifications
      await fetchNotifications();
    } else {
      toast.error('Failed to accept task. Please try again.');
      console.error('Error accepting task:', error);
    }
  };
  
  const handleRejectTask = async (notification) => {
    if (!notification.task_assignment_id) return;
    
    const { success, error } = await handleTaskResponse(
      notification.task_assignment_id,
      user.id,
      'reject'
    );
    
    if (success) {
      toast.success('Task rejected.');
      // Update notifications
      await fetchNotifications();
    } else {
      toast.error('Failed to reject task. Please try again.');
      console.error('Error rejecting task:', error);
    }
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assignment':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          Notifications
          {unreadCount > 0 && <span className="ml-2 text-xs text-muted-foreground">({unreadCount} unread)</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length > 0 ? (
          <DropdownMenuGroup className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <div key={notification.id} className="px-2 py-1">
                <div 
                  className={cn(
                    "rounded-md p-2 hover:bg-accent transition-colors cursor-pointer",
                    !notification.is_read && "bg-muted"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-grow">
                      <div className="font-semibold text-sm">{notification.title}</div>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(notification.created_at)}
                      </div>
                      
                      {/* Task assignment response buttons */}
                      {notification.type === 'task_assignment' && 
                       notification.task_assignment &&
                       notification.task_assignment.notification_status === 'sent' && (
                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptTask(notification);
                            }}
                          >
                            <Check className="h-3 w-3 mr-1" /> Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-xs bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRejectTask(notification);
                            }}
                          >
                            <X className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                      
                      {/* Show status if already responded */}
                      {notification.type === 'task_assignment' && 
                       notification.task_assignment &&
                       ['accept', 'reject', 'expired'].includes(notification.task_assignment.notification_status) && (
                        <div className="mt-2">
                          <Badge variant={
                            notification.task_assignment.notification_status === 'accept' ? 'default' : 
                            notification.task_assignment.notification_status === 'reject' ? 'destructive' : 
                            'outline'
                          }>
                            {notification.task_assignment.notification_status === 'accept' ? 'Accepted' : 
                             notification.task_assignment.notification_status === 'reject' ? 'Rejected' :
                             'Expired'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
              </div>
            ))}
          </DropdownMenuGroup>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter; 