import React, { useState } from 'react';
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

// Mock data for the dashboard
const upcomingEvents = [
  {
    id: '1',
    title: 'Digital Literacy Workshop',
    date: 'Aug 15, 2023',
    time: '10:00 AM - 1:00 PM',
    location: 'Samarthanam Trust HQ, Bengaluru',
    status: 'registered'
  },
  {
    id: '2',
    title: 'Community Sports Day',
    date: 'Aug 20, 2023',
    time: '9:00 AM - 5:00 PM',
    location: 'Sri Kanteerava Stadium, Bengaluru',
    status: 'open'
  },
  {
    id: '3',
    title: 'Educational Support Program',
    date: 'Aug 28, 2023',
    time: '3:00 PM - 6:00 PM',
    location: 'Government School, Jayanagar, Bengaluru',
    status: 'open'
  },
];

const assignedTasks = [
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

const VolunteerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    // Redirect is handled by the auth context
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <header className="border-b">
        <div className="flex h-16 items-center px-4 sm:px-6">
        <Header/>
        </div>
      </header>

      <div className="flex-1 flex flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden border-r bg-muted/40 md:block w-64">
          <div className="flex flex-col gap-2 p-4 pt-6">
            <div className="flex flex-col gap-1 py-2">
              <div className="text-xs font-medium uppercase text-muted-foreground pl-4">
                Navigation
              </div>
              <Button variant="ghost" className="justify-start">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="ghost" className="justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Registered Events
              </Button>
              <Button variant="ghost" className="justify-start">
                <CheckCircle className="h-4 w-4 mr-2" />
                Tasks
              </Button>
              <Button variant="ghost" className="justify-start">
                <Award className="h-4 w-4 mr-2" />
                Badges
              </Button>
              <Button variant="ghost" className="justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Progress
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pt-6 overflow-y-auto">
          <div className="container mx-auto px-4 lg:px-8">
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

              {/* Tabs for different sections */}
              <Tabs defaultValue="events" className="space-y-4">
                <TabsList className="grid grid-cols-4 md:w-[400px]">
                  <TabsTrigger value="events">Upcoming Events</TabsTrigger>
                  <TabsTrigger value="tasks">My Tasks</TabsTrigger>
                  <TabsTrigger value="badges">Badges</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                </TabsList>

                {/* Events Tab */}
                <TabsContent value="events" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingEvents.map((event) => (
                      <Card key={event.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <CardDescription>
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-start gap-1 mt-1">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                              <span>{event.location}</span>
                            </div>
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-between pb-3">
                          <Badge variant={event.status === 'registered' ? 'default' : 'outline'}>
                            {event.status === 'registered' ? 'Registered' : 'Open for Registration'}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            Details
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <Button variant="outline">
                      Browse More Events
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </TabsContent>

                {/* Tasks Tab */}
                <TabsContent value="tasks" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Upcoming Tasks</CardTitle>
                        <CardDescription>
                          Your assigned tasks for upcoming events
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {assignedTasks.filter(task => task.status === 'upcoming').map((task) => (
                            <div key={task.id} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">{task.title}</h3>
                                  <div className="text-sm mt-1">{task.description}</div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    <Badge variant="outline" className="mr-2">{task.eventTitle}</Badge>
                                    {task.date} | {task.time}
                                  </div>
                                </div>
                                <Badge>{task.status}</Badge>
                              </div>
                            </div>
                          ))}
                          {assignedTasks.filter(task => task.status === 'upcoming').length === 0 && (
                            <div className="text-center py-6 text-muted-foreground">
                              No upcoming tasks assigned.
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Completed Tasks</CardTitle>
                        <CardDescription>
                          Tasks you have completed
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {assignedTasks.filter(task => task.status === 'completed').map((task) => (
                            <div key={task.id} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">{task.title}</h3>
                                  <div className="text-sm mt-1">{task.description}</div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    <Badge variant="outline" className="mr-2">{task.eventTitle}</Badge>
                                    {task.date} | {task.time}
                                  </div>
                                </div>
                                <Badge variant="secondary">{task.status}</Badge>
                              </div>
                            </div>
                          ))}
                          {assignedTasks.filter(task => task.status === 'completed').length === 0 && (
                            <div className="text-center py-6 text-muted-foreground">
                              No completed tasks yet.
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Badges Tab */}
                <TabsContent value="badges" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    {badges.map((badge) => (
                      <Card key={badge.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{badge.name}</CardTitle>
                            <div className={`w-12 h-12 flex items-center justify-center text-2xl rounded-full ${badge.color}`}>
                              {badge.icon}
                            </div>
                          </div>
                          <CardDescription>
                            {badge.description}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-2">
                          <div className="text-xs text-muted-foreground">
                            Earned on {badge.date}
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                    <Card className="flex flex-col items-center justify-center p-6 border-dashed">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                        <Award className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium mb-1">More badges await!</h3>
                      <p className="text-sm text-muted-foreground text-center">
                        Participate in more events to unlock additional badges and achievements.
                      </p>
                    </Card>
                  </div>
                </TabsContent>

                {/* Progress Tab */}
                <TabsContent value="progress" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Volunteer Hours</CardTitle>
                        <CardDescription>
                          Your volunteering hours over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityData}>
                              <Bar dataKey="hours" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Skills Development</CardTitle>
                        <CardDescription>
                          Track your skill progression
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium">Teaching</div>
                              <div className="text-sm text-muted-foreground">Beginner</div>
                            </div>
                            <Progress value={30} max={100} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium">Technology</div>
                              <div className="text-sm text-muted-foreground">Intermediate</div>
                            </div>
                            <Progress value={60} max={100} className="h-2" />
                          </div>
                          <div className="pt-4">
                            <h3 className="text-sm font-medium mb-2">Suggested Skill Development</h3>
                            <div className="space-y-2">
                              <div className="p-2 border rounded-md">
                                <div className="font-medium">Event Management</div>
                                <div className="text-sm text-muted-foreground">Participate in event organization to develop this skill</div>
                              </div>
                              <div className="p-2 border rounded-md">
                                <div className="font-medium">Sports Coaching</div>
                                <div className="text-sm text-muted-foreground">Assist in sports events to develop coaching skills</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Feedback & Recognition</CardTitle>
                      <CardDescription>
                        Feedback received from event organizers
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {feedbackData.length > 0 ? (
                        <div className="space-y-4">
                          {feedbackData.map((feedback) => (
                            <div key={feedback.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold">{feedback.eventTitle}</h3>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <svg 
                                      key={i} 
                                      className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                                      fill="currentColor" 
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                    </svg>
                                  ))}
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">
                                {feedback.date}
                              </div>
                              <p className="text-sm">
                                "{feedback.comment}"
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No feedback received yet. Feedback will appear here after completing volunteer activities.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
      <Footer/>
      <AccessibilityMenu />
    </div>
  );
};

export default VolunteerDashboard; 