import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronDown, 
  Eye, 
  Maximize2, 
  Moon, 
  Sun, 
  Type, 
  ZoomIn, 
  ZoomOut,
  Volume2,
  VolumeX,
  Mic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { useTalkBack } from './TalkBack';
import WriteByVoice from './WriteByVoice';

interface VoiceInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetElementId: string;
}

const VoiceInputDialog: React.FC<VoiceInputDialogProps> = ({ isOpen, onClose, targetElementId }) => {
  const [transcript, setTranscript] = useState('');

  const handleTranscriptChange = (newTranscript: string) => {
    // Clean the transcript (remove trailing full stops and trim spaces)
    const cleanedTranscript = newTranscript.replace(/\.+$/, '').trim();
    setTranscript(cleanedTranscript);
  };

  const handleDone = () => {
    // Update the input field with the cleaned transcript
    if (targetElementId) {
      const inputElement = document.getElementById(targetElementId) as HTMLInputElement | HTMLTextAreaElement;
      if (inputElement) {
        inputElement.value = transcript; // Use the cleaned transcript
      }
    }
    onClose(); // Close the dialog
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Voice Input</DialogTitle>
          <p className="text-sm text-muted-foreground">Speak to enter text in the field</p>
        </DialogHeader>
        <div className="py-4">
          <WriteByVoice 
            onTranscriptChange={handleTranscriptChange} 
            targetElementId={targetElementId}
          />
          
          {/* Display the transcribed text */}
          {transcript && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <h4 className="text-sm font-medium mb-1">Transcribed Text:</h4>
              <p className="text-sm">{transcript}</p>
            </div>
          )}
        </div>
        <DialogClose asChild>
          <Button type="button" variant="secondary" onClick={handleDone}>
            Done
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

const AccessibilityMenu: React.FC = () => {
  const [fontSize, setFontSize] = useState(100);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isVoiceInputEnabled, setIsVoiceInputEnabled] = useState(false);
  const [voiceDialogOpen, setVoiceDialogOpen] = useState(false);
  const [currentTargetId, setCurrentTargetId] = useState('');
  const { isActive: isTalkBackActive, toggleTalkBack } = useTalkBack();

  useEffect(() => {
    // Check saved preferences from localStorage
    const savedFontSize = localStorage.getItem('accessibility-font-size');
    const savedTheme = localStorage.getItem('theme');
    const savedContrast = localStorage.getItem('high-contrast');
    const savedVoiceInput = localStorage.getItem('voice-input');
    
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
    
    if (savedVoiceInput === 'true') {
      setIsVoiceInputEnabled(true);
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
  
  const toggleVoiceInput = () => {
    const newValue = !isVoiceInputEnabled;
    setIsVoiceInputEnabled(newValue);
    localStorage.setItem('voice-input', newValue.toString());
    
    // Dispatch a custom event for components in the same window
    const event = new CustomEvent('voiceInputToggled');
    document.dispatchEvent(event);
    
    // Refresh the page after toggling voice input
    window.location.reload();
  };
  
  const handleVoiceButtonClick = useCallback((elementId: string) => {
    setCurrentTargetId(elementId);
    setVoiceDialogOpen(true);
  }, []);
  
  const closeVoiceDialog = () => {
    setVoiceDialogOpen(false);
  };

  // Listen for custom events from Input components
  useEffect(() => {
    if (!isVoiceInputEnabled) return;
    
    const handleVoiceInputRequest = (e: CustomEvent) => {
      const targetId = e.detail.targetId;
      if (targetId) {
        handleVoiceButtonClick(targetId);
      }
    };
    
    // Listen for custom events from the Input component
    document.addEventListener('voiceInputRequested', handleVoiceInputRequest as EventListener);
    
    return () => {
      document.removeEventListener('voiceInputRequested', handleVoiceInputRequest as EventListener);
    };
  }, [isVoiceInputEnabled, handleVoiceButtonClick]);
  
  // For legacy support - handle voice input for non-custom inputs
  useEffect(() => {
    if (!isVoiceInputEnabled) return;
    
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if the clicked element is a voice input button
      if (target.closest('.voice-input-btn')) {
        e.preventDefault();
        e.stopPropagation();
        
        // Find the associated input field
        const button = target.closest('.voice-input-btn');
        const inputId = button?.getAttribute('data-target-id');
        
        if (inputId) {
          handleVoiceButtonClick(inputId);
        }
      }
    };
    
    document.addEventListener('click', handleDocumentClick);
    
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isVoiceInputEnabled, handleVoiceButtonClick]);

  // Add voice buttons to all non-custom form elements (for backward compatibility)
  useEffect(() => {
    if (!isVoiceInputEnabled) return;
    
    const addVoiceButtons = () => {
      // Target only standard input elements, not our custom Input components
      // which will handle voice input internally
      const formElements = document.querySelectorAll(
        'input[type="text"]:not(.custom-input), input[type="search"]:not(.custom-input), input[type="email"]:not(.custom-input), input[type="password"]:not(.custom-input), textarea:not(.custom-textarea)'
      );
      
      formElements.forEach((element, index) => {
        const elementId = element.id || `voice-input-field-${index}`;
        
        // Set ID if not already set
        if (!element.id) {
          element.id = elementId;
        }
        
        // Check if button already exists
        const parentEl = element.parentElement;
        if (parentEl && !parentEl.querySelector(`.voice-input-btn[data-target-id="${elementId}"]`)) {
          // Ensure parent has relative positioning
          if (window.getComputedStyle(parentEl).position === 'static') {
            parentEl.style.position = 'relative';
          }
          
          // Create voice button
          const voiceBtn = document.createElement('button');
          voiceBtn.className = 'voice-input-btn absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground';
          voiceBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>';
          voiceBtn.setAttribute('aria-label', 'Voice input');
          voiceBtn.setAttribute('data-target-id', elementId);
          
          parentEl.appendChild(voiceBtn);
        }
      });
    };
    
    // Add buttons initially and then on DOM changes
    addVoiceButtons();
    
    // Optional: Use MutationObserver to detect new form elements
    const observer = new MutationObserver((mutations) => {
      let shouldAddButtons = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (element.querySelector('input, textarea')) {
                shouldAddButtons = true;
                break;
              }
            }
          }
        }
      });
      
      if (shouldAddButtons) {
        addVoiceButtons();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      observer.disconnect();
    };
  }, [isVoiceInputEnabled]);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button 
            className="fixed bottom-6 right-6 z-50 bg-[#AE1919] hover:bg-red-600 text-white" 
            size="lg" 
            aria-label="Accessibility options"
          >
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

          <DropdownMenuItem onClick={toggleTalkBack} className="flex cursor-pointer items-center">
            {isTalkBackActive ? (
              <>
                <VolumeX className="h-4 w-4 mr-2" />
                <span>Disable Talk Back</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                <span>Enable Talk Back</span>
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={toggleVoiceInput} className="flex cursor-pointer items-center">
            <Mic className="h-4 w-4 mr-2" />
            <span>{isVoiceInputEnabled ? 'Disable' : 'Enable'} Voice Input</span>
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
      
      {/* Voice Input Dialog */}
      <VoiceInputDialog 
        isOpen={voiceDialogOpen} 
        onClose={closeVoiceDialog} 
        targetElementId={currentTargetId} 
      />
    </>
  );
};

export default AccessibilityMenu;

// Add these type definitions to support the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}