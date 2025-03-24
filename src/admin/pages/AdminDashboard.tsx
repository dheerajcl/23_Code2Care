import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  Users, 
  Award, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  MenuIcon, 
  LogOut, 
  User, 
  Settings,
  ChevronDown,
  Bell
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { getDashboardStats, getEvents, getVolunteers } from '@/services/database.service';
import { supabase } from '@/lib/supabase';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State for dashboard data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalVolunteers: 0,
    totalEvents: 0,
    newVolunteers: 0,
    activeEvents: 0,
    volunteerHours: 0
  });

  // State for charts data
  const [eventData, setEventData] = useState<Array<any>>([]);
  const [volunteerData, setVolunteerData] = useState<Array<any>>([]);
  const [skillDistribution, setSkillDistribution] = useState<Array<any>>([]);
  const [recentVolunteers, setRecentVolunteers] = useState<Array<any>>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Array<any>>([]);

  // Fetch dashboard data on component load
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const stats = await getDashboardStats();
        if (stats.error) throw stats.error;
        
        // Format volunteer hours (placeholder - no direct API for this yet)
        const volunteerHours = 854; // This should be replaced with actual data when available
        
        setDashboardStats({ 
          ...stats, 
          volunteerHours 
        });
        
        // Fetch events for chart data
        const { data: events, error: eventsError } = await getEvents();
        if (eventsError) throw eventsError;
        
        // Fetch volunteers
        const { data: volunteers, error: volunteersError } = await getVolunteers();
        if (volunteersError) throw volunteersError;
        
        // Prepare events chart data
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const eventCounts: { [key: string]: number } = {};
        
        // Initialize with all months
        monthNames.forEach(month => {
          eventCounts[month] = 0;
        });
        
        // Count events by month
        events.forEach((event: any) => {
          const eventDate = new Date(event.start_date);
          const month = monthNames[eventDate.getMonth()];
          eventCounts[month] = (eventCounts[month] || 0) + 1;
        });
        
        // Convert to chart format
        const formattedEventData = Object.keys(eventCounts).map(name => ({
          name,
          count: eventCounts[name]
        }));
        
        setEventData(formattedEventData);
        
        // Prepare volunteer growth data (simplified - would need more historical data for accuracy)
        const currentMonth = new Date().getMonth();
        const recentMonths = monthNames.slice(Math.max(0, currentMonth - 6), currentMonth + 1);
        
        // Simple sample data - in a real app you'd fetch historical data
        const formattedVolunteerData = recentMonths.map((name, index) => ({
          name,
          active: Math.floor(volunteers.length * 0.7) + (index * 10),
          new: Math.floor(volunteers.length * 0.1) + (index * 3)
        }));
        
        setVolunteerData(formattedVolunteerData);
        
        // Get skill distribution
        const skills: { [key: string]: number } = {};
        
        volunteers.forEach((volunteer: any) => {
          if (volunteer.skills) {
            const volunteerSkills = Array.isArray(volunteer.skills) 
              ? volunteer.skills 
              : typeof volunteer.skills === 'string' 
                ? volunteer.skills.split(',') 
                : [];
                
            volunteerSkills.forEach((skill: string) => {
              const trimmedSkill = skill.trim();
              skills[trimmedSkill] = (skills[trimmedSkill] || 0) + 1;
            });
          }
        });
        
        const formattedSkills = Object.entries(skills)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        
        setSkillDistribution(formattedSkills);
        
        // Get recent volunteers
        const sortedVolunteers = [...volunteers]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 4)
          .map(volunteer => {
            // Calculate how long ago they joined
            const joinedDate = new Date(volunteer.created_at);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - joinedDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let joined = diffDays === 0 
              ? 'Today' 
              : diffDays === 1 
                ? '1 day ago' 
                : diffDays < 7 
                  ? `${diffDays} days ago` 
                  : `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
            
            return {
              id: volunteer.id,
              name: `${volunteer.first_name || ''} ${volunteer.last_name || ''}`.trim(),
              email: volunteer.email,
              skills: volunteer.skills 
                ? (Array.isArray(volunteer.skills) 
                  ? volunteer.skills 
                  : typeof volunteer.skills === 'string' 
                    ? volunteer.skills.split(',').map((s: string) => s.trim()) 
                    : [])
                : [],
              joined,
              events: volunteer.event_count || 0,
              status: volunteer.event_count ? 'active' : 'new'
            };
          });
        
        setRecentVolunteers(sortedVolunteers);
        
        // Get upcoming events
        const upcomingEvts = events
          .filter((event: any) => new Date(event.start_date) > new Date())
          .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
          .slice(0, 3)
          .map((event: any) => ({
            id: event.id,
            title: event.title,
            date: new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            location: event.location || 'N/A',
            volunteers: event.registered_count || 0,
            volunteerNeeded: event.capacity || 0,
            status: 'Upcoming'
          }));
        
        setUpcomingEvents(upcomingEvts);
        
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleViewAllEvents = () => {
    navigate('/admin/events');
  };

  const handleViewAllVolunteers = () => {
    navigate('/admin/volunteers');
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
              <h2 className="text-xl">Loading dashboard data...</h2>
              <p className="text-muted-foreground mt-2">Please wait while we fetch the latest information.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        <AdminHeader user={user} handleLogout={handleLogout}/>
        <div className="flex flex-1 overflow-hidden">
          <AdminSidebar />
          <main className="flex-1 overflow-auto p-8 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl text-red-600">Error Loading Dashboard</h2>
              <p className="text-muted-foreground mt-2">{error.message}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
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
          <div className="container mx-auto px-4 lg:px-2">
            <div className="flex flex-col gap-6">
              {/* Welcome */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Welcome, {user?.firstName}!</h1>
                <p className="text-muted-foreground">
                  Here's what's happening with your organization today.
                </p>
              </div>

              {/* Stats Overview */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Volunteers
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.totalVolunteers}</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                      <span className="text-green-500 flex items-center mr-1">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {Math.round((dashboardStats.newVolunteers / dashboardStats.totalVolunteers) * 100) || 0}%
                      </span>
                      new this month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Events
                    </CardTitle>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.activeEvents}</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                      <span className="text-green-500 flex items-center mr-1">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {Math.round((dashboardStats.activeEvents / dashboardStats.totalEvents) * 100) || 0}%
                      </span>
                      of total events
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Volunteer Hours
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.volunteerHours}</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                      <span className="text-green-500 flex items-center mr-1">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        18%
                      </span>
                      from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      New Registrations
                    </CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.newVolunteers}</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                      <span className={dashboardStats.newVolunteers > 0 ? "text-green-500" : "text-red-500"} flex items-center mr-1>
                        {dashboardStats.newVolunteers > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        this month
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Engagement</CardTitle>
                    <CardDescription>
                      Number of events conducted over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={eventData}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Volunteer Growth</CardTitle>
                    <CardDescription>
                      Active and new volunteers over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={volunteerData}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="active" stroke="#0ea5e9" strokeWidth={2} />
                          <Line type="monotone" dataKey="new" stroke="#22c55e" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Volunteer Skills and Upcoming Events */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Volunteer Skills Distribution</CardTitle>
                    <CardDescription>
                      Overview of volunteer skill sets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {skillDistribution.map((skill) => (
                        <div key={skill.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">{skill.name}</div>
                            <div className="text-sm text-muted-foreground">{skill.value}</div>
                          </div>
                          <Progress value={skill.value} max={Math.max(...skillDistribution.map(s => s.value))} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                    <CardDescription>
                      Events scheduled in the near future
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingEvents.length > 0 ? (
                        upcomingEvents.map((event) => (
                          <div key={event.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{event.title}</h3>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {event.date} | {event.location}
                                </div>
                              </div>
                              <Badge variant={event.status === "Upcoming" ? "outline" : "secondary"}>
                                {event.status}
                              </Badge>
                            </div>
                            <div className="mt-3">
                              <div className="text-sm flex justify-between mb-1">
                                <span>Volunteers: {event.volunteers}/{event.volunteerNeeded}</span>
                                <span className="text-muted-foreground">
                                  {event.volunteerNeeded > 0 
                                    ? Math.round((event.volunteers / event.volunteerNeeded) * 100) 
                                    : 0}%
                                </span>
                              </div>
                              <Progress 
                                value={event.volunteers} 
                                max={event.volunteerNeeded || 1} 
                                className="h-2" 
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No upcoming events scheduled.</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={handleViewAllEvents}>
                      View All Events
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Recent Volunteers */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Volunteers</CardTitle>
                  <CardDescription>
                    Recently registered volunteers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    {recentVolunteers.length > 0 ? (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="font-medium p-3">Name</th>
                            <th className="font-medium p-3">Skills</th>
                            <th className="font-medium p-3">Joined</th>
                            <th className="font-medium p-3">Events</th>
                            <th className="font-medium p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentVolunteers.map((volunteer) => (
                            <tr key={volunteer.id} className="border-b">
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>{volunteer.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{volunteer.name}</div>
                                    <div className="text-sm text-muted-foreground">{volunteer.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-1">
                                  {volunteer.skills.slice(0, 2).map((skill: string) => (
                                    <Badge key={skill} variant="secondary" className="font-normal">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {volunteer.skills.length > 2 && (
                                    <Badge variant="outline" className="font-normal">
                                      +{volunteer.skills.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">{volunteer.joined}</td>
                              <td className="p-3">{volunteer.events}</td>
                              <td className="p-3">
                                <Badge className={volunteer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                                  {volunteer.status === 'active' ? 'Active' : 'New'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-muted-foreground p-3">No volunteers have registered recently.</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={handleViewAllVolunteers}>
                    View All Volunteers
                  </Button>
                </CardFooter>
              </Card>

              {/* Notifications Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    View and manage volunteer task notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <Bell className="w-6 h-6 text-blue-500" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/admin/notifications')}>
                    View Notifications
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 