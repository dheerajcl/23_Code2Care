import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Menu as MenuIcon, User, LogOut, Bell, Edit2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from '../../assets/logo.png'
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/lib/authContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateVolunteer } from '@/services/database.service';

interface User {
  id?: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
}

interface AdminHeaderProps {
  user?: User;
  handleLogout?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ user: propUser, handleLogout: propLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user: contextUser, logout: contextLogout, setUser: setContextUser } = useAdminAuth();
  
  // Add state for dropdown menu
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const user = contextUser || propUser;
  const handleLogout = contextLogout || propLogout;

  // Edit profile state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || user?.first_name || '');
  const [lastName, setLastName] = useState(user?.lastName || user?.last_name || '');
  const [isSaving, setIsSaving] = useState(false);

  // Update form values when user changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || user.first_name || '');
      setLastName(user.lastName || user.last_name || '');
    }
  }, [user]);

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

  const handleEditProfileClick = () => {
    setIsEditProfileOpen(true);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  const closeDropdownOnOutsideClick = (e) => {
    if (!e.target.closest('.profile-dropdown-container')) {
      setIsDropdownOpen(false);
    }
  };

  // Add event listener to close dropdown when clicking outside
  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('click', closeDropdownOnOutsideClick);
    } else {
      document.removeEventListener('click', closeDropdownOnOutsideClick);
    }
    return () => {
      document.removeEventListener('click', closeDropdownOnOutsideClick);
    };
  }, [isDropdownOpen]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!user?.id) return;
    
    try {
      setIsSaving(true);
      
      // Update the admin in the database (using the same function since the schema is similar)
      const { data, error } = await updateVolunteer(user.id, {
        first_name: firstName,
        last_name: lastName
      });
      
      if (error) {
        throw error;
      }
      
      // Update the user in context and localStorage
      if (data && setContextUser) {
        const updatedUser = {
          ...user,
          firstName: firstName,
          lastName: lastName,
          first_name: firstName,
          last_name: lastName
        };
        
        setContextUser(updatedUser as User);
        
        toast.success('Profile updated successfully');
        setIsEditProfileOpen(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
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
              <div className="relative profile-dropdown-container">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown();
                  }}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt={user?.firstName} />
                    <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="ml-2 text-sm font-medium text-gray-700">{user?.firstName} {user?.lastName}</span>
                </div>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <button
                        onClick={handleEditProfileClick}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </div>
                      </button>
                      <button
                        onClick={() => navigate('/admin/registers')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Register an Admin
                        </div>
                      </button>
                      {/* <button
                        onClick={() => navigate('/admin/webmasterregisters')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Register a Webmaster
                        </div>
                      </button> */}
                      <button
                        onClick={onLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign out
                        </div>
                      </button>
                    </div>
                  </div>
                )}
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
                    <button
                      onClick={handleEditProfileClick}
                      className="flex w-full items-center py-2 text-base font-medium text-gray-900 hover:text-green-600"
                    >
                      <Edit2 className="h-5 w-5 mr-2" />
                      Edit Profile
                    </button>
                    <button
                      onClick={onLogout}
                      className="flex w-full items-center py-2 text-base font-medium text-gray-900 hover:text-green-600"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
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

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleUpdateProfile}>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your profile information below.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  required
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditProfileOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default AdminHeader;