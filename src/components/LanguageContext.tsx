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
    kannada: 'Kannada',
    upcomingEvents: 'Upcoming Events',
    loadingEvents: 'Loading events...',
    failedToLoadEvents: 'Failed to load events. Please try again later.',
    showMore: 'Show More',
    livesImpacted: 'Lives Impacted',
    eventsOrganized: 'Events Organized',
    volunteersEngaged: 'Volunteers Engaged',
    yearsOfService: 'Years of Service',
    aboutUs: 'About Us',
    breakingBarriers: 'Breaking Barriers for Inclusive Growth',
    aboutDescription1: 'Founded in 1997, Samarthanam Trust has been at the forefront of empowering persons with disabilities through various initiatives in education, livelihood, sports, rehabilitation, and cultural activities.',
    aboutDescription2: 'Our technology-driven approach ensures that we can provide the right tools and resources to help individuals overcome barriers and achieve their full potential.',
    learnMore: 'Learn More About Us',
    communityActivitiesAlt: 'Samarthanam Trust community activities',
    heroTitle: 'Empowering Lives Through Inclusive Technology',
    heroSubtitle: 'Join Samarthanam Trust in our mission to support visually impaired, disabled, and underprivileged individuals through accessibility, education, and community.',
    becomeVolunteer: 'Become a Volunteer',
    browseEvents: 'Browse Events',
    scrollDown: 'Scroll down',
    footerDescription: 'Empowering visually impaired, disabled, and underprivileged individuals through technology and community support.',
    facebook: 'Facebook',
    twitter: 'Twitter',
    instagram: 'Instagram',
    youtube: 'YouTube',
    quickLinks: 'Quick Links',
    contact: 'Contact',
    address: 'CA Site No.1, 7th Main, 7th Cross, 3rd Phase, JP Nagar, Bengaluru, Karnataka 560078',
    stayUpdated: 'Stay Updated',
    newsletterDescription: 'Subscribe to our newsletter for updates on events, volunteer opportunities, and more.',
    yourEmail: 'Your email',
    subscribe: 'Subscribe',
    enterValidEmail: 'Please enter a valid email address.',
    subscriptionFailed: 'Subscription failed. Try again later.',
    subscribedSuccessfully: 'Subscribed successfully!',
    copyright: '© {{year}} Samarthanam Trust for the Disabled. All rights reserved.',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service'
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
    kannada: 'कन्नड़',
    upcomingEvents: 'आगामी कार्यक्रम',
    loadingEvents: 'कार्यक्रम लोड हो रहे हैं...',
    failedToLoadEvents: 'कार्यक्रम लोड करने में विफल। कृपया बाद में पुनः प्रयास करें।',
    showMore: 'और दिखाएं',
    livesImpacted: 'प्रभावित जीवन',
    eventsOrganized: 'आयोजित कार्यक्रम',
    volunteersEngaged: 'स्वयंसेवक संलग्न',
    yearsOfService: 'सेवा के वर्ष',
    aboutUs: 'हमारे बारे में',
    breakingBarriers: 'समावेशी विकास के लिए बाधाओं को तोड़ना',
    aboutDescription1: '1997 में स्थापित, समर्थनम ट्रस्ट शिक्षा, आजीविका, खेल, पुनर्वास और सांस्कृतिक गतिविधियों में विभिन्न पहलों के माध्यम से विकलांग व्यक्तियों को सशक्त बनाने में सबसे आगे रहा है।',
    aboutDescription2: 'हमारा प्रौद्योगिकी-संचालित दृष्टिकोण यह सुनिश्चित करता है कि हम व्यक्तियों को बाधाओं को पार करने और उनकी पूरी क्षमता हासिल करने में मदद करने के लिए सही उपकरण और संसाधन प्रदान कर सकें।',
    learnMore: 'हमारे बारे में और जानें',
    communityActivitiesAlt: 'समर्थनम ट्रस्ट समुदाय गतिविधियाँ',
    heroTitle: 'समावेशी प्रौद्योगिकी के माध्यम से जीवन को सशक्त बनाना',
    heroSubtitle: 'सुलभता, शिक्षा और समुदाय के माध्यम से दृष्टिबाधित, अक्षम और वंचित व्यक्तियों का समर्थन करने के हमारे मिशन में समर्थनम ट्रस्ट के साथ शामिल हों।',
    becomeVolunteer: 'स्वयंसेवक बनें',
    browseEvents: 'कार्यक्रम ब्राउज़ करें',
    scrollDown: 'नीचे स्क्रॉल करें',
    footerDescription: 'प्रौद्योगिकी और समुदाय समर्थन के माध्यम से दृष्टिबाधित, अक्षम और वंचित व्यक्तियों को सशक्त बनाना।',
    facebook: 'फेसबुक',
    twitter: 'ट्विटर',
    instagram: 'इंस्टाग्राम',
    youtube: 'यूट्यूब',
    quickLinks: 'त्वरित लिंक',
    contact: 'संपर्क',
    address: 'सीए साइट नंबर 1, 7वीं मेन, 7वीं क्रॉस, तीसरा चरण, जेपी नगर, बेंगलुरु, कर्नाटक 560078',
    stayUpdated: 'अद्यतन रहें',
    newsletterDescription: 'ईवेंट, स्वयंसेवक अवसरों और अधिक के अपडेट के लिए हमारे न्यूज़लेटर की सदस्यता लें।',
    yourEmail: 'आपका ईमेल',
    subscribe: 'सदस्यता लें',
    enterValidEmail: 'कृपया एक मान्य ईमेल पता दर्ज करें।',
    subscriptionFailed: 'सदस्यता विफल हुई। बाद में पुनः प्रयास करें।',
    subscribedSuccessfully: 'सफलतापूर्वक सदस्यता ली गई!',
    copyright: '© {{year}} समर्थनम ट्रस्ट फॉर द डिसएबल्ड। सर्वाधिकार सुरक्षित।',
    privacyPolicy: 'गोपनीयता नीति',
    termsOfService: 'सेवा की शर्तें'
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
    kannada: 'ಕನ್ನಡ',
    upcomingEvents: 'ಮುಂಬರುವ ಈವೆಂಟ್‌ಗಳು',
    loadingEvents: 'ಈವೆಂಟ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    failedToLoadEvents: 'ಈವೆಂಟ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    showMore: 'ಇನ್ನಷ್ಟು ತೋರಿಸು',
    livesImpacted: 'ಪ್ರಭಾವಿತ ಜೀವನಗಳು',
    eventsOrganized: 'ಆಯೋಜಿಸಲಾದ ಈವೆಂಟ್‌ಗಳು',
    volunteersEngaged: 'ಸ್ವಯಂಸೇವಕರು ತೊಡಗಿಸಿಕೊಂಡಿದ್ದಾರೆ',
    yearsOfService: 'ಸೇವೆಯ ವರ್ಷಗಳು',
    aboutUs: 'ನಮ್ಮ ಬಗ್ಗೆ',
    breakingBarriers: 'ಒಳಗೊಳ್ಳುವ ಬೆಳವಣಿಗೆಗಾಗಿ ತಡೆಗಳನ್ನು ಮುರಿಯುವುದು',
    aboutDescription1: '1997 ರಲ್ಲಿ ಸ್ಥಾಪನೆಯಾದ ಸಮರ್ಥನಂ ಟ್ರಸ್ಟ್ ಶಿಕ್ಷಣ, ಜೀವನೋಪಾಯ, ಕ್ರೀಡೆ, ಪುನರ್ವಸತಿ ಮತ್ತು ಸಾಂಸ್ಕೃತಿಕ ಚಟುವಟಿಕೆಗಳಲ್ಲಿ ವಿವಿಧ ಉಪಕ್ರಮಗಳ ಮೂಲಕ ಅಂಗವಿಕಲರನ್ನು ಸಶಕ್ತಗೊಳಿಸುವಲ್ಲಿ ಮುಂಚೂಣಿಯಲ್ಲಿದೆ.',
    aboutDescription2: 'ನಮ್ಮ ತಂತ್ರಜ್ಞಾನ-ಚಾಲಿತ ವಿಧಾನವು ವ್ಯಕ್ತಿಗಳು ತಡೆಗಳನ್ನು ಮೀರಿ ತಮ್ಮ ಪೂರ್ಣ ಸಾಮರ್ಥ್ಯವನ್ನು ಸಾಧಿಸಲು ಸಹಾಯ ಮಾಡಲು ಸರಿಯಾದ ಉಪಕರಣಗಳು ಮತ್ತು ಸಂಪನ್ಮೂಲಗಳನ್ನು ಒದಗಿಸಬಹುದೆಂದು ಖಚಿತಪಡಿಸುತ್ತದೆ.',
    learnMore: 'ನಮ್ಮ ಬಗ್ಗೆ ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ',
    communityActivitiesAlt: 'ಸಮರ್ಥನಂ ಟ್ರಸ್ಟ್ ಸಮುದಾಯ ಚಟುವಟಿಕೆಗಳು',
    heroTitle: 'ಒಳಗೊಳ್ಳುವ ತಂತ್ರಜ್ಞಾನದ ಮೂಲಕ ಜೀವನಗಳನ್ನು ಸಶಕ್ತಗೊಳಿಸುವುದು',
    heroSubtitle: 'ಪ್ರವೇಶಸಾಧ್ಯತೆ, ಶಿಕ್ಷಣ ಮತ್ತು ಸಮುದಾಯದ ಮೂಲಕ ದೃಷ್ಟಿದೋಷ, ಅಂಗವೈಕಲ್ಯ ಮತ್ತು ವಂಚಿತ ವ್ಯಕ್ತಿಗಳನ್ನು ಬೆಂಬಲಿಸುವ ನಮ್ಮ ಧ್ಯೇಯದಲ್ಲಿ ಸಮರ್ಥನಂ ಟ್ರಸ್ಟ್‌ಗೆ ಸೇರಿಕೊಳ್ಳಿ.',
    becomeVolunteer: 'ಸ್ವಯಂಸೇವಕರಾಗಿ',
    browseEvents: 'ಈವೆಂಟ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    scrollDown: 'ಕೆಳಗೆ ಸ್ಕ್ರೋಲ್ ಮಾಡಿ',
    footerDescription: 'ತಂತ್ರಜ್ಞಾನ ಮತ್ತು ಸಮುದಾಯ ಬೆಂಬಲದ ಮೂಲಕ ದೃಷ್ಟಿದೋಷ, ಅಂಗವೈಕಲ್ಯ ಮತ್ತು ವಂಚಿತ ವ್ಯಕ್ತಿಗಳನ್ನು ಸಶಕ್ತಗೊಳಿಸುವುದು.',
    facebook: 'ಫೇಸ್‌ಬುಕ್',
    twitter: 'ಟ್ವಿಟರ್',
    instagram: 'ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್',
    youtube: 'ಯೂಟ್ಯೂಬ್',
    quickLinks: 'ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು',
    contact: 'ಸಂಪರ್ಕ',
    address: 'ಸಿಎ ಸೈಟ್ ಸಂಖ್ಯೆ 1, 7ನೇ ಮೇನ್, 7ನೇ ಕ್ರಾಸ್, 3ನೇ ಹಂತ, ಜೆಪಿ ನಗರ, ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ 560078',
    stayUpdated: 'ಅಪ್‌ಡೇಟ್ ಆಗಿರಿ',
    newsletterDescription: 'ಈವೆಂಟ್‌ಗಳು, ಸ್ವಯಂಸೇವಕ ಅವಕಾಶಗಳು ಮತ್ತು ಇನ್ನಷ್ಟು ತಾಜಾ ಮಾಹಿತಿಗಾಗಿ ನಮ್ಮ ಸುದ್ದಿಪತ್ರಕ್ಕೆ ಚಂದಾದಾರರಾಗಿ.',
    yourEmail: 'ನಿಮ್ಮ ಇಮೇಲ್',
    subscribe: 'ಚಂದಾದಾರರಾಗಿ',
    enterValidEmail: 'ದಯವಿಟ್ಟು ಮಾನ್ಯ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.',
    subscriptionFailed: 'ಚಂದಾದಾರಿಕೆ ವಿಫಲವಾಗಿದೆ. ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    subscribedSuccessfully: 'ಯಶಸ್ವಿಯಾಗಿ ಚಂದಾದಾರರಾಗಿದ್ದೀರಿ!',
    copyright: '© {{year}} ಸಮರ್ಥನಂ ಟ್ರಸ್ಟ್ ಫಾರ್ ದಿ ಡಿಸೇಬಲ್ಡ್. ಎಲ್ಲಾ ಹಕ್ಕುಗಳು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.',
    privacyPolicy: 'ಗೌಪ್ಯತಾ ನೀತಿ',
    termsOfService: 'ಸೇವಾ ನಿಯಮಗಳು'
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