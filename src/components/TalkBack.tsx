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

  // Detect if we're on a mobile device (basic heuristic)
  const isMobile = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  useEffect(() => {
    // Keyboard shortcuts for desktop
    const handleKeyDown = (e: KeyboardEvent) => {
      const isOriginalShortcut = e.ctrlKey && e.altKey && e.key === 't';
      const isNewShortcut = e.ctrlKey && e.shiftKey && e.key === 's';
      if (isOriginalShortcut || isNewShortcut) {
        e.preventDefault();
        toggleTalkBack();
      }
    };

    // Focus for desktop tab navigation
    const handleFocus = (e: FocusEvent) => {
      if (isActive && e.target instanceof HTMLElement) {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();
        if (!selectedText) {
          speakElement(e.target);
        }
      }
    };

    // Click for desktop mouse use
    const handleClick = (e: MouseEvent) => {
      if (isActive && e.target instanceof HTMLElement) {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();
        if (!selectedText) {
          speakElement(e.target);
        }
      }
    };

    // Mobile touch handling
    const handleTouchStart = (e: TouchEvent) => {
      if (!isActive) return;

      if (e.touches.length === 2) { // Two-finger toggle
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

        // Only handle buttons and links on mobile
        if (tagName !== 'button' && tagName !== 'a') return;

        const now = Date.now();

        if (now - lastTap < 300 && target === lastTarget) { // Double tap
          e.preventDefault();
          console.log('Double tap detected on:', target);
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
          });
          target.dispatchEvent(clickEvent);
        } else { // Single tap
          e.preventDefault();
          console.log('Single tap detected on:', target);
          speakElement(target);
        }

        lastTap = now;
        lastTarget = target;
      }
    };

    // Speak selected text (works on both desktop and mobile)
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
    };
  }, [isActive]);

  const toggleTalkBack = () => {
    setIsActive((prev) => {
      const newState = !prev;
      document.body.classList.toggle('talkback-active', newState);
      const status = newState ? 'Talk-back enabled' : 'Talk-back disabled';
      speak(status);
      return newState;
    });
  };

  const speak = (text: string) => {
    console.log('Speaking:', text);
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.onend = () => console.log('Speech ended:', text);
    utterance.onerror = (e) => console.error('Speech error:', e);
    speechSynthesis.speak(utterance);
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