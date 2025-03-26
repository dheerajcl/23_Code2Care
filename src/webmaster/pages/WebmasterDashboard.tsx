import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  Users, 
  Award, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Eye
} from 'lucide-react';
import { useWebmasterAuth } from '@/lib/authContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { WebmasterHeader } from '../components/WebmasterHeader';
import { WebmasterSidebar } from '../components/WebmasterSidebar';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { getDashboardStats, getEvents, getVolunteers } from '@/services/database.service';
import { toast } from '@/components/ui/use-toast';

export const WebmasterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useWebmasterAuth();

  // State for dashboard data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalVolunteers: 0,
    totalEvents: 0,
    newVolunteers: 0,
    activeEvents: 0,
    volunteerHours: 0
  });

  // State for charts data
  const [eventData, setEventData] = useState([]);
  const [volunteerData, setVolunteerData] = useState([]);
  const [skillDistribution, setSkillDistribution] = useState([]);
  const [recentVolunteers, setRecentVolunteers] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  // Fetch dashboard data on component load
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const stats = await getDashboardStats();
        if (stats.error) throw stats.error;
        
        // Fetch volunteers and their hours
        const { data: volunteers, error: volunteersError } = await getVolunteers();
        if (volunteersError) throw volunteersError;
        
        // Calculate total volunteer hours
        const volunteerHours = volunteers.reduce((sum, vol) => sum + (vol.hours || 0), 0)
        console.log(volunteerHours);
        setDashboardStats({ 
          ...stats, 
          volunteerHours 
        });
        
        // Fetch events for chart data
        const { data: events, error: eventsError } = await getEvents();
        if (eventsError) throw eventsError;
        // Prepare events chart data
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const eventCounts = {};
        
        // Initialize with all months
        monthNames.forEach(month => {
          eventCounts[month] = 0;
        });
        
        // Count events by month
        events.forEach(event => {
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
        
        // Prepare volunteer growth data
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
        const skills = {};
        
        volunteers.forEach(volunteer => {
          if (volunteer.skills) {
            const volunteerSkills = Array.isArray(volunteer.skills) 
              ? volunteer.skills 
              : typeof volunteer.skills === 'string' 
                ? volunteer.skills.split(',') 
                : [];
                
            volunteerSkills.forEach(skill => {
              const trimmedSkill = skill.trim();
              skills[trimmedSkill] = (skills[trimmedSkill] || 0) + 1;
            });
          }
        });
        
        const formattedSkills = Object.entries(skills)
        .map(([name, value]) => ({ 
          name, 
          value: typeof value === 'number' ? value : Number(value) || 0 
        }))
        .sort((a, b) => (b.value as number) - (a.value as number))
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
                    ? volunteer.skills.split(',').map(s => s.trim()) 
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
          .filter(event => new Date(event.start_date) > new Date())
          .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
          .slice(0, 3)
          .map(event => ({
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
        setError(err.message || 'Failed to fetch dashboard data');
        toast({
          title: "Error",
          description: err.message || 'Failed to fetch dashboard data',
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleViewAllEvents = () => {
    navigate('/webmaster/events');
  };

  const handleViewAllVolunteers = () => {
    navigate('/webmaster/volunteers');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        <WebmasterHeader />
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          <WebmasterSidebar />
          <main className="flex-1 overflow-auto p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
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
        <WebmasterHeader />
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          <WebmasterSidebar />
          <main className="flex-1 overflow-auto p-8 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl text-red-600">Error Loading Dashboard</h2>
              <p className="text-muted-foreground mt-2">{error}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <WebmasterHeader />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <WebmasterSidebar />
        <main className="flex-1 overflow-auto p-8">
          <div className="container mx-auto">
            <div className="flex flex-col gap-6">
              {/* Welcome */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Welcome, Webmaster!</h1>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-muted-foreground">
                    Here's what's happening with the organization today.
                  </p>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Read-only View
                  </Badge>
                </div>
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
                      Total Events
                    </CardTitle>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.totalEvents}</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                      <span className="text-blue-500 flex items-center mr-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {dashboardStats.activeEvents}
                      </span>
                      active right now
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      New Volunteers
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.newVolunteers}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Joined in the last 30 days
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Volunteer Hours
                    </CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardStats.volunteerHours}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total hours contributed
                    </p>
                  </CardContent>
                </Card>
              </div>
              {/* Upcoming Events */}
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Upcoming Events</CardTitle>
                    <CardDescription>
                      New and upcoming events that are scheduled
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleViewAllEvents}>View All</Button>
                </CardHeader>
                <CardContent>
                  {upcomingEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-8 w-8 mx-auto text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No upcoming events</h3>
                      <p className="text-gray-500 mt-1">There are no upcoming events scheduled at the moment.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {upcomingEvents.map((event, i) => (
                        <div key={event.id} className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div className="w-14 h-14 rounded-md bg-blue-100 text-blue-700 flex flex-col items-center justify-center text-sm font-medium">
                              {event.date.split(' ')[0]}
                              <span className="font-bold">{event.date.split(' ')[1].replace(',', '')}</span>
                            </div>
                            <div>
                              <h4 className="text-base font-semibold">{event.title}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <span>{event.location}</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => navigate(`/webmaster/events/${event.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Volunteers */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Volunteers</CardTitle>
                    <CardDescription>
                      Volunteers who joined recently
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleViewAllVolunteers}>View All</Button>
                </CardHeader>
                <CardContent>
                  {recentVolunteers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-8 w-8 mx-auto text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No recent volunteers</h3>
                      <p className="text-gray-500 mt-1">There are no new volunteers who have joined recently.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {recentVolunteers.map((volunteer) => (
                        <div key={volunteer.id} className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium">
                              {volunteer.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-base font-semibold">{volunteer.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <span>{volunteer.email}</span>
                                <span className="inline-block h-1 w-1 rounded-full bg-gray-400"></span>
                                <span>Joined {volunteer.joined}</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant={volunteer.status === 'active' ? 'secondary' : 'outline'}>
                            {volunteer.status === 'active' ? `${volunteer.events} events` : 'New volunteer'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <AccessibilityMenu />
    </div>
  );
};
