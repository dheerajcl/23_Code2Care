import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Menu as MenuIcon, Award, User, Settings, LogOut, Sun, Moon } from "lucide-react";
import Logo from '../assets/logo.png';

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface HeaderProps {
  user?: User;
  handleLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, handleLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // If no user is logged in, don't render the header
  if (!user) {
    return null;
  }

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 sm:px-6">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 sm:max-w-none">
            <nav className="flex flex-col gap-6 mt-6">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <Award className="h-5 w-5" />
                <span>Volunteer Dashboard</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-xs font-medium uppercase text-muted-foreground">
                  Navigation
                </div>
                {['Dashboard', 'Volunteers', 'Events', 'Reports', 'Settings'].map((item) => (
                  <Button key={item} variant="ghost" className="justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                    {item}
                  </Button>
                ))}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 font-semibold text-lg md:ml-0 ml-2">
          <img src={Logo} alt="logo" className="h-12 w-12 s-logo"/>
          <span>Samarth Connect</span>
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleTheme}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/donate')}>
                Donate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;