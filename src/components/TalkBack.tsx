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
    // Keyboard shortcuts for desktop
    const handleKeyDown = (e: KeyboardEvent) => {
      const isOriginalShortcut = e.ctrlKey && e.altKey && e.key === 't';
      const isNewShortcut = e.ctrlKey && e.shiftKey && e.key === 's';
      if (isOriginalShortcut || isNewShortcut) {
        e.preventDefault();
        toggleTalkBack();
      }
    };

    // Focus and click for element reading
    const handleFocus = (e: FocusEvent) => {
      if (isActive && e.target instanceof HTMLElement) {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();
        if (!selectedText) { // Only speak element if no text is selected
          speakElement(e.target);
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (isActive && e.target instanceof HTMLElement) {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();
        if (!selectedText) { // Only speak element if no text is selected
          speakElement(e.target);
        }
      }
    };

    // Gesture for mobile (two-finger double-tap)
    let lastTap = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const now = Date.now();
        if (now - lastTap < 300) {
          e.preventDefault();
          toggleTalkBack();
        }
        lastTap = now;
      }
    };

    // Speak selected text only
    const handleSelectionChange = () => {
      if (!isActive) return;
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      if (selectedText) {
        speak(selectedText); // Speak only the selected text
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocus, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('touchstart', handleTouchStart);
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
    console.log('Speaking:', text); // Debug
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