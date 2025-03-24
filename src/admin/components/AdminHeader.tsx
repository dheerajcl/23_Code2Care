import { useState } from "react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Menu as MenuIcon, Award, User, Settings, LogOut, ChevronDown, Bell } from "lucide-react";
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const navigate = useNavigate();
  
  // Use the admin auth context if available
  const { user: contextUser, logout: contextLogout } = useAdminAuth();
  
  // Prefer context values over props
  const user = contextUser || propUser;
  const handleLogout = contextLogout || propLogout;

  const onLogout = () => {
    // Clear all localStorage on logout
    localStorage.removeItem('adminUser');
    localStorage.removeItem('volunteerUser');
    localStorage.removeItem('user');
    
    // Call the actual logout handler
    if (handleLogout) {
      handleLogout();
    }
    
    // Navigate to home page
    navigate('/', { replace: true });
  };

  const handleNotificationClick = () => {
    // Instead of showing dropdown, navigate to notifications page
    navigate('/admin/notifications');
  };

  return (
    <header className="relative bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/admin/dashboard" className="-m-1.5 p-1.5">
            <img className="h-8 w-auto" src={Logo} alt="Samarthanam logo" />
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        {/* Desktop navigation links */}
        <div className="hidden lg:flex lg:gap-x-12">
          <Link to="/admin/dashboard" className="text-sm font-medium text-gray-900 hover:text-green-600">Dashboard</Link>
          <Link to="/admin/events" className="text-sm font-medium text-gray-900 hover:text-green-600">Events</Link>
          <Link to="/admin/volunteers" className="text-sm font-medium text-gray-900 hover:text-green-600">Volunteers</Link>
          <Link to="/admin/points" className="text-sm font-medium text-gray-900 hover:text-green-600">Points</Link>
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-2">
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="text-black hover:text-green-600 p-2"
            >
              <Bell size={24} />
            </button>
          </div>
          
          {user ? (
            <div className="relative group">
              <button className="flex items-center text-sm font-medium text-gray-700 hover:text-green-600">
                <Avatar className="h-8 w-8 mr-1">
                  <AvatarImage src="/placeholder-avatar.jpg" alt={user?.firstName} />
                  <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="hidden lg:inline-block">{user?.firstName} {user?.lastName}</span>
              </button>
              
              <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <Link 
                    to="/admin/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/admin/settings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      if (handleLogout) onLogout();
                    }}
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
      </nav>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-10 bg-white">
          <div className="fixed inset-0 z-10">
            <div className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
              <div className="flex items-center justify-between">
                <Link to="/" className="-m-1.5 p-1.5">
                  <img className="h-8 w-auto" src={Logo} alt="Samarthanam logo" />
                </Link>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <MenuIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/10">
                  <div className="space-y-2 py-6">
                    <Link 
                      to="/admin/dashboard" 
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/admin/events" 
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Events
                    </Link>
                    <Link 
                      to="/admin/volunteers" 
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Volunteers
                    </Link>
                    <Link 
                      to="/admin/points" 
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Points
                    </Link>
                  </div>
                  <div className="py-6">
                    {user ? (
                      <>
                        <div className="flex items-center -mx-3 px-3 py-2 text-base font-medium text-gray-900">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src="/placeholder-avatar.jpg" alt={user?.firstName} />
                            <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{user?.firstName} {user?.lastName}</span>
                        </div>
                        <Link 
                          to="/admin/profile" 
                          className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link 
                          to="/admin/settings" 
                          className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            if (handleLogout) onLogout();
                          }}
                          className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-medium text-gray-900 hover:bg-gray-50 w-full text-left"
                        >
                          Sign out
                        </button>
                      </>
                    ) : (
                      <Link 
                        to="/login" 
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-medium text-gray-900 hover:bg-gray-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Log in
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;