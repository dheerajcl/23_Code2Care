import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebmasterAuth } from '@/lib/authContext';
import { WebmasterHeader } from '../components/WebmasterHeader';
import { WebmasterSidebar } from '../components/WebmasterSidebar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  startOfWeek,
  endOfWeek,
  addWeeks,
  startOfDay,
  endOfDay,
  addDays,
  min,
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { 
  Bar, 
  BarChart, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  PieChart, 
  Pie, 
  Cell, 
  Legend
} from 'recharts';
import {
  CalendarIcon,
  Users,
  Clock,
  ArrowUpRight,
  Download
} from 'lucide-react';
import { getEvents, getVolunteers, getDashboardStats,getAllTasks,  getTaskAssignmentsWithDetails, getEventRegistrations, getTasksByEventId } from '@/services/database.service';
// import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';

export const WebmasterReports: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useWebmasterAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Report data
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    totalEvents: 0,
    newVolunteers: 0,
    activeEvents: 0,
    volunteerHours: 0,
    completedEvents: 0
  });
  
  // Charts data
  const [monthlyEventData, setMonthlyEventData] = useState([]);
  const [monthlyVolunteerData, setMonthlyVolunteerData] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [skillsDistribution, setSkillsDistribution] = useState([]);
  const [locationDistribution, setLocationDistribution] = useState([]);
  const [timeFrame, setTimeFrame] = useState<'12m' | '6m' | '3m' | 'custom'>('12m');
