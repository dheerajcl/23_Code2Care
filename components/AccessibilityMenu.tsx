
'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  Eye, 
  Maximize2, 
  Moon, 
  Sun, 
  Type, 
  ZoomIn, 
  ZoomOut 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AccessibilityMenu: React.FC = () => {
  const [fontSize, setFontSize] = useState(100);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    // Check saved preferences from localStorage
    const savedFontSize = localStorage.getItem('accessibility-font-size');
    const savedTheme = localStorage.getItem('theme');
    const savedContrast = localStorage.getItem('high-contrast');
    
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
      document.documentElement.style.fontSize = `${savedFontSize}%`;
    }
    
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    if (savedContrast === 'true') {
      setIsHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }
  }, []);

  const increaseFontSize = () => {
    const newSize = Math.min(150, fontSize + 10);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
    localStorage.setItem('accessibility-font-size', newSize.toString());
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(80, fontSize - 10);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
    localStorage.setItem('accessibility-font-size', newSize.toString());
  };

  const resetFontSize = () => {
    setFontSize(100);
    document.documentElement.style.fontSize = '100%';
    localStorage.setItem('accessibility-font-size', '100');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
  };

  const toggleHighContrast = () => {
    setIsHighContrast(!isHighContrast);
    document.documentElement.classList.toggle('high-contrast');
    localStorage.setItem('high-contrast', (!isHighContrast).toString());
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="fixed bottom-6 right-6 z-50" size="lg" aria-label="Accessibility options">
          <Eye className="h-5 w-5 mr-2" />
          <span>Accessibility</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem 
          onClick={toggleTheme}
          className="flex cursor-pointer items-center"
        >
          {isDarkMode ? (
            <>
              <Sun className="h-4 w-4 mr-2" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 mr-2" />
              <span>Dark Mode</span>
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={toggleHighContrast}
          className="flex cursor-pointer items-center"
        >
          <Maximize2 className="h-4 w-4 mr-2" />
          <span>{isHighContrast ? 'Disable' : 'Enable'} High Contrast</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={increaseFontSize}
          disabled={fontSize >= 150}
          className="flex cursor-pointer items-center"
        >
          <ZoomIn className="h-4 w-4 mr-2" />
          <span>Increase Text Size</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={decreaseFontSize}
          disabled={fontSize <= 80}
          className="flex cursor-pointer items-center"
        >
          <ZoomOut className="h-4 w-4 mr-2" />
          <span>Decrease Text Size</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={resetFontSize}
          disabled={fontSize === 100}
          className="flex cursor-pointer items-center"
        >
          <Type className="h-4 w-4 mr-2" />
          <span>Reset Text Size</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccessibilityMenu;
