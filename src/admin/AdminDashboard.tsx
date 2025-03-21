import React, { useState } from 'react';
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
  ChevronDown
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

// Mock data for the dashboard
const eventData = [
  { name: 'Jan', count: 12 },
  { name: 'Feb', count: 18 },
  { name: 'Mar', count: 15 },
  { name: 'Apr', count: 22 },
  { name: 'May', count: 30 },
  { name: 'Jun', count: 28 },
  { name: 'Jul', count: 35 },
];

const volunteerData = [
  { name: 'Jan', active: 30, new: 10 },
  { name: 'Feb', active: 42, new: 15 },
  { name: 'Mar', active: 48, new: 12 },
  { name: 'Apr', active: 55, new: 18 },
  { name: 'May', active: 70, new: 22 },
  { name: 'Jun', active: 88, new: 25 },
  { name: 'Jul', active: 102, new: 30 },
];

const skillDistribution = [
  { name: 'Teaching', value: 35 },
  { name: 'Technology', value: 42 },
  { name: 'Management', value: 28 },
  { name: 'Event Coordination', value: 20 },
  { name: 'Media', value: 15 },
];

const recentVolunteers = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    skills: ['Teaching', 'Technology'],
    joined: '2 days ago',
    events: 0,
    status: 'new'
  },
  {
    id: '2',
    name: 'Arjun Mehta',
    email: 'arjun@example.com',
    skills: ['Event Coordination', 'Media'],
    joined: '5 days ago',
    events: 1,
    status: 'active'
  },
  {
    id: '3',
    name: 'Kavita Reddy',
    email: 'kavita@example.com',
    skills: ['Teaching', 'Management'],
    joined: '1 week ago',
    events: 2,
    status: 'active'
  },
  {
    id: '4',
    name: 'Rahul Singh',
    email: 'rahul@example.com',
    skills: ['Technology'],
    joined: '1 week ago',
    events: 0,
    status: 'new'
  },
];

const upcomingEvents = [
  {
    id: '1',
    title: 'Digital Literacy Workshop',
    date: 'Aug 15, 2023',
    location: 'Bengaluru',
    volunteers: 8,
    volunteerNeeded: 12,
    status: 'Upcoming'
  },
  {
    id: '2',
    title: 'Community Sports Day',
    date: 'Aug 20, 2023',
    location: 'Chennai',
    volunteers: 15,
    volunteerNeeded: 20,
    status: 'Upcoming'
  },
  {
    id: '3',
    title: 'Educational Support Program',
    date: 'Aug 28, 2023',
    location: 'Hyderabad',
    volunteers: 5,
    volunteerNeeded: 10,
    status: 'Upcoming'
  },
];

const AdminDashboard: React.FC = () => {
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
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 sm:max-w-none">
              <nav className="flex flex-col gap-6 mt-6">
                <a href="/admin/dashboard" className="flex items-center gap-2 font-semibold text-lg">
                  <Award className="h-5 w-5" />
                  <span>Admin Dashboard</span>
                </a>
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-medium uppercase text-muted-foreground">
                    Navigation
                  </div>
                  <Button variant="ghost" className="justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                    Dashboard
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                    Volunteers
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                    Events
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                    Reports
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                    Settings
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 font-semibold text-lg md:ml-0 ml-2">
            <Award className="h-6 w-6 text-primary" />
            <span>Samarth Connect</span>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 font-normal">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt={user?.firstName} />
                    <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline-block">{user?.firstName} {user?.lastName}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
                Dashboard
              </Button>
              <Button variant="ghost" className="justify-start">
                Volunteers
              </Button>
              <Button variant="ghost" className="justify-start">
                Events
              </Button>
              <Button variant="ghost" className="justify-start">
                Reports
              </Button>
              <Button variant="ghost" className="justify-start">
                Settings
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
                    <div className="text-2xl font-bold">102</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                      <span className="text-green-500 flex items-center mr-1">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        12%
                      </span>
                      from last month
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
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                      <span className="text-green-500 flex items-center mr-1">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        5%
                      </span>
                      from last month
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
                    <div className="text-2xl font-bold">854</div>
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
                    <div className="text-2xl font-bold">30</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                      <span className="text-red-500 flex items-center mr-1">
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                        3%
                      </span>
                      from last month
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
                          <Progress value={skill.value} max={100} className="h-2" />
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
                      {upcomingEvents.map((event) => (
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
                              <span className="text-muted-foreground">{Math.round((event.volunteers / event.volunteerNeeded) * 100)}%</span>
                            </div>
                            <Progress value={event.volunteers} max={event.volunteerNeeded} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">View All Events</Button>
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
                                {volunteer.skills.map((skill) => (
                                  <Badge key={skill} variant="secondary" className="font-normal">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                            <td className="p-3">{volunteer.joined}</td>
                            <td className="p-3">{volunteer.events}</td>
                            <td className="p-3">
                              <Badge variant={volunteer.status === "new" ? "outline" : "default"}>
                                {volunteer.status === "new" ? "New" : "Active"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View All Volunteers</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
      
      <AccessibilityMenu />
    </div>
  );
};

export default AdminDashboard; 