const [customRange, setCustomRange] = useState<{
  start: Date | null;
  end: Date | null;
}>({ start: null, end: null });
const [interval, setInterval] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
const [eventsData, setEventsData] = useState([]); // Add state to store events data
const [volunteersData, setVolunteersData] = useState([]); // Add state to store volunteers data
const [ageHistogramData, setAgeHistogramData] = useState([]); // State for age histogram data
const [ageInterval, setAgeInterval] = useState(5); // State for histogram interval
const [averageTasksAssigned, setAverageTasksAssigned] = useState(0);
const [averageEventsParticipated, setAverageEventsParticipated] = useState(0);
const [averageTasksCompleted, setAverageTasksCompleted] = useState(0);
const [averageEventCompletionRate, setAverageEventCompletionRate] = useState(0);
  // Constants for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];
  
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const dashboardStats = await getDashboardStats();
        if (dashboardStats.error) throw dashboardStats.error;
        
        // Fetch events data
        const { data: events, error: eventsError } = await getEvents();
        if (eventsError) throw eventsError;
        setEventsData(events); // Store events data in state
        
        // Fetch volunteers data
        const { data: volunteers, error: volunteersError } = await getVolunteers();
        if (volunteersError) throw volunteersError;
        setVolunteersData(volunteers); // Store volunteers data in state
        
        // Process stats
        const completedEvents = events.filter(event => 
          new Date(event.end_date) < new Date()
        ).length;
        
        setStats({
          ...dashboardStats,
          completedEvents,
          volunteerHours: volunteers.reduce((sum, vol) => sum + (vol.hours || 0), 0)
        });
        
        // Process monthly event data (past 12 months)
        processMonthlyEventData(events);
        
        // Process monthly volunteer data
        processMonthlyVolunteerData(volunteers);
        
        // Process category distribution
        processCategoryDistribution(events);
        
        // Process skills distribution
        processSkillsDistribution(volunteers);
        
        // Process location distribution
        processLocationDistribution(volunteers);
        
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError(err.message);
        toast({
          title: 'Error',
          description: 'Failed to load report data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, []);
  
  useEffect(() => {
    const fetchVolunteerMetrics = async () => {
      try {
        // Fetch task assignments to calculate average tasks assigned
        const { data: taskAssignments } = await getTaskAssignmentsWithDetails();
        const uniqueVolunteersAssigned = new Set(
          taskAssignments.map((assignment) => assignment.volunteer_id)
        ).size;
        const avgTasksAssigned =
          uniqueVolunteersAssigned > 0
            ? taskAssignments.length / uniqueVolunteersAssigned
            : 0;

        // Fetch event signups to calculate average events participated
        const { data: eventSignups } = await supabase
          .from('event_signup')
          .select('volunteer_id, event_id');
        const uniqueVolunteersRegistered = new Set(
          eventSignups.map((signup) => signup.volunteer_id)
        ).size;
        const avgEventsParticipated =
          uniqueVolunteersRegistered > 0
            ? eventSignups.length / uniqueVolunteersRegistered
            : 0;

        // Fetch task assignments to calculate average tasks completed
        const completedTasks = taskAssignments.filter(
          (assignment) => assignment.status === 'completed'
        ).length;
        const avgTasksCompleted =
          uniqueVolunteersAssigned > 0
            ? completedTasks / uniqueVolunteersAssigned
            : 0;

        // Calculate average event completion rate
        const { data: events } = await getEvents();
        const completedEvents = events.filter(
          (event) => event.status === 'Completed'
        ).length;
        const avgEventCompletionRate =
          events.length > 0
            ? (completedEvents / events.length) * 100
            : 0;

        setAverageTasksAssigned(avgTasksAssigned);
        setAverageEventsParticipated(avgEventsParticipated);
        setAverageTasksCompleted(avgTasksCompleted);
        setAverageEventCompletionRate(avgEventCompletionRate);
      } catch (error) {
        console.error('Error fetching volunteer metrics:', error);
        toast({
          title: 'Error',
          description: 'Failed to load volunteer metrics',
          variant: 'destructive',
        });
      }
    };

    fetchVolunteerMetrics();
  }, []);

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
      // Create weekly periods
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
      // Create daily periods (for small date ranges)
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
    const processedData = periods.map(period => {
      return {
        name: period.label,
        date: period.date,
        start: period.start,
        end: period.end,
        created: 0,
        completed: 0,
      };
    });
    
    // Count events per period
    events.forEach(event => {
      const eventStartDate = new Date(event.start_date);
      const eventEndDate = new Date(event.end_date);
      const eventCreatedDate = new Date(event.created_at);
      
      processedData.forEach(item => {
        // Count events created in this period
        if (
          eventCreatedDate >= item.start &&
          eventCreatedDate <= item.end
        ) {
          item.created += 1;
        }
        
        // Count events completed in this period
        if (
          eventEndDate >= item.start &&
          eventEndDate <= item.end &&
          eventEndDate < new Date() // Only count past events
        ) {
          item.completed += 1;
        }
      });
    });
    
    setMonthlyEventData(processedData);
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
      // Create weekly periods
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
      // Create daily periods (for small date ranges)
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
    const processedData = periods.map(period => {
      return {
        name: period.label,
        date: period.date,
        start: period.start,
        end: period.end,
        newVolunteers: 0,
        cumulativeVolunteers: 0,
      };
    });
    
    // Count volunteers per period
    let cumulativeCount = 0;
    
    volunteers.forEach(volunteer => {
      const volunteerCreatedDate = new Date(volunteer.created_at);
      
      processedData.forEach(item => {
        // Count new volunteers in this period
        if (
          volunteerCreatedDate >= item.start &&
          volunteerCreatedDate <= item.end
        ) {
          item.newVolunteers += 1;
        }
      });
    });
    
    // Calculate cumulative volunteers
    processedData.forEach(item => {
      cumulativeCount += item.newVolunteers;
      item.cumulativeVolunteers = cumulativeCount;
    });
    
    setMonthlyVolunteerData(processedData);
  };
  
  const processCategoryDistribution = (events) => {
    const categories = {};
    
    events.forEach(event => {
      const category = event.category || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    const categoryData = Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    setCategoryDistribution(categoryData);
  };
  
  const processSkillsDistribution = (volunteers) => {
    const skills = {};
    
    volunteers.forEach(volunteer => {
      if (volunteer.skills) {
        const skillsArray = Array.isArray(volunteer.skills) 
          ? volunteer.skills 
          : typeof volunteer.skills === 'string'
            ? volunteer.skills.split(',').map(s => s.trim())
            : [];
        
        skillsArray.forEach(skill => {
          if (skill) {
            skills[skill] = (skills[skill] || 0) + 1;
          }
        });
      }
    });
    
    const skillsData = Object.entries(skills)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7); // Limit to top 7 skills
    
    setSkillsDistribution(skillsData);
  };
  
  const processLocationDistribution = (volunteers) => {
    const locations = {};
    
    volunteers.forEach(volunteer => {
      const location = volunteer.city || 'Unknown';
      locations[location] = (locations[location] || 0) + 1;
    });
    
    const locationData = Object.entries(locations)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7); // Limit to top 7 locations
    
    setLocationDistribution(locationData);
  };
  
  const processAgeHistogramData = (volunteers, interval = 5) => {
    const currentYear = new Date().getFullYear();
    const ageCounts = {};
  
    volunteers.forEach((volunteer) => {
      if (volunteer.dob) {
        const birthYear = new Date(volunteer.dob).getFullYear();
        const age = currentYear - birthYear;
        const rangeStart = Math.floor(age / interval) * interval;
        const rangeLabel = `${rangeStart}-${rangeStart + interval - 1}`;
        ageCounts[rangeLabel] = (ageCounts[rangeLabel] || 0) + 1;
      }
    });
  
    const histogramData = Object.entries(ageCounts)
      .map(([range, count]) => ({ range, count }))
      .sort((a, b) => parseInt(a.range.split('-')[0]) - parseInt(b.range.split('-')[0]));
  
    setAgeHistogramData(histogramData);
  };
  
  useEffect(() => {
    if (volunteersData.length > 0) {
      processAgeHistogramData(volunteersData, ageInterval);
    }
  }, [volunteersData, ageInterval]);
  
  if (loading) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        <WebmasterHeader />
        <div className="flex flex-1 overflow-hidden">
          <WebmasterSidebar />
          <main className="flex-1 overflow-auto p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading report data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        <WebmasterHeader />
        <div className="flex flex-1 overflow-hidden">
          <WebmasterSidebar />
          <main className="flex-1 overflow-auto p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <WebmasterHeader />
      <div className="flex flex-1 overflow-hidden">
        <WebmasterSidebar />
        <main className="flex-1 overflow-auto p-8">
          <div className="container mx-auto max-w-7xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-500">View detailed statistics and insights</p>
              </div>
              
              <Button variant="outline" className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export Reports
              </Button>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Volunteers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalVolunteers}</div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <span className="text-green-500 flex items-center mr-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {stats.newVolunteers}
                    </span>
                    new this month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalEvents}</div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <span className="text-green-500 flex items-center mr-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {stats.completedEvents}
                    </span>
                    completed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Active Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeEvents}</div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <span className="text-green-500 flex items-center mr-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {Math.round((stats.activeEvents / stats.totalEvents) * 100) || 0}%
                    </span>
                    of total events
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Volunteer Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.volunteerHours}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Total hours contributed
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Tabs for different report views */}
            <Tabs defaultValue="trend" className="mb-8">
              <TabsList className="mb-4 grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="trend">Trends</TabsTrigger>
                <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </TabsList>
              
              {/* Trend Reports */}
              <TabsContent value="trend">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Monthly Event Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Event Trend</CardTitle>
                      <CardDescription>
                        Events created and completed over the past {timeFrame}onths and {interval} intervals
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

          processMonthlyEventData(eventsData, value as any, interval);
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
                // Trigger data refresh with custom range
                processMonthlyEventData(
                  eventsData,
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
        // Trigger data refresh with new interval
        processMonthlyEventData(
          eventsData,
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
                          <BarChart data={monthlyEventData}>
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
                  
                  {/* Volunteer Growth */}
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
                                volunteersData, // Ensure this state is added and populated
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
                                        volunteersData,
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
                                volunteersData,
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
                </div>
              </TabsContent>
              
              {/* Volunteer Reports */}
              <TabsContent value="volunteers">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Volunteer Skills Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Volunteer Skills Distribution</CardTitle>
                      <CardDescription>
                        Top skills among volunteers
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={skillsDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {skillsDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Volunteer Location Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Volunteer Location Distribution</CardTitle>
                      <CardDescription>
                        Where volunteers are located
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={locationDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {locationDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Volunteer Age Histogram */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Volunteer Age Distribution</CardTitle>
                      <CardDescription>
                        Histogram of volunteer ages. Adjust the interval to change the range.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2 mb-4">
                        <Label htmlFor="age-interval">Age Interval:</Label>
                        <input
                          type="number"
                          id="age-interval"
                          value={ageInterval}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (value > 0) setAgeInterval(value); // Ensure the interval is positive
                          }}
                          className="w-[100px] border border-gray-300 rounded px-2 py-1"
                          min="1"
                        />
                      </div>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={ageHistogramData}>
                            <XAxis dataKey="range" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" name="Volunteers" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Volunteer Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Volunteer Metrics</CardTitle>
                      <CardDescription>
                        Key averages for volunteer participation and task completion
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Avg. Tasks Assigned</span>
                          <span className="text-lg font-bold">{averageTasksAssigned.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Avg. Events Participated</span>
                          <span className="text-lg font-bold">{averageEventsParticipated.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Avg. Tasks Completed</span>
                          <span className="text-lg font-bold">{averageTasksCompleted.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Avg. Event Completion Rate</span>
                          <span className="text-lg font-bold">{(averageTasksCompleted.toFixed(2)/averageTasksAssigned.toFixed(2)*100).toFixed(2)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Event Reports */}
              <TabsContent value="events">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Event Category Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Event Category Distribution</CardTitle>
                      <CardDescription>
                        Events by category
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {categoryDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Event Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Event Status Summary</CardTitle>
                      <CardDescription>
                        Overview of event statuses
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Completed Events</span>
                            <span className="text-sm text-gray-500">
                              {stats.completedEvents} of {stats.totalEvents}
                            </span>
                          </div>
                          <Progress 
                            value={(stats.completedEvents / stats.totalEvents) * 100} 
                            className="h-2" 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Active Events</span>
                            <span className="text-sm text-gray-500">
                              {stats.activeEvents} of {stats.totalEvents}
                            </span>
                          </div>
                          <Progress 
                            value={(stats.activeEvents / stats.totalEvents) * 100} 
                            className="h-2" 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Upcoming Events</span>
                            <span className="text-sm text-gray-500">
                              {stats.totalEvents - stats.activeEvents - stats.completedEvents} of {stats.totalEvents}
                            </span>
                          </div>
                          <Progress 
                            value={((stats.totalEvents - stats.activeEvents - stats.completedEvents) / stats.totalEvents) * 100} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Historical Summary */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Historical Summary</CardTitle>
                <CardDescription>
                  Key metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-gray-200">
                        <th className="pb-2 font-medium text-sm text-gray-500">Month</th>
                        <th className="pb-2 font-medium text-sm text-gray-500">Events Created</th>
                        <th className="pb-2 font-medium text-sm text-gray-500">Events Completed</th>
                        <th className="pb-2 font-medium text-sm text-gray-500">New Volunteers</th>
                        <th className="pb-2 font-medium text-sm text-gray-500">Total Volunteers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyEventData.map((item, index) => (
                        <tr key={item.name} className="border-b border-gray-100">
                          <td className="py-3 text-sm font-medium">{item.name}</td>
                          <td className="py-3 text-sm">{item.created}</td>
                          <td className="py-3 text-sm">{item.completed}</td>
                          <td className="py-3 text-sm">{monthlyVolunteerData[index]?.newVolunteers || 0}</td>
                          <td className="py-3 text-sm">{monthlyVolunteerData[index]?.cumulativeVolunteers || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
      <AccessibilityMenu />
    </div>
  );
};