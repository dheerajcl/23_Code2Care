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
import Sidebar from '../Sidebar';

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
        <Sidebar/>

        {/* Main Content */}
        <main className="flex-1 overflow-auto pt-20">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
      <AccessibilityMenu />
    </div>
  );
}; 