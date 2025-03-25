import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from './LanguageContext'; // Add language context import

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { t } = useLanguage(); // Get translation function

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
  
    if (!email) {
      setMessage(t('enterValidEmail'));
      return;
    }
  
    const { error } = await supabase.from('newsletter').insert([{ email }]);
  
    if (error) {
      console.error('Subscription failed:', error.message);
      setMessage(t('subscriptionFailed'));
    } else {
      setMessage(t('subscribedSuccessfully'));
      setEmail('');
    }
  };

  return (
    <footer className="bg-secondary pt-12 pb-6 border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Organization Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                S
              </div>
              <span className="font-semibold text-xl">Samarthanam</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              {t('footerDescription')}
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/samarthanaminfo/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label={t('facebook')}>
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/SamarthanamTFTD" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label={t('twitter')}>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/samarthanamtrustforthedisabled" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label={t('instagram')}>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.youtube.com/c/samarthanamtrustforthedisabled" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label={t('youtube')}>
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-medium text-lg mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">{t('home')}</Link></li>
              <li><Link to="/events" className="text-muted-foreground hover:text-foreground transition-colors">{t('events')}</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">{t('aboutUs')}</Link></li>
              <li><Link to="/join-us" className="text-muted-foreground hover:text-foreground transition-colors">{t('volunteer')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-medium text-lg mb-4">{t('contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{t('address')}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <a href="tel:+918861799800" className="text-muted-foreground hover:text-foreground transition-colors">+91 88617 99800</a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <a href="mailto:contact@samarthanam.org" className="text-muted-foreground hover:text-foreground transition-colors">contact@samarthanam.org</a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-3 lg:col-span-1">
            <h3 className="font-medium text-lg mb-4">{t('stayUpdated')}</h3>
            <p className="text-muted-foreground text-sm mb-4">{t('newsletterDescription')}</p>
            <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
              <div className="flex">
                <input
                  type="email"
                  placeholder={t('yourEmail')}
                  aria-label={t('yourEmail')}
                  className="flex-1 min-w-0 px-3 py-2 text-sm bg-background border border-input rounded-l-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium rounded-r-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {t('subscribe')}
                </button>
              </div>
              {message && <p className="text-sm text-muted-foreground mt-2">{message}</p>}
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">{t('copyright', { year: new Date().getFullYear() })}</p>
            <div className="flex space-x-6 mr-44">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('privacyPolicy')}</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('termsOfService')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;