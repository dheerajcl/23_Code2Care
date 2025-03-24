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

  useEffect(() => {
    // Keyboard shortcuts for desktop
    const handleKeyDown = (e: KeyboardEvent) => {
      const isOriginalShortcut = e.ctrlKey && e.altKey && e.key === 't';
      const isNewShortcut = e.ctrlKey && e.altKey && e.key === 'a';
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

    // Mobile touch handling (single tap speaks, double tap activates)
    const handleTouchStart = (e: TouchEvent) => {
      if (!isActive || e.touches.length > 1) { // Ignore multi-touch except for toggle
        if (e.touches.length === 2) {
          const now = Date.now();
          if (now - lastTap < 300) {
            e.preventDefault();
            toggleTalkBack();
          }
          lastTap = now;
        }
        return;
      }

      const target = e.target as HTMLElement;
      const now = Date.now();

      if (now - lastTap < 300 && target === lastTarget) { // Double tap
        e.preventDefault(); // Prevent default single-tap action
        const clickEvent = new Event('click', { bubbles: true });
        target.dispatchEvent(clickEvent); // Trigger the original action
      } else { // Single tap
        e.preventDefault(); // Stop immediate action
        speakElement(target); // Speak the element
      }

      lastTap = now;
      lastTarget = target;
    };

    // Speak selected text
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
      return `Link: ${element.textContent?.trim() || element.getAttribute('href') || 'unnamed'}`;
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