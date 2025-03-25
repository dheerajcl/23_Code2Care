import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { notificationService } from '@/services/notification.service';
import { Bell, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/authContext';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import AccessibilityMenu from '@/components/AccessibilityMenu';

const AdminNotificationDashboard = () => {
  const [stats, setStats] = useState({
    pending: 0,
    sent: 0,
    accept: 0,
    reject: 0,
    expired: 0
  });
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    const channel = supabase
      .channel('task_assignments')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'task_assignment'
      }, () => {
        fetchAssignments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handleRefresh = () => fetchAssignments();
    
    window.addEventListener('task-assignment-update', handleRefresh);
    return () => {
      window.removeEventListener('task-assignment-update', handleRefresh);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get counts of task assignments by status
      const statsResponse = await notificationService.getTaskAssignmentStatusCounts();
      if (statsResponse.data) {
        setStats(statsResponse.data);
      }

      // Get all notifications/task assignments
      const notificationsResponse = await notificationService.getAdminNotifications();
      if (notificationsResponse.success && notificationsResponse.data) {
        let filteredData = notificationsResponse.data;
        
        // Filter based on active tab
        if (activeTab !== 'all') {
          filteredData = filteredData.filter(item => item.notification_status === activeTab);
        }
        
        setAssignments(filteredData);
      }
    } catch (error) {
      console.error('Error fetching notification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const notificationsResponse = await notificationService.getAdminNotifications();
      if (notificationsResponse.success && notificationsResponse.data) {
        let filteredData = notificationsResponse.data;
        
        if (activeTab !== 'all') {
          filteredData = filteredData.filter(item => item.notification_status === activeTab);
        }
        
        setAssignments(filteredData);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-gray-100"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'sent':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><Bell className="h-3 w-3 mr-1" /> Sent</Badge>;
      case 'accept':
        return <Badge variant="outline" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Accepted</Badge>;
      case 'reject':
        return <Badge variant="outline" className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800"><AlertCircle className="h-3 w-3 mr-1" /> Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        <AdminHeader user={user} handleLogout={handleLogout}/>
        <div className="flex flex-1 overflow-hidden">
          <AdminSidebar />
          <main className="flex-1 overflow-auto p-8 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl">Loading notification data...</h2>
              <p className="text-muted-foreground mt-2">Please wait while we fetch the latest information.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <AdminHeader user={user} handleLogout={handleLogout}/>
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-8">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col space-y-6">
              <div className="flex w-full justify-between">
              <div className="flex flex-col space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Notification Dashboard</h1>
                <p className="text-muted-foreground">
                  Monitor and manage volunteer task notifications
                </p>
              </div>
              <Button onClick={() => navigate('/admin/notifications/history')} className='bg-purple-700 hover:bg-purple-800'>View Notifications History</Button>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <StatCard title="Pending" value={stats.pending} icon={<Clock className="h-5 w-5 text-gray-500" />} loading={loading} />
                <StatCard title="Sent" value={stats.sent} icon={<Bell className="h-5 w-5 text-blue-500" />} loading={loading} />
                <StatCard title="Accepted" value={stats.accept} icon={<CheckCircle className="h-5 w-5 text-green-500" />} loading={loading} />
                <StatCard title="Rejected" value={stats.reject} icon={<XCircle className="h-5 w-5 text-red-500" />} loading={loading} />
                <StatCard title="Expired" value={stats.expired} icon={<AlertCircle className="h-5 w-5 text-amber-500" />} loading={loading} />
              </div>

              {/* Task Assignments Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Task Assignments</CardTitle>
                  <CardDescription>
                    Review all task assignments and their notification status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="sent">Sent</TabsTrigger>
                      <TabsTrigger value="accept">Accepted</TabsTrigger>
                      <TabsTrigger value="reject">Rejected</TabsTrigger>
                      <TabsTrigger value="expired">Expired</TabsTrigger>
                    </TabsList>
                    <TabsContent value={activeTab}>
                      <div className="border rounded-md">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="p-2 text-left font-medium">Volunteer</th>
                              <th className="p-2 text-left font-medium">Task</th>
                              <th className="p-2 text-left font-medium">Event</th>
                              <th className="p-2 text-left font-medium">Status</th>
                              <th className="p-2 text-left font-medium">Sent At</th>
                              <th className="p-2 text-left font-medium">Responded At</th>
                              <th className="p-2 text-left font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loading ? (
                              // Skeleton loading state
                              Array(5).fill(0).map((_, i) => (
                                <tr key={i} className="border-b">
                                  <td className="p-2"><Skeleton className="h-6 w-32" /></td>
                                  <td className="p-2"><Skeleton className="h-6 w-32" /></td>
                                  <td className="p-2"><Skeleton className="h-6 w-32" /></td>
                                  <td className="p-2"><Skeleton className="h-6 w-20" /></td>
                                  <td className="p-2"><Skeleton className="h-6 w-32" /></td>
                                  <td className="p-2"><Skeleton className="h-6 w-32" /></td>
                                  <td className="p-2"><Skeleton className="h-6 w-20" /></td>
                                </tr>
                              ))
                            ) : assignments.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="p-4 text-center text-muted-foreground">
                                  No task assignments found
                                </td>
                              </tr>
                            ) : (
                              assignments.map((assignment) => (
                                <tr key={assignment.id} className="border-b hover:bg-muted/50">
                                  <td className="p-2">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={assignment.volunteer?.profile_image} />
                                        <AvatarFallback>
                                          {assignment.volunteer?.first_name?.[0]}{assignment.volunteer?.last_name?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span>
                                        {assignment.volunteer?.first_name} {assignment.volunteer?.last_name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-2">{assignment.task?.title}</td>
                                  <td className="p-2">{assignment.event?.title}</td>
                                  <td className="p-2">{getStatusBadge(assignment.notification_status)}</td>
                                  <td className="p-2">{formatDate(assignment.notification_sent_at)}</td>
                                  <td className="p-2">{formatDate(assignment.notification_responded_at)}</td>
                                  <td className="p-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => navigate(`/admin/events/${assignment.event?.id}`)}
                                    >
                                      View Event
                                    </Button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="border-t p-4 flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {assignments.length} task assignments
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fetchData()}
                  >
                    Refresh
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <AccessibilityMenu/>
    </div>
  );
};

const StatCard = ({ title, value, icon, loading }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {loading ? (
        <Skeleton className="h-8 w-12" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
);

export default AdminNotificationDashboard;