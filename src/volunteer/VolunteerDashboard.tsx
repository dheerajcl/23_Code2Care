import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  Clock, 
  MapPin, 
  MenuIcon, 
  LogOut, 
  User, 
  Settings,
  ChevronDown,
  CheckCircle,
  Calendar,
  Award,
  BarChart3,
  Home,
  Users,
  BookOpen,
  ExternalLink
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
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { Bar, BarChart, ResponsiveContainer } from 'recharts';
import { Leaderboard } from '@/components/Leaderboard';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import LandingHeader from '@/components/LandingHeader';
import { getEvents } from '@/services/database.service';
import { toast } from 'sonner';
import Chatbot from "@/components/chatbot";

export const assignedTasks = [
  {
    id: '1',
    eventId: '1',
    eventTitle: 'Digital Literacy Workshop',
    title: 'Setup equipment',
    description: 'Setup computers and assistive technology devices',
    date: 'Aug 15, 2023',
    time: '9:00 AM - 10:00 AM',
    status: 'upcoming'
  },
  {
    id: '2',
    eventId: '1',
    eventTitle: 'Digital Literacy Workshop',
    title: 'Teaching assistance',
    description: 'Help participants with hands-on exercises',
    date: 'Aug 15, 2023',
    time: '10:00 AM - 1:00 PM',
    status: 'upcoming'
  },
  {
    id: '3',
    eventId: '4',
    eventTitle: 'Blind Cricket Workshop',
    title: 'Equipment management',
    description: 'Manage and distribute cricket equipment to participants',
    date: 'Jul 25, 2023',
    time: '9:00 AM - 12:00 PM',
    status: 'completed'
  },
];

const badges = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Completed your first volunteer activity',
    icon: '🌱',
    date: 'Jul 25, 2023',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
  },
  {
    id: '2',
    name: 'Tech Helper',
    description: 'Assisted in a technology-based volunteer event',
    icon: '💻',
    date: 'Jul 25, 2023',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
  },
  {
    id: '3',
    name: 'Early Bird',
    description: 'Arrived early and helped with setup',
    icon: '🐦',
    date: 'Jul 25, 2023',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
  },
];

const volunteerStats = [
  {
    name: 'Events',
    value: 1,
    target: 10,
    progress: 10,
    icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
  },
  {
    name: 'Hours',
    value: 5,
    target: 50,
    progress: 10,
    icon: <Clock className="h-4 w-4 text-muted-foreground" />,
  },
  {
    name: 'Badges',
    value: 3,
    target: 10,
    progress: 30,
    icon: <Award className="h-4 w-4 text-muted-foreground" />,
  },
  {
    name: 'Skills',
    value: 2,
    target: 5,
    progress: 40,
    icon: <BookOpen className="h-4 w-4 text-muted-foreground" />,
  },
];

const activityData = [
  { name: 'Jun', hours: 0 },
  { name: 'Jul', hours: 5 },
  { name: 'Aug', hours: 0 },
  { name: 'Sep', hours: 0 },
  { name: 'Oct', hours: 0 },
  { name: 'Nov', hours: 0 },
];

const feedbackData = [
  {
    id: '1',
    eventTitle: 'Blind Cricket Workshop',
    date: 'Jul 25, 2023',
    comment: 'Great enthusiasm and very helpful with the participants. Good communication skills.',
    rating: 5,
  },
];

export const VolunteerDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Fetch events from the database
        const { data, error } = await getEvents();
        
        if (error) throw error;
        
        // Filter for upcoming events (where end_date is in the future)
        const now = new Date();
        const filtered = data.filter(event => {
          const endDate = new Date(event.end_date);
          return endDate >= now;
        });
        
        // Sort by start date ascending (soonest first)
        filtered.sort((a, b) => {
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        });
        
        // Take only the first 3 for display
        setUpcomingEvents(filtered.slice(0, 3));
      } catch (error) {
        console.error('Error fetching upcoming events:', error);
        toast.error('Failed to load upcoming events');
        setUpcomingEvents([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
    const handleLogout = async () => {
      await logout();
      // Redirect is handled by the auth context
    };
  
  
  return (
    <div className="h-screen bg-gray-100 flex flex-col vol-dashboard">
      <Header/>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto pt-28 p-8">
          <div className="container mx-auto px-4 lg:px-2">
          <div className="flex flex-col gap-6">
              {/* Welcome */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Welcome, {user?.firstName}!</h1>
                <p className="text-muted-foreground">
                  Your volunteering dashboard at Samarthanam Trust.
                </p>
              </div>

              {/* Stats Overview */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {volunteerStats.map((stat) => (
                  <Card key={stat.name}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.name}
                      </CardTitle>
                      {stat.icon}
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value} <span className="text-sm font-normal text-muted-foreground">/ {stat.target}</span></div>
                      <div className="mt-3">
                        <div className="text-xs text-muted-foreground mb-1 flex justify-between">
                          <span>Progress</span>
                          <span>{stat.progress}%</span>
                        </div>
                        <Progress value={stat.progress} max={100} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Leaderboard Section */}
              <div className="w-full">
                <Leaderboard />
              </div>

              {/* Upcoming Events Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Upcoming Events</h2>
                  <Button variant="outline" asChild>
                    <Link to="/volunteer/events">
                      View All Events
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
                
                {loading ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((placeholder) => (
                      <Card key={placeholder} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                          <div className="space-y-2 mt-2">
                            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </CardHeader>
                        <CardFooter className="flex justify-between pb-3">
                          <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-5 w-1/4 bg-gray-200 rounded animate-pulse"></div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : upcomingEvents.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingEvents.map((event) => (
                      <Card key={event.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <CardDescription>
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{new Date(event.start_date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{new Date(event.start_date).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: 'numeric', 
                                hour12: true 
                              })} - {new Date(event.end_date).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: 'numeric', 
                                hour12: true 
                              })}</span>
                            </div>
                            <div className="flex items-start gap-1 mt-1">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                              <span>{event.location}</span>
                            </div>
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-between pb-3">
                          <Badge variant={event.status === 'registered' ? 'default' : 'outline'}>
                            {event.status === 'Active' ? 'Upcoming' : event.status}
                          </Badge>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/volunteer/events/${event.id}`}>
                            Details
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                    <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">No upcoming events</p>
                      <p className="text-sm text-muted-foreground mb-4 text-center">
                        There are no upcoming events scheduled at the moment.
                      </p>
                      <Button variant="outline" asChild>
                        <Link to="/volunteer/events">
                          Browse All Events
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
              <div className="h-screen bg-gray-100 flex flex-col vol-dashboard">
      
          <Chatbot />  {/* ✅ Add Chatbot here */}
        
      
    </div>
            </div>
          </div>
        </main>
      </div>
      <AccessibilityMenu/>
    </div>
    
  );
};

export default VolunteerDashboard; 