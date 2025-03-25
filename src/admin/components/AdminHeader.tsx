import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Menu as MenuIcon, User, Settings, LogOut, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from '../../assets/logo.png'
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/lib/authContext';

interface User {
  firstName?: string;
  lastName?: string;
}

interface AdminHeaderProps {
  user?: User;
  handleLogout?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ user: propUser, handleLogout: propLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user: contextUser, logout: contextLogout } = useAdminAuth();
  
  const user = contextUser || propUser;
  const handleLogout = contextLogout || propLogout;

  const onLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('volunteerUser');
    localStorage.removeItem('user');
    if (handleLogout) handleLogout();
    navigate('/', { replace: true });
  };

  const handleNotificationClick = () => {
    navigate('/admin/notifications');
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo Section */}
        <div className="flex items-center">
          <Link to="/admin/dashboard" className="flex items-center">
            <img className="h-8 w-auto" src={Logo} alt="Samarthanam logo" />
            <span className="ml-2 font-semibold text-xl hidden md:block">Samarth Connect</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          <Link to="/admin/dashboard" className="text-sm font-medium text-gray-900 hover:text-green-600">
            Dashboard
          </Link>
          <Link to="/admin/events" className="text-sm font-medium text-gray-900 hover:text-green-600">
            Events
          </Link>
          <Link to="/admin/volunteers" className="text-sm font-medium text-gray-900 hover:text-green-600">
            Volunteers
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Desktop User Section */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNotificationClick}
              className="text-gray-700 hover:text-green-600"
            >
              <Bell size={20} />
            </Button>

            {user ? (
              <div className="relative group">
                <div className="flex items-center cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt={user?.firstName} />
                    <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="ml-2 text-sm font-medium text-gray-700">{user?.firstName} {user?.lastName}</span>
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg hidden group-hover:block z-10">
                  <div className="py-1">
                    <Link to="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <Link to="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Settings
                    </Link>
                    <button
                      onClick={onLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-gray-900 hover:text-green-600">
                Log in
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <MenuIcon className="h-6 w-6 text-gray-700" />
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <Link to="/admin/dashboard" className="flex items-center">
                <img className="h-8 w-auto" src={Logo} alt="Samarthanam logo" />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MenuIcon className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <Link
                  to="/admin/dashboard"
                  className="block py-2 text-base font-medium text-gray-900 hover:text-green-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/events"
                  className="block py-2 text-base font-medium text-gray-900 hover:text-green-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Events
                </Link>
                <Link
                  to="/admin/volunteers"
                  className="block py-2 text-base font-medium text-gray-900 hover:text-green-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Volunteers
                </Link>
                {user ? (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src="/placeholder-avatar.jpg" alt={user?.firstName} />
                        <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-base font-medium">{user?.firstName} {user?.lastName}</span>
                    </div>
                    <Link
                      to="/admin/profile"
                      className="block py-2 text-base font-medium text-gray-900 hover:text-green-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="block py-2 text-base font-medium text-gray-900 hover:text-green-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={onLogout}
                      className="block w-full text-left py-2 text-base font-medium text-gray-900 hover:text-green-600"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="block py-2 text-base font-medium text-gray-900 hover:text-green-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;