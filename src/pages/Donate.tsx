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
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
import { supabase } from '@/lib/supabase';

const donationOptions = [
  { value: 'education', label: 'Education' },
  { value: 'skill', label: 'Skill Development' },
  { value: 'livelihood', label: 'Livelihood' },
  { value: 'sports', label: 'Sports' },
  { value: 'cultural', label: 'Cultural Programs' },
  { value: 'general', label: 'General Donation' }
];

const presetAmounts = [500, 1000, 2000, 5000, 10000];

const DonationPage: React.FC = () => {
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

  // Function to generate a random transaction ID
  const generateTransactionId = () => {
    return 'TXN' + Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  };

  // Function to submit donation to Supabase


  // Function to handle donation form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!personalInfo.name || !personalInfo.email || !personalInfo.phone) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (!agreeToTerms) {
      toast({
        title: "Terms Agreement Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive"
      });
      return;
    }
    
    // Show processing toast
    toast({
      title: "Processing Donation",
      description: "Please wait while we process your donation...",
    });

    setIsSubmitting(true);
    
    try {
      // In a real application, you would process the payment here
      // For demo purposes, we'll assume payment is successful and store the donation

      // Submit donation to Supabase
      const result = await submitDonationToSupabase();
      
      // Success response
      toast({
        title: "Donation Successful!",
        description: `Thank you for your donation of ₹${typeof amount === 'string' ? amount : amount.toLocaleString()}. Transaction ID: ${result.transactionId}`,
        variant: "default",
      });
      
      // Reset form
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
        title: "Donation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

   // Update the submitDonationToSupabase function to match the database schema
  const submitDonationToSupabase = async () => {
    try {
      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error('Invalid donation amount');
      }

      const transactionId = generateTransactionId();
      
      // Prepare donation data with snake_case column names to match the DB schema
      const donationData = {
        amount: numericAmount,
        donation_type: donationType,
        donation_purpose: donationPurpose,
        payment_method: paymentMethod,
        payment_status: 'completed', // You might want to change this based on actual payment processing
        transaction_id: transactionId,
        donor_name: personalInfo.name,
        donor_email: personalInfo.email,
        donor_phone: personalInfo.phone,
        donor_address: personalInfo.address || null,
        pan_number: personalInfo.panNumber || null,
        donor_message: personalInfo.message || null,
        receive_updates: receiveUpdates,
        // No need to set created_at and updated_at as they have default values in the schema
      };

      // Insert donation into Supabase
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

  // Update the getDonationById function to match the database schema
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

  // Update the updateDonationStatus function to match the database schema
  const updateDonationStatus = async (id: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('donation')
        .update({ 
          payment_status: status,
          // No need to update updated_at as it should have a trigger in the database
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

  // Update the getDonationsByEmail function to match the database schema
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
        {/* Hero Section */}
        <section className="bg-primary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold mb-6 mt-16"
              >
                Make a Donation to Samarthanam Trust
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-muted-foreground text-lg mb-8"
              >
                Your contribution helps us empower persons with disabilities through education, 
                skill development, and inclusive programs.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-border mb-8 max-w-md mx-auto dark:bg-red-900 donate-tax-section"
              >
                <Info className="text-primary h-8 w-8 dark:text-white donate-tax-section-text" />
                <p className="text-sm">
                  All donations to Samarthanam Trust are eligible for tax exemption under Section 80G in India.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Donation Form Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Donation Form */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Your Donation Details</CardTitle>
                  <CardDescription>
                    Please fill in the details to complete your donation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Donation Type */}
                    <div className="space-y-4">
                      <Label>Donation Type</Label>
                      <Tabs 
                        defaultValue="oneTime" 
                        value={donationType}
                        onValueChange={setDonationType}
                        className="w-full"
                      >
                        <TabsList className="grid grid-cols-2">
                          <TabsTrigger value="oneTime">One-time Donation</TabsTrigger>
                          <TabsTrigger value="monthly">Monthly Donation</TabsTrigger>
                        </TabsList>
                        <TabsContent value="oneTime" className="pt-4">
                          <p className="text-sm text-muted-foreground">
                            Make a one-time donation to support our programs.
                          </p>
                        </TabsContent>
                        <TabsContent value="monthly" className="pt-4">
                          <p className="text-sm text-muted-foreground">
                            Your monthly donation helps us plan and sustain our programs.
                          </p>
                        </TabsContent>
                      </Tabs>
                    </div>

                    {/* Donation Amount */}
                    <div className="space-y-4">
                      <Label>Donation Amount (₹)</Label>
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
                          Custom
                        </Button>
                      </div>
                      
                      {customAmount && (
                        <div className="pt-2">
                          <Label htmlFor="customAmount">Enter Amount</Label>
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
                              placeholder="Enter amount"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Donation Purpose */}
                    <div className="space-y-4">
                      <Label>Choose Donation Purpose</Label>
                      <RadioGroup 
                        value={donationPurpose} 
                        onValueChange={setDonationPurpose}
                        className="grid grid-cols-2 md:grid-cols-3 gap-4"
                      >
                        {donationOptions.map(option => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <Label htmlFor={option.value}>{option.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-4">
                      <Label>Payment Method</Label>
                      <Tabs 
                        defaultValue="card" 
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                        className="w-full"
                      >
                        <TabsList className="grid grid-cols-3">
                          <TabsTrigger value="card">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Card
                          </TabsTrigger>
                          <TabsTrigger value="upi">
                            <span className="mr-2">UPI</span>
                          </TabsTrigger>
                          <TabsTrigger value="netbanking">
                            <span className="mr-2">Netbanking</span>
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="card" className="pt-4">
                          {/* Card details would go here in a real implementation */}
                          <p className="text-sm text-muted-foreground">
                            Secure credit/debit card payment processing.
                          </p>
                        </TabsContent>
                        <TabsContent value="upi" className="pt-4">
                          <p className="text-sm text-muted-foreground">
                            Pay using any UPI app like Google Pay, PhonePe, etc.
                          </p>
                        </TabsContent>
                        <TabsContent value="netbanking" className="pt-4">
                          <p className="text-sm text-muted-foreground">
                            Pay directly from your bank account.
                          </p>
                        </TabsContent>
                      </Tabs>
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Personal Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
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
                              placeholder="Enter your full name"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
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
                              placeholder="Enter your email"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
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
                              placeholder="Enter your phone number"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="panNumber">PAN Number (for tax benefits)</Label>
                          <Input
                            id="panNumber"
                            name="panNumber"
                            value={personalInfo.panNumber}
                            onChange={handlePersonalInfoChange}
                            placeholder="Enter PAN number for 80G certificate"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
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
                            placeholder="Enter your address"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message">Message (Optional)</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={personalInfo.message}
                          onChange={handlePersonalInfoChange}
                          placeholder="Share why you're making this donation"
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Agreements and Consent */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="terms" 
                          checked={agreeToTerms}
                          onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                          required
                        />
                        <Label htmlFor="terms" className="text-sm">
                          I agree to the <a href="/terms" className="text-primary hover:underline">terms and conditions</a> and <a href="/privacy" className="text-primary hover:underline">privacy policy</a>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="updates" 
                          checked={receiveUpdates}
                          onCheckedChange={(checked) => setReceiveUpdates(checked as boolean)}
                        />
                        <Label htmlFor="updates" className="text-sm">
                          Keep me updated about how my donation is making an impact
                        </Label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={!isFormValid() || isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : `Donate ₹${typeof amount === 'string' ? amount || '0' : amount.toLocaleString()}`}
                      {!isSubmitting && <Heart className="ml-2 h-4 w-4" />}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Sidebar with Info */}
              <div className="space-y-6">
                {/* Why Donate Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Why Donate to Samarthanam</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <p className="text-sm">Support education for visually impaired students</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <p className="text-sm">Provide skill development training to persons with disabilities</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <p className="text-sm">Enable sports opportunities for para-athletes</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <p className="text-sm">Create livelihood opportunities through our programs</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <p className="text-sm">Tax benefits under Section 80G</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Impact Stats Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Impact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-2 bg-primary/10 rounded-lg">
                      <p className="text-sm mb-1">₹1,000 can provide</p>
                      <p className="font-semibold">One month of educational support for a child</p>
                    </div>
                    <div className="text-center py-2 bg-primary/10 rounded-lg">
                      <p className="text-sm mb-1">₹5,000 can provide</p>
                      <p className="font-semibold">Training materials for skill development</p>
                    </div>
                    <div className="text-center py-2 bg-primary/10 rounded-lg">
                      <p className="text-sm mb-1">₹10,000 can provide</p>
                      <p className="font-semibold">Assistive technology for multiple students</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Need Help Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      For any assistance with your donation, please contact us:
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

        {/* Our Supporters Section */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Supporters</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join these organizations in supporting our mission to create an inclusive world
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              <img src="/public/oracle-thumb.png" alt="Supporter Logo" className="h-24 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="/public/nike.png" alt="Supporter Logo" className="h-16 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="/public/morgan_stanley.png" alt="Supporter Logo" className="h-16 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="/public/microsoft-logo.png" alt="Supporter Logo" className="h-20 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="/public/anz.png" alt="Supporter Logo" className="h-16 opacity-70 hover:opacity-100 transition-opacity" />
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