import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home,
  Calendar,
  CheckCircle,
  Award,
  BarChart3,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccessibilityMenu from '@/components/AccessibilityMenu';

interface VolunteerLayoutProps {
  children: React.ReactNode;
}

export const VolunteerLayout = ({ children }: VolunteerLayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <Header />

      {/* Main content area with sidebar */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden border-r bg-muted/40 md:block w-64 shrink-0 sticky top-0 h-screen overflow-y-auto">
          <nav className="flex flex-col gap-2 p-4 pt-6">
            <div className="flex flex-col gap-1">
              <div className="text-xs font-medium uppercase text-muted-foreground pl-4 mb-2">
                Navigation
              </div>
              <Link to="/volunteer/dashboard">
                <Button 
                  variant={location.pathname === '/volunteer/dashboard' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/volunteer/events">
                <Button 
                  variant={location.pathname === '/volunteer/events' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Registered Events
                </Button>
              </Link>
              <Link to="/volunteer/tasks">
                <Button 
                  variant={location.pathname === '/volunteer/tasks' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Tasks
                </Button>
              </Link>
              <Link to="/volunteer/badges">
                <Button 
                  variant={location.pathname === '/volunteer/badges' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Badges
                </Button>
              </Link>
              <Link to="/volunteer/progress">
                <Button 
                  variant={location.pathname === '/volunteer/progress' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Progress
                </Button>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>

      <Footer />
      <AccessibilityMenu />
    </div>
  );
}; 