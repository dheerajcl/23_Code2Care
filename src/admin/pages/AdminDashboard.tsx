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
import { useAdminAuth } from '@/lib/authContext';
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
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { getDashboardStats, getEvents, getVolunteers } from '@/services/database.service';
import { supabase } from '@/lib/supabase';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, subMonths, eachMonthOfInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addWeeks, min, startOfDay, endOfDay, addDays } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  // State for dashboard data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalVolunteers: 0,
    totalEvents: 0,
    newVolunteers: 0,
    activeEvents: 0,
    volunteerHours: 0,
    hoursGrowthPercentage: 0
  });

  // State for charts data
  const [eventData, setEventData] = useState<Array<any>>([]);
  const [volunteerData, setVolunteerData] = useState<Array<any>>([]);
  const [skillDistribution, setSkillDistribution] = useState<Array<any>>([]);
  const [recentVolunteers, setRecentVolunteers] = useState<Array<any>>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Array<any>>([]);
  const [monthlyVolunteerData, setMonthlyVolunteerData] = useState([]); // Add state for monthly volunteer data
  const [monthlyVolunteerHoursData, setMonthlyVolunteerHoursData] = useState([]); // Add state for monthly volunteer hours data
  const [timeFrame, setTimeFrame] = useState<'12m' | '6m' | '3m' | 'custom'>('12m');
  const [customRange, setCustomRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [interval, setInterval] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [eventsData, setEventsData] = useState([]); // Add state to store events data
  const [volunteersData, setVolunteersData] = useState([]); // Add state to store volunteers data
  const [eventTimeFrame, setEventTimeFrame] = useState<'12m' | '6m' | '3m' | 'custom'>('12m');
  const [eventCustomRange, setEventCustomRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [eventInterval, setEventInterval] = useState<'monthly' | 'weekly' | 'daily'>('monthly');

  // Fetch dashboard data on component load
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard stats
        const stats = await getDashboardStats();
        if (stats.error) throw stats.error;

        // Fetch events
        const { data: events, error: eventsError } = await getEvents();
        if (eventsError) throw eventsError;
        setEventsData(events); // Store events data in state

        // Fetch volunteers
        const { data: volunteers, error: volunteersError } = await getVolunteers();
        if (volunteersError) throw volunteersError;
        setVolunteersData(volunteers); // Store volunteers data in state

        // Calculate total volunteer hours
        const volunteerHours = volunteers.reduce((sum, vol) => sum + (vol.hours || 0), 0);

        setDashboardStats({
          ...stats,
          volunteerHours,
        });

        // Process upcoming events
        const upcomingEvts = events
          .filter((event) => new Date(event.start_date) > new Date())
          .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
          .slice(0, 3)
          .map((event) => ({
            id: event.id,
            title: event.title,
            date: new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            location: event.location || 'N/A',
            volunteers: event.registered_count || 0,
            volunteerNeeded: event.max_volunteers| 0,
            status: 'Upcoming',
          }));

        setUpcomingEvents(upcomingEvts);
// Inside the fetchDashboardData function, after processing other data
const processRecentVolunteers = (volunteers) => {
  // Get the current time
  const now = new Date();
  
  // Filter volunteers who joined within the last 24 hours
  const recentVols = volunteers
    .filter(volunteer => {
      const joinedDate = new Date(volunteer.created_at);
      const hoursSinceJoining = (now.getTime() - joinedDate.getTime()) / (1000 * 60 * 60);
      return hoursSinceJoining <= 24;
    })
    .map(volunteer => ({
      id: volunteer.id,
      name: `${volunteer.first_name} ${volunteer.last_name}`,
      email: volunteer.email,
      skills: volunteer.skills || [],
      joined: format(new Date(volunteer.created_at), 'MMM dd, yyyy'),
      events: volunteer.events_attended || 0,
      status: volunteer.is_active ? 'active' : 'new'
    }))
    .slice(0, 5); // Limit to 5 most recent volunteers

  setRecentVolunteers(recentVols);
};

// Call this function after fetching volunteers
processRecentVolunteers(volunteers);
        // Process initial chart data
        processMonthlyEventData(events, timeFrame, interval);
        processMonthlyVolunteerData(volunteers, timeFrame, interval);
        processMonthlyVolunteerHoursData(volunteers, timeFrame, interval);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Only fetch data on initial load

  useEffect(() => {
    if (eventsData.length > 0) {
      processMonthlyEventData(eventsData, eventTimeFrame, eventInterval);
    }
  }, [eventsData, eventTimeFrame, eventInterval]); // Update event data when time frame or interval changes

  useEffect(() => {
    if (volunteersData.length > 0) {
      processMonthlyVolunteerData(volunteersData, timeFrame, interval);
      processMonthlyVolunteerHoursData(volunteersData, timeFrame, interval);
    }
  }, [volunteersData, timeFrame, interval]); // Update volunteer data when time frame or interval changes

  const processMonthlyEventData = (
    events,
    timeFrame = '12m',
    interval = 'monthly',
    customStart = null,
    customEnd = null
  ) => {
    let startDate, endDate;

    // Determine date range based on time frame
    endDate = new Date();

    switch (timeFrame) {
      case '3m':
        startDate = subMonths(endDate, 3);
        break;
      case '6m':
        startDate = subMonths(endDate, 6);
        break;
      case 'custom':
        startDate = customStart || subMonths(endDate, 12);
        endDate = customEnd || endDate;
        break;
      case '12m':
      default:
        startDate = subMonths(endDate, 12);
        break;
    }

    // Create array of time periods based on interval
    let periods = [];

    if (interval === 'monthly') {
      periods = eachMonthOfInterval({ start: startDate, end: endDate }).map(date => ({
        date,
        label: format(date, 'MMM yy'),
        start: startOfMonth(date),
        end: endOfMonth(date),
      }));
    } else if (interval === 'weekly') {
      let current = startOfWeek(startDate);
      while (current <= endDate) {
        const weekEnd = endOfWeek(current);
        periods.push({
          date: current,
          label: `${format(current, 'MMM d')} - ${format(min([weekEnd, endDate]), 'MMM d')}`,
          start: current,
          end: weekEnd,
        });
        current = addWeeks(current, 1);
      }
    } else if (interval === 'daily') {
      let current = startDate;
      while (current <= endDate) {
        periods.push({
          date: current,
          label: format(current, 'MMM d'),
          start: startOfDay(current),
          end: endOfDay(current),
        });
        current = addDays(current, 1);
      }
    }

    // Initialize data with all periods
    const processedData = periods.map(period => ({
      name: period.label,
      date: period.date,
      start: period.start,
      end: period.end,
      created: 0,
      completed: 0,
    }));

    // Count events per period
    events.forEach(event => {
      const eventCreatedDate = new Date(event.created_at);
      const eventEndDate = new Date(event.end_date);

      processedData.forEach(item => {
        if (eventCreatedDate >= item.start && eventCreatedDate <= item.end) {
          item.created += 1;
        }
        if (eventEndDate >= item.start && eventEndDate <= item.end && eventEndDate < new Date()) {
          item.completed += 1;
        }
      });
    });

    setEventData(processedData);
  };

  const processMonthlyVolunteerData = (
    volunteers,
    timeFrame = '12m',
    interval = 'monthly',
    customStart = null,
    customEnd = null
  ) => {
    let startDate, endDate;

    // Determine date range based on time frame
    endDate = new Date();

    switch (timeFrame) {
      case '3m':
        startDate = subMonths(endDate, 3);
        break;
      case '6m':
        startDate = subMonths(endDate, 6);
        break;
      case 'custom':
        startDate = customStart || subMonths(endDate, 12);
        endDate = customEnd || endDate;
        break;
      case '12m':
      default:
        startDate = subMonths(endDate, 12);
        break;
    }

    // Create array of time periods based on interval
    let periods = [];

    if (interval === 'monthly') {
      periods = eachMonthOfInterval({ start: startDate, end: endDate }).map(date => ({
        date,
        label: format(date, 'MMM yy'),
        start: startOfMonth(date),
        end: endOfMonth(date),
      }));
    } else if (interval === 'weekly') {
      let current = startOfWeek(startDate);
      while (current <= endDate) {
        const weekEnd = endOfWeek(current);
        periods.push({
          date: current,
          label: `${format(current, 'MMM d')} - ${format(min([weekEnd, endDate]), 'MMM d')}`,
          start: current,
          end: weekEnd,
        });
        current = addWeeks(current, 1);
      }
    } else if (interval === 'daily') {
      let current = startDate;
      while (current <= endDate) {
        periods.push({
          date: current,
          label: format(current, 'MMM d'),
          start: startOfDay(current),
          end: endOfDay(current),
        });
        current = addDays(current, 1);
      }
    }

    // Initialize data with all periods
    const processedData = periods.map(period => ({
      name: period.label,
      date: period.date,
      start: period.start,
      end: period.end,
      newVolunteers: 0,
      cumulativeVolunteers: 0,
    }));

    // Count volunteers per period
    let cumulativeCount = 0;

    volunteers.forEach(volunteer => {
      const volunteerCreatedDate = new Date(volunteer.created_at);

      processedData.forEach(item => {
        if (volunteerCreatedDate >= item.start && volunteerCreatedDate <= item.end) {
          item.newVolunteers += 1;
        }
      });
    });

    processedData.forEach(item => {
      cumulativeCount += item.newVolunteers;
      item.cumulativeVolunteers = cumulativeCount;
    });

    setMonthlyVolunteerData(processedData);
  };

  const processMonthlyVolunteerHoursData = (
    volunteers,
    timeFrame = '12m',
    interval = 'monthly',
    customStart = null,
    customEnd = null
  ) => {
    let startDate, endDate;

    // Determine date range based on time frame
    endDate = new Date();

    switch (timeFrame) {
      case '3m':
        startDate = subMonths(endDate, 3);
        break;
      case '6m':
        startDate = subMonths(endDate, 6);
        break;
      case 'custom':
        startDate = customStart || subMonths(endDate, 12);
        endDate = customEnd || endDate;
        break;
      case '12m':
      default:
        startDate = subMonths(endDate, 12);
        break;
    }

    // Create array of time periods based on interval
    let periods = [];

    if (interval === 'monthly') {
      periods = eachMonthOfInterval({ start: startDate, end: endDate }).map(date => ({
        date,
        label: format(date, 'MMM yy'),
        start: startOfMonth(date),
        end: endOfMonth(date),
      }));
    } else if (interval === 'weekly') {
      let current = startOfWeek(startDate);
      while (current <= endDate) {
        const weekEnd = endOfWeek(current);
        periods.push({
          date: current,
          label: `${format(current, 'MMM d')} - ${format(min([weekEnd, endDate]), 'MMM d')}`,
          start: current,
          end: weekEnd,
        });
        current = addWeeks(current, 1);
      }
    } else if (interval === 'daily') {
      let current = startDate;
      while (current <= endDate) {
        periods.push({
          date: current,
          label: format(current, 'MMM d'),
          start: startOfDay(current),
          end: endOfDay(current),
        });
        current = addDays(current, 1);
      }
    }

    // Initialize data with all periods
    const processedData = periods.map(period => ({
      name: period.label,
      date: period.date,
      start: period.start,
      end: period.end,
      volunteerHours: 0,
    }));

    // Count volunteer hours per period
    volunteers.forEach(volunteer => {
      const volunteerCreatedDate = new Date(volunteer.created_at);
      const hours = volunteer.hours || 0;

      processedData.forEach(item => {
        if (volunteerCreatedDate >= item.start && volunteerCreatedDate <= item.end) {
          item.volunteerHours += hours;
        }
      });
    });

    setMonthlyVolunteerHoursData(processedData);
  };

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
                      <span className={`${dashboardStats.hoursGrowthPercentage >= 0 ? "text-green-500" : "text-red-500"} flex items-center mr-1`}>
                        {dashboardStats.hoursGrowthPercentage >= 0 ? 
                          <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        }
                        {Math.abs(dashboardStats.hoursGrowthPercentage)}%
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
                    <span className={`${dashboardStats.newVolunteers > 0 ? "text-green-500" : "text-red-500"} flex items-center mr-1`}>
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
                      Events created and completed over the selected time frame and interval
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="event-time-frame">Time Frame:</Label>
                        <Select
                          value={eventTimeFrame}
                          onValueChange={(value) => {
                            setEventTimeFrame(value as any);
                            processMonthlyEventData(
                              eventsData,
                              value as any,
                              eventInterval,
                              eventCustomRange.start,
                              eventCustomRange.end
                            );
                          }}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select time frame" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12m">Last 12 Months</SelectItem>
                            <SelectItem value="6m">Last 6 Months</SelectItem>
                            <SelectItem value="3m">Last 3 Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {eventTimeFrame === 'custom' && (
                        <div className="flex items-center space-x-2">
                          <Label>Custom Range:</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-[240px] justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {eventCustomRange.start ? (
                                  eventCustomRange.end ? (
                                    <>
                                      {format(eventCustomRange.start, 'MMM dd, yyyy')} -{' '}
                                      {format(eventCustomRange.end, 'MMM dd, yyyy')}
                                    </>
                                  ) : (
                                    format(eventCustomRange.start, 'MMM dd, yyyy')
                                  )
                                ) : (
                                  <span>Pick a date range</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="range"
                                selected={{
                                  from: eventCustomRange.start || undefined,
                                  to: eventCustomRange.end || undefined,
                                }}
                                onSelect={(range) => {
                                  if (range?.from && range?.to) {
                                    setEventCustomRange({
                                      start: range.from,
                                      end: range.to,
                                    });
                                    processMonthlyEventData(
                                      eventsData,
                                      'custom',
                                      eventInterval,
                                      range.from,
                                      range.to
                                    );
                                  }
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Label htmlFor="event-interval">Interval:</Label>
                        <Select
                          value={eventInterval}
                          onValueChange={(value) => {
                            setEventInterval(value as any);
                            processMonthlyEventData(
                              eventsData,
                              eventTimeFrame,
                              value as any,
                              eventTimeFrame === 'custom' ? eventCustomRange.start : undefined,
                              eventTimeFrame === 'custom' ? eventCustomRange.end : undefined
                            );
                          }}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Select interval" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={eventData}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="created" name="Events Created" fill="#8884d8" />
                          <Bar dataKey="completed" name="Events Completed" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Volunteer Growth</CardTitle>
                    <CardDescription>
                      Cumulative and new volunteers over the selected time frame and interval
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="time-frame">Time Frame:</Label>
                        <Select
                          value={timeFrame}
                          onValueChange={(value) => {
                            setTimeFrame(value as any);
                            processMonthlyVolunteerData(
                              monthlyVolunteerData,
                              value as any,
                              interval
                            );
                          }}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select time frame" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12m">Last 12 Months</SelectItem>
                            <SelectItem value="6m">Last 6 Months</SelectItem>
                            <SelectItem value="3m">Last 3 Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {timeFrame === 'custom' && (
                        <div className="flex items-center space-x-2">
                          <Label>Custom Range:</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-[240px] justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {customRange.start ? (
                                  customRange.end ? (
                                    <>
                                      {format(customRange.start, 'MMM dd, yyyy')} -{' '}
                                      {format(customRange.end, 'MMM dd, yyyy')}
                                    </>
                                  ) : (
                                    format(customRange.start, 'MMM dd, yyyy')
                                  )
                                ) : (
                                  <span>Pick a date range</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="range"
                                selected={{
                                  from: customRange.start || undefined,
                                  to: customRange.end || undefined,
                                }}
                                onSelect={(range) => {
                                  if (range?.from && range?.to) {
                                    setCustomRange({
                                      start: range.from,
                                      end: range.to,
                                    });
                                    processMonthlyVolunteerData(
                                      monthlyVolunteerData,
                                      'custom',
                                      interval,
                                      range.from,
                                      range.to
                                    );
                                  }
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Label htmlFor="interval">Interval:</Label>
                        <Select
                          value={interval}
                          onValueChange={(value) => {
                            setInterval(value as any);
                            processMonthlyVolunteerData(
                              monthlyVolunteerData,
                              timeFrame,
                              value as any,
                              timeFrame === 'custom' ? customRange.start : undefined,
                              timeFrame === 'custom' ? customRange.end : undefined
                            );
                          }}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Select interval" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyVolunteerData}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="cumulativeVolunteers"
                            name="Total Volunteers"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="newVolunteers"
                            name="New Volunteers"
                            stroke="#82ca9d"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Volunteer Hours Growth</CardTitle>
                    <CardDescription>
                      Total volunteer hours over the selected time frame and interval
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="time-frame">Time Frame:</Label>
                        <Select
                          value={timeFrame}
                          onValueChange={(value) => {
                            setTimeFrame(value as any);
                            processMonthlyVolunteerHoursData(
                              monthlyVolunteerHoursData,
                              value as any,
                              interval
                            );
                          }}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select time frame" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12m">Last 12 Months</SelectItem>
                            <SelectItem value="6m">Last 6 Months</SelectItem>
                            <SelectItem value="3m">Last 3 Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {timeFrame === 'custom' && (
                        <div className="flex items-center space-x-2">
                          <Label>Custom Range:</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-[240px] justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {customRange.start ? (
                                  customRange.end ? (
                                    <>
                                      {format(customRange.start, 'MMM dd, yyyy')} -{' '}
                                      {format(customRange.end, 'MMM dd, yyyy')}
                                    </>
                                  ) : (
                                    format(customRange.start, 'MMM dd, yyyy')
                                  )
                                ) : (
                                  <span>Pick a date range</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="range"
                                selected={{
                                  from: customRange.start || undefined,
                                  to: customRange.end || undefined,
                                }}
                                onSelect={(range) => {
                                  if (range?.from && range?.to) {
                                    setCustomRange({
                                      start: range.from,
                                      end: range.to,
                                    });
                                    processMonthlyVolunteerHoursData(
                                      monthlyVolunteerHoursData,
                                      'custom',
                                      interval,
                                      range.from,
                                      range.to
                                    );
                                  }
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Label htmlFor="interval">Interval:</Label>
                        <Select
                          value={interval}
                          onValueChange={(value) => {
                            setInterval(value as any);
                            processMonthlyVolunteerHoursData(
                              monthlyVolunteerHoursData,
                              timeFrame,
                              value as any,
                              timeFrame === 'custom' ? customRange.start : undefined,
                              timeFrame === 'custom' ? customRange.end : undefined
                            );
                          }}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Select interval" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyVolunteerHoursData}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="volunteerHours"
                            name="Volunteer Hours"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
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
      <AccessibilityMenu/>
    </div>
  );
};

export default AdminDashboard;