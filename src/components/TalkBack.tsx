// src/components/TalkBack.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface TalkBackContextType {
  isActive: boolean;
  toggleTalkBack: () => void;
}

const TalkBackContext = createContext<TalkBackContextType | undefined>(undefined);

export const useTalkBack = () => {
  const context = useContext(TalkBackContext);
  if (!context) {
    throw new Error('useTalkBack must be used within a TalkBackProvider');
  }
  return context;
};

interface TalkBackProviderProps {
  children: ReactNode;
}

export const TalkBackProvider = ({ children }: TalkBackProviderProps) => {
  const [isActive, setIsActive] = useState(false);
  const speechSynthesis = window.speechSynthesis;
  let lastTap = 0;
  let lastTarget: EventTarget | null = null;
  let speakTimeout: NodeJS.Timeout | null = null;

  const isMobile = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isOriginalShortcut = e.ctrlKey && e.altKey && e.key === 't';
      const isNewShortcut = e.ctrlKey && e.shiftKey && e.key === 's';
      if (isOriginalShortcut || isNewShortcut) {
        e.preventDefault();
        toggleTalkBack();
      }
    };

    const handleFocus = (e: FocusEvent) => {
      if (isActive && e.target instanceof HTMLElement) {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();
        if (!selectedText) {
          speakElement(e.target);
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (isActive && e.target instanceof HTMLElement) {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();
        if (!selectedText) {
          speakElement(e.target);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!isActive) return;

      if (e.touches.length === 2) {
        const now = Date.now();
        if (now - lastTap < 300) {
          e.preventDefault();
          toggleTalkBack();
        }
        lastTap = now;
        return;
      }

      if (e.touches.length === 1) {
        const target = e.target as HTMLElement;
        const tagName = target.tagName.toLowerCase();

        if (tagName !== 'button' && tagName !== 'a') return;

        const now = Date.now();

        if (now - lastTap < 300 && target === lastTarget) {
          e.preventDefault();
          console.log('Double tap detected on:', target);
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
          });
          target.dispatchEvent(clickEvent);
        } else {
          e.preventDefault();
          console.log('Single tap detected on:', target);
          speakElement(target);
        }

        lastTap = now;
        lastTarget = target;
      }
    };

    const handleSelectionChange = () => {
      if (!isActive) return;
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      if (selectedText) {
        speak(selectedText);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocus, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocus, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (speakTimeout) clearTimeout(speakTimeout);
    };
  }, [isActive]);

  const toggleTalkBack = () => {
    setIsActive((prev) => {
      const newState = !prev;
      document.body.classList.toggle('talkback-active', newState);
      const status = newState ? 'Talk-back enabled' : 'Talk-back disabled';
      speak(status, true); // Priority speech for toggle
      return newState;
    });
  };

  const speak = (text: string, priority = false) => {
    console.log('Speaking:', text);
    if (speakTimeout && !priority) {
      clearTimeout(speakTimeout);
    }

    speechSynthesis.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.onend = () => {
      console.log('Speech ended:', text);
      speakTimeout = null;
    };
    utterance.onerror = (e) => {
      if (e.error !== 'interrupted') { // Only log non-interruption errors
        console.error('Speech error:', e);
      }
    };

    if (priority) {
      speechSynthesis.speak(utterance); // Immediate for toggle messages
    } else {
      speakTimeout = setTimeout(() => {
        speechSynthesis.speak(utterance);
        speakTimeout = null;
      }, 200); // Debounce non-priority speech by 200ms
    }
  };

  const speakElement = (element: HTMLElement) => {
    const text = getElementText(element);
    if (text) speak(text);
  };

  const getElementText = (element: HTMLElement): string => {
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      return `${(element as HTMLInputElement).type} field${(element as HTMLInputElement).value ? ', value: ' + (element as HTMLInputElement).value : ''}`;
    }
    if (element.tagName === 'BUTTON') {
      const buttonText = element.textContent?.trim() || element.querySelector('span.sr-only')?.textContent?.trim();
      return `Button: ${buttonText || 'unnamed'}`;
    }
    if (element.tagName === 'A') {
      const linkText = element.textContent?.trim() || element.getAttribute('href') || 'unnamed';
      return `Link: ${linkText}`;
    }

    const content = element.textContent?.trim();
    const role = element.getAttribute('role');
    return content || `${role || 'element'}: unnamed`;
  };

  return (
    <TalkBackContext.Provider value={{ isActive, toggleTalkBack }}>
      {children}
    </TalkBackContext.Provider>
  );
};

const TalkBack = () => null;
export default TalkBack;