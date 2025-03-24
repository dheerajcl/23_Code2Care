import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'kn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations = {
  en: {
    home: 'Home',
    events: 'Events',
    about: 'About',
    donate: 'Donate',
    volunteer: 'Volunteer',
    dashboard: 'Dashboard',
    login: 'Login',
    logout: 'Log out',
    toggleHighContrast: 'Toggle High Contrast',
    toggleLargerText: 'Toggle Larger Text',
    language: 'Language',
    english: 'English',
    hindi: 'Hindi',
    kannada: 'Kannada'
  },
  hi: {
    home: 'होम',
    events: 'इवेंट्स',
    about: 'हमारे बारे में',
    donate: 'दान करें',
    volunteer: 'स्वयंसेवक',
    dashboard: 'डैशबोर्ड',
    login: 'लॉग इन',
    logout: 'लॉग आउट',
    toggleHighContrast: 'हाई कॉन्ट्रास्ट टॉगल करें',
    toggleLargerText: 'बड़ा टेक्स्ट टॉगल करें',
    language: 'भाषा',
    english: 'अंग्रेज़ी',
    hindi: 'हिंदी',
    kannada: 'कन्नड़'
  },
  kn: {
    home: 'ಮುಖಪುಟ',
    events: 'ಇವೆಂಟ್ಗಳು',
    about: 'ನಮ್ಮ ಬಗ್ಗೆ',
    donate: 'ದಾನ ಮಾಡಿ',
    volunteer: 'ಸ್ವಯಂಸೇವಕ',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    login: 'ಲಾಗಿನ್',
    logout: 'ಲಾಗ್ ಔಟ್',
    toggleHighContrast: 'ಹೈ ಕಾಂಟ್ರಾಸ್ಟ್ ಟಾಗಲ್ ಮಾಡಿ',
    toggleLargerText: 'ದೊಡ್ಡ ಪಠ್ಯವನ್ನು ಟಾಗಲ್ ಮಾಡಿ',
    language: 'ಭಾಷೆ',
    english: 'ಇಂಗ್ಲಿಷ್',
    hindi: 'ಹಿಂದಿ',
    kannada: 'ಕನ್ನಡ'
  }
};

export const LanguageProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};