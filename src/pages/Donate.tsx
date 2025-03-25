import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  CreditCard, 
  Calendar, 
  Gift, 
  DollarSign, 
  Info, 
  CheckCircle, 
  User,
  Mail, 
  Phone,
  Home,
  ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import LandingHeader from '@/components/LandingHeader';
import { useLanguage } from '../components/LanguageContext'; // Add language context import
import { supabase } from '@/lib/supabase';

const donationOptions = [
  { value: 'education', labelKey: 'donationEducation' },
  { value: 'skill', labelKey: 'donationSkill' },
  { value: 'livelihood', labelKey: 'donationLivelihood' },
  { value: 'sports', labelKey: 'donationSports' },
  { value: 'cultural', labelKey: 'donationCultural' },
  { value: 'general', labelKey: 'donationGeneral' }
];

const presetAmounts = [500, 1000, 2000, 5000, 10000];

const DonationPage: React.FC = () => {
  const { t } = useLanguage(); // Add translation hook
  const { toast } = useToast();
  const [donationType, setDonationType] = useState('oneTime');
  const [amount, setAmount] = useState<number | string>(1000);
  const [customAmount, setCustomAmount] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [donationPurpose, setDonationPurpose] = useState('general');
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    panNumber: '',
    message: ''
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (value: number) => {
    setCustomAmount(false);
    setAmount(value);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value);
    }
  };

  const generateTransactionId = () => {
    return 'TXN' + Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!personalInfo.name || !personalInfo.email || !personalInfo.phone) {
      toast({
        title: t('requiredFieldsMissing'),
        description: t('pleaseFillRequiredFields'),
        variant: "destructive"
      });
      return;
    }
    
    if (!agreeToTerms) {
      toast({
        title: t('termsAgreementRequired'),
        description: t('pleaseAgreeTerms'),
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: t('processingDonation'),
      description: t('pleaseWaitProcessing'),
    });

    setIsSubmitting(true);
    
    try {
      const result = await submitDonationToSupabase();
      
      toast({
        title: t('donationSuccessful'),
        description: t('thankYouDonation', { 
          amount: typeof amount === 'string' ? amount : amount.toLocaleString(),
          transactionId: result.transactionId 
        }),
        variant: "default",
      });
      
      setAmount(1000);
      setCustomAmount(false);
      setDonationType('oneTime');
      setPaymentMethod('card');
      setDonationPurpose('general');
      setPersonalInfo({
        name: '',
        email: '',
        phone: '',
        address: '',
        panNumber: '',
        message: ''
      });
      setAgreeToTerms(false);
      setReceiveUpdates(false);
      
    } catch (error) {
      console.error('Donation processing error:', error);
      toast({
        title: t('donationFailed'),
        description: error instanceof Error ? error.message : t('unexpectedError'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitDonationToSupabase = async () => {
    try {
      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error(t('invalidDonationAmount'));
      }

      const transactionId = generateTransactionId();
      
      const donationData = {
        amount: numericAmount,
        donation_type: donationType,
        donation_purpose: donationPurpose,
        payment_method: paymentMethod,
        payment_status: 'completed',
        transaction_id: transactionId,
        donor_name: personalInfo.name,
        donor_email: personalInfo.email,
        donor_phone: personalInfo.phone,
        donor_address: personalInfo.address || null,
        pan_number: personalInfo.panNumber || null,
        donor_message: personalInfo.message || null,
        receive_updates: receiveUpdates,
      };

      const { data, error } = await supabase
        .from('donation')
        .insert([donationData])
        .select();

      if (error) throw error;
      
      return { success: true, data, transactionId };
    } catch (error) {
      console.error('Error submitting donation to Supabase:', error);
      throw error;
    }
  };

  const getDonationById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('donation')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching donation:', error);
      throw error;
    }
  };

  const updateDonationStatus = async (id: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('donation')
        .update({ 
          payment_status: status,
        })
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating donation status:', error);
      throw error;
    }
  };

  const getDonationsByEmail = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('donation')
        .select('*')
        .eq('donor_email', email)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching donations by email:', error);
      throw error;
    }
  };

  const isFormValid = () => {
    return (
      personalInfo.name &&
      personalInfo.email &&
      personalInfo.phone &&
      agreeToTerms &&
      amount
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />

      <main className="flex-grow">
        <section className="bg-primary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold mb-6 mt-16"
              >
                {t('donationTitle')}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-muted-foreground text-lg mb-8"
              >
                {t('donationSubtitle')}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-border mb-8 max-w-md mx-auto dark:bg-red-900 donate-tax-section"
              >
                <Info className="text-primary h-8 w-8 dark:text-white donate-tax-section-text" />
                <p className="text-sm">
                  {t('taxExemptionInfo')}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{t('donationDetails')}</CardTitle>
                  <CardDescription>{t('donationDetailsDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                      <Label>{t('donationType')}</Label>
                      <Tabs 
                        defaultValue="oneTime" 
                        value={donationType}
                        onValueChange={setDonationType}
                        className="w-full"
                      >
                        <TabsList className="grid grid-cols-2">
                          <TabsTrigger value="oneTime">{t('oneTimeDonation')}</TabsTrigger>
                          <TabsTrigger value="monthly">{t('monthlyDonation')}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="oneTime" className="pt-4">
                          <p className="text-sm text-muted-foreground">
                            {t('oneTimeDonationDescription')}
                          </p>
                        </TabsContent>
                        <TabsContent value="monthly" className="pt-4">
                          <p className="text-sm text-muted-foreground">
                            {t('monthlyDonationDescription')}
                          </p>
                        </TabsContent>
                      </Tabs>
                    </div>

                    <div className="space-y-4">
                      <Label>{t('donationAmount')}</Label>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {presetAmounts.map(preset => (
                          <Button
                            key={preset}
                            type="button"
                            variant={amount === preset && !customAmount ? "default" : "outline"}
                            onClick={() => handleAmountChange(preset)}
                            className="h-12"
                          >
                            ₹{preset.toLocaleString()}
                          </Button>
                        ))}
                        <Button
                          type="button"
                          variant={customAmount ? "default" : "outline"}
                          onClick={() => {
                            setCustomAmount(true);
                            setAmount('');
                          }}
                          className="h-12"
                        >
                          {t('custom')}
                        </Button>
                      </div>
                      
                      {customAmount && (
                        <div className="pt-2">
                          <Label htmlFor="customAmount">{t('enterAmount')}</Label>
                          <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <DollarSign className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <Input
                              id="customAmount"
                              type="text"
                              value={amount}
                              onChange={handleCustomAmountChange}
                              className="pl-10"
                              placeholder={t('enterAmountPlaceholder')}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Label>{t('donationPurpose')}</Label>
                      <RadioGroup 
                        value={donationPurpose} 
                        onValueChange={setDonationPurpose}
                        className="grid grid-cols-2 md:grid-cols-3 gap-4"
                      >
                        {donationOptions.map(option => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <Label htmlFor={option.value}>{t(option.labelKey)}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-4">
                      <Label>{t('paymentMethod')}</Label>
                      <Tabs 
                        defaultValue="card" 
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                        className="w-full"
                      >
                        <TabsList className="grid grid-cols-3">
                          <TabsTrigger value="card">
                            <CreditCard className="h-4 w-4 mr-2" />
                            {t('card')}
                          </TabsTrigger>
                          <TabsTrigger value="upi">
                            <span className="mr-2">{t('upi')}</span>
                          </TabsTrigger>
                          <TabsTrigger value="netbanking">
                            <span className="mr-2">{t('netbanking')}</span>
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="card" className="pt-4">
                          <p className="text-sm text-muted-foreground">
                            {t('cardDescription')}
                          </p>
                        </TabsContent>
                        <TabsContent value="upi" className="pt-4">
                          <p className="text-sm text-muted-foreground">
                            {t('upiDescription')}
                          </p>
                        </TabsContent>
                        <TabsContent value="netbanking" className="pt-4">
                          <p className="text-sm text-muted-foreground">
                            {t('netbankingDescription')}
                          </p>
                        </TabsContent>
                      </Tabs>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">{t('personalInformation')}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">{t('fullName')} <span className="text-red-500">*</span></Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Input
                              id="name"
                              name="name"
                              value={personalInfo.name}
                              onChange={handlePersonalInfoChange}
                              className="pl-10"
                              placeholder={t('enterFullName')}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">{t('emailAddress')} <span className="text-red-500">*</span></Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={personalInfo.email}
                              onChange={handlePersonalInfoChange}
                              className="pl-10"
                              placeholder={t('enterEmail')}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">{t('phoneNumber')} <span className="text-red-500">*</span></Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Input
                              id="phone"
                              name="phone"
                              value={personalInfo.phone}
                              onChange={handlePersonalInfoChange}
                              className="pl-10"
                              placeholder={t('enterPhone')}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="panNumber">{t('panNumber')}</Label>
                          <Input
                            id="panNumber"
                            name="panNumber"
                            value={personalInfo.panNumber}
                            onChange={handlePersonalInfoChange}
                            placeholder={t('enterPanNumber')}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">{t('address')}</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Home className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input
                            id="address"
                            name="address"
                            value={personalInfo.address}
                            onChange={handlePersonalInfoChange}
                            className="pl-10"
                            placeholder={t('enterAddress')}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message">{t('messageOptional')}</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={personalInfo.message}
                          onChange={handlePersonalInfoChange}
                          placeholder={t('shareWhyDonate')}
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="terms" 
                          checked={agreeToTerms}
                          onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                          required
                        />
                        <Label htmlFor="terms" className="text-sm">
                          {t('agreeTerms', { 
                            termsLink: <a href="/terms" className="text-primary hover:underline">{t('termsAndConditions')}</a>,
                            privacyLink: <a href="/privacy" className="text-primary hover:underline">{t('privacyPolicy')}</a>
                          })}
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="updates" 
                          checked={receiveUpdates}
                          onCheckedChange={(checked) => setReceiveUpdates(checked as boolean)}
                        />
                        <Label htmlFor="updates" className="text-sm">
                          {t('keepMeUpdated')}
                        </Label>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={!isFormValid() || isSubmitting}
                    >
                      {isSubmitting ? t('processing') : t('donateButton', { amount: typeof amount === 'string' ? amount || '0' : amount.toLocaleString() })}
                      {!isSubmitting && <Heart className="ml-2 h-4 w-4" />}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('whyDonate')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <p className="text-sm">{t('whyDonateEducation')}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <p className="text-sm">{t('whyDonateSkill')}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <p className="text-sm">{t('whyDonateSports')}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <p className="text-sm">{t('whyDonateLivelihood')}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <p className="text-sm">{t('whyDonateTax')}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('yourImpact')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-2 bg-primary/10 rounded-lg">
                      <p className="text-sm mb-1">{t('impact1000Title')}</p>
                      <p className="font-semibold">{t('impact1000')}</p>
                    </div>
                    <div className="text-center py-2 bg-primary/10 rounded-lg">
                      <p className="text-sm mb-1">{t('impact5000Title')}</p>
                      <p className="font-semibold">{t('impact5000')}</p>
                    </div>
                    <div className="text-center py-2 bg-primary/10 rounded-lg">
                      <p className="text-sm mb-1">{t('impact10000Title')}</p>
                      <p className="font-semibold">{t('impact10000')}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('needHelp')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      {t('needHelpDescription')}
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        +91 80 2672 6500
                      </p>
                      <p className="text-sm flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        donations@samarthanam.org
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('ourSupporters')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('supportersDescription')}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              <img src="/oracle-thumb.png" alt={t('supporterLogo')} className="h-24 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="/nike.png" alt={t('supporterLogo')} className="h-16 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="/morgan_stanley.png" alt={t('supporterLogo')} className="h-16 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="/microsoft-logo.png" alt={t('supporterLogo')} className="h-20 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="/anz.png" alt={t('supporterLogo')} className="h-16 opacity-70 hover:opacity-100 transition-opacity" />
            </div>  
          </div>
        </section>
      </main>

      <Footer />
      <AccessibilityMenu />
    </div>
  );
};

export default DonationPage;