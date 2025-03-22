import React, { useState } from 'react';
import { CheckCircle, Home, Calendar, Award, BarChart3 } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Settings, MenuIcon, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { assignedTasks } from './dashboard';

const TasksPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with boundary */}
      <div className="border-b border-gray-300 shadow-sm">
        <Header />
      </div>

      <div className="flex-1 flex flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 bg-white border-r border-gray-300 pt-20">
          <div className="flex flex-col gap-4">
            <div className="text-xs font-medium uppercase text-muted-foreground pl-4 mb-2">
              Navigation
            </div>
            <Button variant="ghost" className="justify-start" asChild>
              <a href="/volunteer/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </a>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <a href="#">
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </a>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <a href="/volunteer/tasks">
                <CheckCircle className="h-4 w-4 mr-2" />
                Tasks
              </a>
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
        </aside>

        {/* Main Content */}
        <main className="flex-1 pt-24 overflow-y-auto">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">My Tasks</h1>
                <p className="text-muted-foreground">View your assigned upcoming and completed tasks.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Upcoming Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Tasks</CardTitle>
                    <CardDescription>Your assigned tasks for upcoming events</CardDescription>
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

                {/* Completed Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle>Completed Tasks</CardTitle>
                    <CardDescription>Tasks you have completed</CardDescription>
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
            </div>
          </div>
        </main>
      </div>

      <AccessibilityMenu />
      <Footer />
    </div>
  );
};

export default TasksPage;
