import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Calendar, CheckCircle, BarChart3, Award } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/volunteer/dashboard' },
  { name: 'Events', icon: <Calendar size={20} />, path: '/volunteer/events' },
  { name: 'Tasks', icon: <CheckCircle size={20} />, path: '/tasks' },
  { name: 'Leaderboard', icon: <BarChart3 size={20} />, path: '/leaderboard' },
  { name: 'Badges', icon: <Award size={20} />, path: '/badges' },
];

const Sidebar = () => {
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

export default Sidebar;
