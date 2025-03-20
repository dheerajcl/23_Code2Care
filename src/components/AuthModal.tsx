
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  defaultTab?: 'login' | 'register';
  trigger?: React.ReactNode;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  defaultTab = 'login',
  trigger 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline">Login / Register</Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Welcome to Samarthanam</DialogTitle>
          <DialogDescription className="text-center">
            Join our community to make a difference in the lives of others
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-login">Email</Label>
              <Input 
                id="email-login" 
                type="email" 
                placeholder="your.email@example.com" 
                autoComplete="email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password-login">Password</Label>
              <div className="relative">
                <Input 
                  id="password-login" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>
            
            <div className="text-right">
              <Button variant="link" className="text-sm p-0 h-auto" onClick={() => alert("Password reset functionality would go here")}>
                Forgot password?
              </Button>
            </div>
            
            <Button className="w-full" onClick={() => alert("Login functionality would go here")}>
              Login
            </Button>
          </TabsContent>
          
          {/* Register Tab */}
          <TabsContent value="register" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First name</Label>
                <Input id="first-name" placeholder="John" autoComplete="given-name" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" placeholder="Doe" autoComplete="family-name" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-register">Email</Label>
              <Input 
                id="email-register" 
                type="email" 
                placeholder="your.email@example.com"
                autoComplete="email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password-register">Password</Label>
              <div className="relative">
                <Input 
                  id="password-register" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            
            <Button className="w-full" onClick={() => alert("Registration functionality would go here")}>
              Create Account
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
