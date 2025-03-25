import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Moon, Sun, Settings, User, LogOut, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import Logo from "../assets/logo.png";
import { useAuth, useVolunteerAuth } from '@/lib/authContext';
import { useLanguage } from './LanguageContext'; // Adjust the import path as needed
import { useTranslation } from 'react-i18next';

// Define the Language type to match what's used in the language context
type Language = 'en' | 'hi' | 'kn';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user: legacyUser } = useAuth();
  const { user: volunteerUser, logout: volunteerLogout } = useVolunteerAuth();
  // const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('translation'); // Namespace is 'translation'
  const changeLanguage = (lng: SupportedLanguages) => {
    i18n.changeLanguage(lng);
  };
  
  // Use the volunteer user if available, otherwise fallback to the legacy user
  const user = volunteerUser || legacyUser;

  const handleLogout = async () => {
    await volunteerLogout();
    navigate('/');
  };

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

    // Check for saved language preference
    // const savedLang = localStorage.getItem('language') as Language | null;
    // if (savedLang && ['en', 'hi', 'kn'].includes(savedLang)) {
    //   setLanguage(savedLang);
    // }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  });

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

  // const changeLanguage = (lang: Language) => {
  //   setLanguage(lang);
  //   localStorage.setItem('language', lang);
  // };

  // Function to get the dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!user) return '/login';
    return '/volunteer/dashboard';
  };

  return (
    <header 
      className='fixed top-0 left-0 w-full bg-white shadow-sm z-50 vol-dashboard-header'
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2"
            aria-label="Samarthanam Trust - Home"
          >
            <img src={Logo} alt="Samarth Connect Logo" className='h-12 w-12 s-logo'/>
            <span className="font-semibold text-xl hidden md:block">Samarth Connect</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors"
            >
              {t('home')}
            </Link>
            <Link 
              to="/events" 
              className="px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors"
            >
              {t('events')}
            </Link>
            <Link 
              to="/about" 
              className="px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors"
            > 
              {t('about')}
            </Link>
            <Link 
              to="/donate" 
              className="px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors"
            >
              {t('donate')}
            </Link>
            {user ? (
              <Link 
                to={getDashboardUrl()}
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors"
              >
                {t('dashboard')}
              </Link>
            ) : (
              <Link 
                to="/join-us" 
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors"
              >
                {t('volunteer')}
              </Link>
            )}
          </nav>

          {/* User Menu & Controls */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Language selector">
                  <Languages className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('language')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => changeLanguage('en')}>
                  {t('english')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('hi')}>
                  {t('hindi')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('kn')}>
                  {t('kannada')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Login or User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5" />
                    <span className="sr-only">{t('userMenu')}</span>
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
                  <DropdownMenuItem onClick={() => navigate(getDashboardUrl())}>
                    {t('dashboard')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">{t('login')}</Link>
              </Button>
            )}

            {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label={isDarkMode ? t("switchToLightMode") : t("switchToDarkMode")}
            onClick={toggleTheme}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>



            {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            aria-label={isMenuOpen ? t("closeMenu") : t("openMenu")}
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'max-h-80 bg-background/95 backdrop-blur-md border-b border-border' 
            : 'max-h-0'
        }`}
      >
        <div className="container mx-auto px-4 py-3 space-y-1">
          <Link 
            to="/" 
            className="block px-3 py-2 rounded-md hover:bg-secondary transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            {t('home')}
          </Link>
          <Link 
            to="/events" 
            className="block px-3 py-2 rounded-md hover:bg-secondary transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            {t('events')}
          </Link>
          <Link 
            to="/about" 
            className="block px-3 py-2 rounded-md hover:bg-secondary transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            {t('about')}
          </Link>
          
          {user ? (
            // Show dashboard link if user is logged in
            <Link 
              to={getDashboardUrl()}
              className="block px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('dashboard')}
            </Link>
          ) : (
            // Show login and volunteer links if user is not logged in
            <>
              <Link 
                to="/login"
                className="block px-3 py-2 rounded-md hover:bg-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('login')}
              </Link>
              <Link 
                to="/join-us" 
                className="block px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('volunteer')}
              </Link>
            </>
          )}
          
          {/* Show logout option if logged in (mobile) */}
          {user && (
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="w-full text-left block px-3 py-2 rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
            >
              {t('logout')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;