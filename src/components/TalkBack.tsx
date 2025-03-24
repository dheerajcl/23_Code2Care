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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Original shortcut: Ctrl + Alt + T
      const isOriginalShortcut = e.ctrlKey && e.altKey && e.key === 't';
      // New shortcut: Ctrl + Shift + A
      const isNewShortcut = e.ctrlKey && e.altKey && e.key === 'a';

      if (isOriginalShortcut || isNewShortcut) {
        e.preventDefault(); // Prevent default browser behavior
        toggleTalkBack();
      }
    };

    const handleFocus = (e: FocusEvent) => {
      if (isActive && e.target instanceof HTMLElement) {
        speakElement(e.target);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocus);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocus);
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
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const speakElement = (element: HTMLElement) => {
    const text = getElementText(element);
    speak(text);
  };

  const getElementText = (element: HTMLElement): string => {
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      return `${(element as HTMLInputElement).type} field${(element as HTMLInputElement).value ? ', value: ' + (element as HTMLInputElement).value : ''}`;
    }
    if (element.tagName === 'BUTTON') {
      return `Button: ${element.textContent?.trim() || ''}`;
    }
    if (element.tagName === 'A') {
      return `Link: ${element.textContent?.trim() || element.getAttribute('href') || ''}`;
    }
    return element.textContent?.trim() || element.getAttribute('aria-label') || 'Unknown element';
  };

  return (
    <TalkBackContext.Provider value={{ isActive, toggleTalkBack }}>
      {children}
    </TalkBackContext.Provider>
  );
};

const TalkBack = () => null;
export default TalkBack;  