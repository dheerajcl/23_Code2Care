
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Moon, Sun, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2"
            aria-label="Samarthanam Trust - Home"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">S</div>
            <span className="font-semibold text-xl hidden md:block">Samarthanam</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              href="/" 
              className={`px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors ${
                pathname === '/' ? 'bg-secondary' : ''
              }`}
            >
              Home
            </Link>
            <Link 
              href="/events" 
              className={`px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors ${
                pathname === '/events' ? 'bg-secondary' : ''
              }`}
            >
              Events
            </Link>
            <Link 
              href="/about" 
              className={`px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors ${
                pathname === '/about' ? 'bg-secondary' : ''
              }`}
            >
              About
            </Link>
            <Button asChild variant="ghost" className="ml-2">
              <Link href="/register">Volunteer</Link>
            </Button>
          </nav>

          {/* Theme and Accessibility Controls */}
          <div className="flex items-center space-x-2">
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Accessibility options">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onSelect={() => document.documentElement.classList.toggle('high-contrast')}
                >
                  Toggle High Contrast
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => document.body.style.fontSize = 
                    document.body.style.fontSize === '110%' ? '100%' : '110%'
                  }
                >
                  Toggle Larger Text
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'max-h-64 bg-background/95 backdrop-blur-md border-b border-border' 
            : 'max-h-0'
        }`}
      >
        <div className="container mx-auto px-4 py-3 space-y-1">
          <Link 
            href="/" 
            className={`block px-3 py-2 rounded-md hover:bg-secondary transition-colors ${
              pathname === '/' ? 'bg-secondary' : ''
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/events" 
            className={`block px-3 py-2 rounded-md hover:bg-secondary transition-colors ${
              pathname === '/events' ? 'bg-secondary' : ''
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Events
          </Link>
          <Link 
            href="/about" 
            className={`block px-3 py-2 rounded-md hover:bg-secondary transition-colors ${
              pathname === '/about' ? 'bg-secondary' : ''
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link 
            href="/register" 
            className="block px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Volunteer
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
