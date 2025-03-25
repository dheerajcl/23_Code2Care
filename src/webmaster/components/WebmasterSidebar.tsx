import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Users,
  BarChart,
  ClipboardList,
  FileText,
  Settings,
  HelpCircle
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  href,
  active,
}) => {
  const navigate = useNavigate();

  return (
     <Button
      variant="ghost"
      className={cn(
        'w-full justify-start gap-3 font-normal px-3 py-2 h-auto transition-colors',
        active ? 'bg-red-700 text-white' : 'hover:bg-red-700 hover:text-white'
      )}
      onClick={() => navigate(href)}
    >
      {/* Icon - Default Black, Turns White on Hover/Active */}
      <Icon className={cn('h-5 w-5 transition-colors', active ? 'text-white' : 'text-black', 'hover:bg-red-700 hover:text-white')} />

      {/* Label - Default Black, Turns White on Hover/Active */}
      <span className={cn(active ? 'text-white' : 'text-black', 'hover:bg-red-700 hover:text-white')}>
        {label}
      </span>
    </Button>

  );
};

export const WebmasterSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isPathActive = (path: string) => {
    if (path === '/webmaster' || path === '/webmaster/dashboard') {
      return currentPath === '/webmaster' || currentPath === '/webmaster/dashboard';
    }
    return currentPath.startsWith(path);
  };

  const sidebarItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/webmaster/dashboard',
    },
    {
      icon: Calendar,
      label: 'Events',
      href: '/webmaster/events',
    },
    {
      icon: Users,
      label: 'Volunteers',
      href: '/webmaster/volunteers',
    },
    {
      icon: BarChart,
      label: 'Reports',
      href: '/webmaster/reports',
    },
    {
      icon: ClipboardList,
      label: 'Tasks',
      href: '/webmaster/tasks',
    },
    {
      icon: FileText,
      label: 'Feedback',
      href: '/webmaster/feedback',
    },
  ];

  return (
    <div className="h-screen w-64 border-r border-gray-200 bg-muted/40 hidden md:block">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="px-3 py-4">
          <div className="mb-8">
            <h2 className="text-xs font-medium uppercase text-muted-foreground pl-4 mb-2">
              Navigation
            </h2>
            <div className="space-y-1">
              {sidebarItems.map((item, index) => (
                <SidebarItem
                  key={index}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={isPathActive(item.href)}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}; 