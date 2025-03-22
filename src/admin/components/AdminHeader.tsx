import { useState } from "react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Menu as MenuIcon, Award, User, Settings, LogOut, ChevronDown } from "lucide-react";

interface User {
  firstName?: string;
  lastName?: string;
}

interface AdminHeaderProps {
  user?: User;
  handleLogout: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ user, handleLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              <a href="/admin/dashboard" className="flex items-center gap-2 font-semibold text-lg">
                <Award className="h-5 w-5" />
                <span>Admin Dashboard</span>
              </a>
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
          <Award className="h-6 w-6 text-primary" />
          <span>Samarth Connect</span>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 font-normal">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" alt={user?.firstName} />
                  <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="hidden lg:inline-block">{user?.firstName} {user?.lastName}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
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

export default AdminHeader;