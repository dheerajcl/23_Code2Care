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
import { useLanguage } from './LanguageContext'; // Add language context import

interface VoiceInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetElementId: string;
}

const VoiceInputDialog: React.FC<VoiceInputDialogProps> = ({ isOpen, onClose, targetElementId }) => {
  const [transcript, setTranscript] = useState('');
  const { t } = useLanguage(); // Add translation hook

  const handleTranscriptChange = (newTranscript: string) => {
    const cleanedTranscript = newTranscript.replace(/\.+$/, '').trim();
    setTranscript(cleanedTranscript);
  };

  const handleDone = () => {
    if (targetElementId) {
      const inputElement = document.getElementById(targetElementId) as HTMLInputElement | HTMLTextAreaElement;
      if (inputElement) {
        inputElement.value = transcript;
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('voiceInput')}</DialogTitle>
          <p className="text-sm text-muted-foreground">{t('voiceInputDescription')}</p>
        </DialogHeader>
        <div className="py-4">
          <WriteByVoice 
            onTranscriptChange={handleTranscriptChange} 
            targetElementId={targetElementId}
          />
          
          {transcript && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <h4 className="text-sm font-medium mb-1">{t('transcribedText')}</h4>
              <p className="text-sm">{transcript}</p>
            </div>
          )}
        </div>
        <DialogClose asChild>
          <Button type="button" variant="secondary" onClick={handleDone}>
            {t('done')}
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
  const { t } = useLanguage(); // Add translation hook

  useEffect(() => {
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
    
    const event = new CustomEvent('voiceInputToggled');
    document.dispatchEvent(event);
    
    window.location.reload();
  };
  
  const handleVoiceButtonClick = useCallback((elementId: string) => {
    setCurrentTargetId(elementId);
    setVoiceDialogOpen(true);
  }, []);
  
  const closeVoiceDialog = () => {
    setVoiceDialogOpen(false);
  };

  useEffect(() => {
    if (!isVoiceInputEnabled) return;
    
    const handleVoiceInputRequest = (e: CustomEvent) => {
      const targetId = e.detail.targetId;
      if (targetId) {
        handleVoiceButtonClick(targetId);
      }
    };
    
    document.addEventListener('voiceInputRequested', handleVoiceInputRequest as EventListener);
    
    return () => {
      document.removeEventListener('voiceInputRequested', handleVoiceInputRequest as EventListener);
    };
  }, [isVoiceInputEnabled, handleVoiceButtonClick]);
  
  useEffect(() => {
    if (!isVoiceInputEnabled) return;
    
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.closest('.voice-input-btn')) {
        e.preventDefault();
        e.stopPropagation();
        
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

  useEffect(() => {
    if (!isVoiceInputEnabled) return;
    
    const addVoiceButtons = () => {
      const formElements = document.querySelectorAll(
        'input[type="text"]:not(.custom-input), input[type="search"]:not(.custom-input), input[type="email"]:not(.custom-input), input[type="password"]:not(.custom-input), textarea:not(.custom-textarea)'
      );
      
      formElements.forEach((element, index) => {
        const elementId = element.id || `voice-input-field-${index}`;
        
        if (!element.id) {
          element.id = elementId;
        }
        
        const parentEl = element.parentElement;
        if (parentEl && !parentEl.querySelector(`.voice-input-btn[data-target-id="${elementId}"]`)) {
          if (window.getComputedStyle(parentEl).position === 'static') {
            parentEl.style.position = 'relative';
          }
          
          const voiceBtn = document.createElement('button');
          voiceBtn.className = 'voice-input-btn absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground';
          voiceBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>';
          voiceBtn.setAttribute('aria-label', t('voiceInput'));
          voiceBtn.setAttribute('data-target-id', elementId);
          
          parentEl.appendChild(voiceBtn);
        }
      });
    };
    
    addVoiceButtons();
    
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
  }, [isVoiceInputEnabled, t]); // Added 't' to dependencies

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button 
            className="fixed bottom-6 right-6 z-50 bg-[#AE1919] hover:bg-red-600 text-white" 
            size="lg" 
            aria-label={t('accessibilityOptions')}
          >
            <Eye className="h-5 w-5 mr-2" />
            <span>{t('accessibility')}</span>
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
                <span>{t('lightMode')}</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 mr-2" />
                <span>{t('darkMode')}</span>
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={toggleHighContrast}
            className="flex cursor-pointer items-center"
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            <span>{t(isHighContrast ? 'disableHighContrast' : 'enableHighContrast')}</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={toggleTalkBack} className="flex cursor-pointer items-center">
            {isTalkBackActive ? (
              <>
                <VolumeX className="h-4 w-4 mr-2" />
                <span>{t('disableTalkBack')}</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                <span>{t('enableTalkBack')}</span>
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={toggleVoiceInput} className="flex cursor-pointer items-center">
            <Mic className="h-4 w-4 mr-2" />
            <span>{t(isVoiceInputEnabled ? 'disableVoiceInput' : 'enableVoiceInput')}</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={increaseFontSize}
            disabled={fontSize >= 150}
            className="flex cursor-pointer items-center"
          >
            <ZoomIn className="h-4 w-4 mr-2" />
            <span>{t('increaseTextSize')}</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={decreaseFontSize}
            disabled={fontSize <= 80}
            className="flex cursor-pointer items-center"
          >
            <ZoomOut className="h-4 w-4 mr-2" />
            <span>{t('decreaseTextSize')}</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={resetFontSize}
            disabled={fontSize === 100}
            className="flex cursor-pointer items-center"
          >
            <Type className="h-4 w-4 mr-2" />
            <span>{t('resetTextSize')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <VoiceInputDialog 
        isOpen={voiceDialogOpen} 
        onClose={closeVoiceDialog} 
        targetElementId={currentTargetId} 
      />
    </>
  );
};

export default AccessibilityMenu;

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}