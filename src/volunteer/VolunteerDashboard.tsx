import React, { useState, useEffect, Suspense } from 'react';
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
  ExternalLink,
  Edit2
} from 'lucide-react';
import { useVolunteerAuth } from '@/lib/authContext';
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
import { getEvents, getTasksForVolunteer } from '@/services/database.service';
import { notificationService } from '@/services/notification.service';
import { toast } from 'sonner';
import Chatbot from "@/components/chatbot";
import { ErrorBoundary } from 'react-error-boundary';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { updateVolunteer } from '@/services/database.service';
import { supabase } from '@/lib/supabase'; // Import supabase


const getEventSignupCountForVolunteer = async (volunteerId: string) => {
  try {
    const { count, error } = await supabase
      .from('event_signup')
      .select('*', { count: 'exact' })
      .eq('volunteer_id', volunteerId);

    if (error) {
      console.error('Error fetching event signup count:', error);
      throw error;
    }

    return { count };
  } catch (error) {
    console.error('Error in getEventSignupCountForVolunteer:', error);
    return { count: 0, error };
  }
};

const getVolunteerPoints = async (volunteerId: string) => {
  try {
    const { data, error } = await supabase
      .from('points')
      .select('points')
      .eq('volunteer_id', volunteerId);

    if (error) {
      console.error('Error fetching volunteer points:', error);
      throw error;
    }

    const totalPoints = data?.reduce((sum, record) => sum + (record.points || 0), 0) || 0;
    return { totalPoints };
  } catch (error) {
    console.error('Error in getVolunteerPoints:', error);
    return { totalPoints: 0, error };
  }
};

const getPendingTasksCount = async (volunteerId: string) => {
  try {
    const { count, error } = await supabase
      .from('task_assignment')
      .select('*', { count: 'exact' })
      .eq('volunteer_id', volunteerId)
      .in('status', ['accepted', 'pending']);

    if (error) {
      console.error('Error fetching pending tasks count:', error);
      throw error;
    }

    return { count };
  } catch (error) {
    console.error('Error in getPendingTasksCount:', error);
    return { count: 0, error };
  }
};

const getVolunteerInterests = async (volunteerId: string) => {
  try {
    const { data, error } = await supabase
      .from('volunteer')
      .select('interests')
      .eq('id', volunteerId);

    if (error) {
      console.error('Error fetching volunteer interests:', error);
      throw error;
    }

    // Parse interests as an array
    const interests = data?.[0]?.interests
      ? Array.isArray(data[0].interests)
        ? data[0].interests
        : data[0].interests.split(',').map((interest: string) => interest.trim())
      : [];

    return { interests };
  } catch (error) {
    console.error('Error in getVolunteerInterests:', error);
    return { interests: [], error };
  }
};

export const VolunteerDashboard = () => {
  const { user, logout, setUser } = useVolunteerAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [participatedEventsCount, setParticipatedEventsCount] = useState(0); // State for participated events count
  const [volunteerPoints, setVolunteerPoints] = useState(0); // State for volunteer points
  const [pendingTasksCount, setPendingTasksCount] = useState(0); // State for pending tasks count
  const [volunteerInterests, setVolunteerInterests] = useState<string[]>([]); // State for volunteer interests
  const location = useLocation();
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);
  
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch upcoming events
      const { data: events } = await getEvents();
      if (events) {
        // Get all events sorted by start date (most recent first)
        const upcoming = events
          .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
          .slice(0, 3); // Get only 3 events
        setUpcomingEvents(upcoming);
      }
      
      // Fetch notifications
      if (user?.id) {
        const { data: notificationData } = await notificationService.getVolunteerNotifications(user.id);
        setNotifications(notificationData || []);
      }

      // Fetch participated events count
      if (user?.id) {
        const { count, error: countError } = await getEventSignupCountForVolunteer(user.id);
        if (countError) throw countError;
        setParticipatedEventsCount(count || 0);

        // Fetch volunteer points
        const { totalPoints, error: pointsError } = await getVolunteerPoints(user.id);
        if (pointsError) throw pointsError;
        setVolunteerPoints(totalPoints || 0);

        // Fetch pending tasks count
        const { count: pendingCount, error: tasksError } = await getPendingTasksCount(user.id);
        if (tasksError) throw tasksError;
        setPendingTasksCount(pendingCount || 0);

        // Fetch volunteer interests
        const { interests, error: interestsError } = await getVolunteerInterests(user.id);
        if (interestsError) throw interestsError;
        setVolunteerInterests(interests || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    await logout();
    // Redirect is handled by the auth context
  };
  
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!user?.id) return;
    
    try {
      setIsSaving(true);
      
      // Update the volunteer in the database
      const { data, error } = await updateVolunteer(user.id, {
        first_name: firstName,
        last_name: lastName
      });
      
      if (error) {
        throw error;
      }
      
      // Update the user in context and localStorage
      if (data) {
        const updatedUser = {
          ...user,
          firstName: firstName,
          lastName: lastName,
          first_name: firstName,
          last_name: lastName
        };
        
        setUser(updatedUser);
        
        toast.success('Profile updated successfully');
        setIsEditProfileOpen(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Welcome, {user?.firstName}!</h1>
                  <p className="text-muted-foreground">
                    Your volunteering dashboard at Samarthanam Trust.
                  </p>
                </div>
                
                <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex gap-2">
                      <Edit2 className="h-4 w-4" />
                      <span className="hidden md:inline">Edit Profile</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleUpdateProfile}>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                          Update your profile information below.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="py-4 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input 
                            id="firstName" 
                            value={firstName} 
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First Name"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input 
                            id="lastName" 
                            value={lastName} 
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last Name"
                            required
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsEditProfileOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Stats Overview */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Participated Events</CardTitle>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{participatedEventsCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total events you have participated in</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Points</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{volunteerPoints}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total points earned</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {pendingTasksCount > 0 ? 'Complete Pending Tasks' : 'No tasks currently'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pendingTasksCount > 0
                        ? `${pendingTasksCount} task(s) pending`
                        : 'You have no pending tasks'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Interests</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {volunteerInterests.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {volunteerInterests.map((interest, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            {interest}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No interests added</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Leaderboard Section */}
              <div className="w-full">
                <Suspense fallback={
                  <Card>
                    <CardContent className="py-8 text-center">
                      <div className="flex justify-center items-center flex-col">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                        <p className="text-sm text-muted-foreground">Loading leaderboard...</p>
                      </div>
                    </CardContent>
                  </Card>
                }>
                  <Leaderboard />
                </Suspense>
              </div>

              {/* Upcoming Events Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Upcoming Events</h2>
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
                          {/* <Button variant="ghost" size="sm" asChild>
                            <Link to={`/volunteer/events/${event.id}`}>
                            Details
                            </Link>
                          </Button> */}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                    <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">No upcoming events</p>
                      <div className="text-sm text-muted-foreground mb-4 text-center">
                        There are no upcoming events scheduled at the moment.
                      </div>
                      <Button variant="outline" asChild>
                        <Link to="/volunteer/events">
                          Browse All Events
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
              <div className="flex-grow mt-6">
                <Chatbot />        
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