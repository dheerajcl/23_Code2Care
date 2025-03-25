import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Calendar, Users, BarChart2, HardDriveUpload } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
  { name: 'Events', icon: <Calendar size={20} />, path: '/admin/events' },
  { name: 'Volunteers', icon: <Users size={20} />, path: '/admin/volunteers' },
  { name: 'Reports', icon: <BarChart2 size={20} />, path: '/admin/reports' },
  { name: 'Import', icon: <HardDriveUpload size={20} />, path: '/admin/migration' },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="hidden border-r bg-muted/40 md:block w-64 h-full">
      <div className="flex flex-col gap-2 p-4 pt-6">
        <div className="text-xs font-medium uppercase text-muted-foreground pl-4 mb-2">
          Navigation
        </div>
        {menuItems.map((item) => (
          <Button
          key={item.name}
          variant={location.pathname.startsWith(item.path) ? 'default' : 'ghost'}
          className="flex justify-start items-center gap-3 w-full px-4"
          onClick={() => navigate(item.path)}
        >
          {item.icon}
          {item.name}
        </Button>        
        ))}
      </div>
    </aside>
  );
};

export default AdminSidebar;
