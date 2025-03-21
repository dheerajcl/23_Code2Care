// components/AdminSidebar.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Volunteers', path: '/admin/volunteers' },
    { name: 'Events', path: '/admin/events' },
    { name: 'Reports', path: '/admin/reports' },
    { name: 'Settings', path: '/admin/settings' },
  ];

  return (
    <aside className="hidden border-r bg-muted/40 md:block w-64">
      <div className="flex flex-col gap-2 p-4 pt-6">
        <div className="text-xs font-medium uppercase text-muted-foreground pl-4">
          Navigation
        </div>
        {menuItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            className="justify-start"
            onClick={() => navigate(item.path)}
          >
            {item.name}
          </Button>
        ))}
      </div>
    </aside>
  );
};

export default AdminSidebar;
