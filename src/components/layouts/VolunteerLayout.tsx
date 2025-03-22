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
    <div className="h-screen bg-gray-100 flex flex-col">
    <Header/>
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto pt-28 p-8">
        <div className="container mx-auto px-4 lg:px-2">
          {children}
        </div>
      </main>
      </div>
    </div>
  );
}; 