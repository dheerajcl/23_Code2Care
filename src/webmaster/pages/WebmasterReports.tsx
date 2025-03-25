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
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
import { getEvents, getVolunteers, getDashboardStats } from '@/services/database.service';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import AccessibilityMenu from '@/components/AccessibilityMenu';

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
        
        // Fetch volunteers data
        const { data: volunteers, error: volunteersError } = await getVolunteers();
        if (volunteersError) throw volunteersError;
        
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
  
  const processMonthlyEventData = (events) => {
    // Get last 12 months
    const endDate = new Date();
    const startDate = subMonths(endDate, 11);
    
    // Create array of months
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    
    // Initialize data with all months
    const monthlyData = months.map(month => {
      return {
        name: format(month, 'MMM yy'),
        month: month,
        created: 0,
        completed: 0
      };
    });
    
    // Count events per month
    events.forEach(event => {
      const eventStartDate = new Date(event.start_date);
      const eventEndDate = new Date(event.end_date);
      const eventCreatedDate = new Date(event.created_at);
      
      monthlyData.forEach(item => {
        const monthStart = startOfMonth(item.month);
        const monthEnd = endOfMonth(item.month);
        
        // Count events created in this month
        if (
          eventCreatedDate >= monthStart &&
          eventCreatedDate <= monthEnd
        ) {
          item.created += 1;
        }
        
        // Count events completed in this month
        if (
          eventEndDate >= monthStart &&
          eventEndDate <= monthEnd &&
          eventEndDate < new Date() // Only count past events
        ) {
          item.completed += 1;
        }
      });
    });
    
    setMonthlyEventData(monthlyData);
  };
  
  const processMonthlyVolunteerData = (volunteers) => {
    // Get last 12 months
    const endDate = new Date();
    const startDate = subMonths(endDate, 11);
    
    // Create array of months
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    
    // Initialize data with all months
    const monthlyData = months.map(month => {
      return {
        name: format(month, 'MMM yy'),
        month: month,
        newVolunteers: 0,
        cumulativeVolunteers: 0
      };
    });
    
    // Count new volunteers per month
    let runningTotal = 0;
    
    // First count volunteers registered before the start date
    volunteers.forEach(volunteer => {
      const registeredDate = new Date(volunteer.created_at);
      if (registeredDate < startDate) {
        runningTotal += 1;
      }
    });
    
    // Then process monthly data
    monthlyData.forEach((item, index) => {
      const monthStart = startOfMonth(item.month);
      const monthEnd = endOfMonth(item.month);
      
      volunteers.forEach(volunteer => {
        const registeredDate = new Date(volunteer.created_at);
        
        if (
          registeredDate >= monthStart &&
          registeredDate <= monthEnd
        ) {
          item.newVolunteers += 1;
          runningTotal += 1;
        }
      });
      
      item.cumulativeVolunteers = runningTotal;
      
      // If it's not the first month, ensure the cumulative count doesn't decrease
      if (index > 0) {
        const prevMonth = monthlyData[index - 1];
        if (item.cumulativeVolunteers < prevMonth.cumulativeVolunteers) {
          item.cumulativeVolunteers = prevMonth.cumulativeVolunteers;
        }
      }
    });
    
    setMonthlyVolunteerData(monthlyData);
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
                      <CardTitle>Monthly Event Trend</CardTitle>
                      <CardDescription>
                        Events created and completed over the past 12 months
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
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
                        Cumulative and new volunteers over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={monthlyVolunteerData}>
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Line 
                              yAxisId="left"
                              type="monotone" 
                              dataKey="cumulativeVolunteers" 
                              name="Total Volunteers"
                              stroke="#8884d8" 
                              activeDot={{ r: 8 }} 
                            />
                            <Line 
                              yAxisId="right"
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