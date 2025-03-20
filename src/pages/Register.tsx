import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, HelpCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    skills: [] as string[],
    interests: [] as string[],
    availability: '',
    experience: '',
    howHeard: '',
    agreeTerms: false
  });
  
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSkillToggle = (skill: string) => {
    setFormData(prev => {
      const currentSkills = [...prev.skills];
      if (currentSkills.includes(skill)) {
        return { ...prev, skills: currentSkills.filter(s => s !== skill) };
      } else {
        return { ...prev, skills: [...currentSkills, skill] };
      }
    });
  };
  
  const handleInterestToggle = (interest: string) => {
    setFormData(prev => {
      const currentInterests = [...prev.interests];
      if (currentInterests.includes(interest)) {
        return { ...prev, interests: currentInterests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...currentInterests, interest] };
      }
    });
  };
  
  const isStepValid = () => {
    if (step === 1) {
      return formData.firstName && formData.lastName && formData.email && formData.phone;
    } else if (step === 2) {
      return formData.skills.length > 0 && formData.interests.length > 0 && formData.availability;
    } else if (step === 3) {
      return formData.agreeTerms;
    }
    return false;
  };
  
  const nextStep = () => {
    if (isStepValid()) {
      setStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      toast.error("Please complete all required fields before continuing.");
    }
  };
  
  const prevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStepValid()) {
      // Registration form submission logic would go here
      console.log("Form submitted:", formData);
      toast.success("Your volunteer registration has been submitted successfully!");
      
      // Reset form and go back to step 1 after submission
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        skills: [],
        interests: [],
        availability: '',
        experience: '',
        howHeard: '',
        agreeTerms: false
      });
      setStep(1);
    } else {
      toast.error("Please agree to the terms and conditions before submitting.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <Hero 
          title="Volunteer Registration" 
          subtitle="Join our volunteer community and help make a difference in the lives of visually impaired, disabled, and underprivileged individuals."
          showCta={false}
        />
        
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            {/* Progress Steps */}
            <div className="mb-10">
              <div className="flex justify-between mb-2">
                {[1, 2, 3, 4].map(stepNumber => (
                  <motion.div
                    key={stepNumber}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
                      step === stepNumber 
                        ? 'bg-primary text-primary-foreground' 
                        : step > stepNumber 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-muted text-muted-foreground'
                    }`}
                    initial={step === stepNumber ? { scale: 0.8 } : { scale: 1 }}
                    animate={step === stepNumber ? { scale: 1 } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {step > stepNumber ? <Check className="h-6 w-6" /> : stepNumber}
                  </motion.div>
                ))}
              </div>
              <div className="relative flex justify-between">
                <div className="absolute top-0 left-6 right-6 flex-grow">
                  <div className="h-1 bg-muted rounded-full"></div>
                  <div 
                    className="h-1 bg-primary rounded-full absolute top-0 left-0 transition-all duration-500"
                    style={{ width: `${(step - 1) * 33.33}%` }}
                  ></div>
                </div>
                <div className="w-12 text-center text-xs mt-2">Personal<br />Info</div>
                <div className="w-12 text-center text-xs mt-2">Skills &<br />Interests</div>
                <div className="w-12 text-center text-xs mt-2">Terms &<br />Review</div>
                <div className="w-12 text-center text-xs mt-2">Complete</div>
              </div>
            </div>
            
            <Card className="border border-border shadow-sm">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Personal Information */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Personal Information</h2>
                        <p className="text-muted-foreground">
                          Tell us about yourself so we can match you with the right volunteering opportunities.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="required">First Name</Label>
                          <Input 
                            id="firstName" 
                            placeholder="John" 
                            value={formData.firstName}
                            onChange={(e) => updateFormData('firstName', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="required">Last Name</Label>
                          <Input 
                            id="lastName" 
                            placeholder="Doe" 
                            value={formData.lastName}
                            onChange={(e) => updateFormData('lastName', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="required">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="john.doe@example.com" 
                            value={formData.email}
                            onChange={(e) => updateFormData('email', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="required">Phone Number</Label>
                          <Input 
                            id="phone" 
                            type="tel" 
                            placeholder="+91 98765 43210" 
                            value={formData.phone}
                            onChange={(e) => updateFormData('phone', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea 
                          id="address" 
                          placeholder="123 Main St, Apartment 4B" 
                          value={formData.address}
                          onChange={(e) => updateFormData('address', e.target.value)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input 
                            id="city" 
                            placeholder="Bengaluru" 
                            value={formData.city}
                            onChange={(e) => updateFormData('city', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Select 
                            value={formData.state} 
                            onValueChange={(value) => updateFormData('state', value)}
                          >
                            <SelectTrigger id="state">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="karnataka">Karnataka</SelectItem>
                              <SelectItem value="tamil_nadu">Tamil Nadu</SelectItem>
                              <SelectItem value="maharashtra">Maharashtra</SelectItem>
                              <SelectItem value="delhi">Delhi</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Step 2: Skills and Interests */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Skills & Interests</h2>
                        <p className="text-muted-foreground">
                          Tell us about your skills and areas of interest so we can match you with the right opportunities.
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <Label className="required">Skills</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" type="button">
                                  <HelpCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                Select skills that you have and would like to use while volunteering.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {['Teaching', 'Technology', 'Event Management', 'Writing', 'Design', 'Administration', 'Counseling', 'Language Translation'].map((skill) => (
                            <div key={skill} className="flex items-center space-x-2">
                              <Checkbox
                                id={`skill-${skill}`}
                                checked={formData.skills.includes(skill)}
                                onCheckedChange={() => handleSkillToggle(skill)}
                              />
                              <Label htmlFor={`skill-${skill}`} className="cursor-pointer">{skill}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <Label className="required">Areas of Interest</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" type="button">
                                  <HelpCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                Select areas you're interested in volunteering with.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {['Education', 'Healthcare', 'Technology', 'Arts & Culture', 'Sports', 'Career Development', 'Community Outreach', 'Fundraising'].map((interest) => (
                            <div key={interest} className="flex items-center space-x-2">
                              <Checkbox
                                id={`interest-${interest}`}
                                checked={formData.interests.includes(interest)}
                                onCheckedChange={() => handleInterestToggle(interest)}
                              />
                              <Label htmlFor={`interest-${interest}`} className="cursor-pointer">{interest}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <Label htmlFor="availability" className="required">Availability</Label>
                        <RadioGroup 
                          id="availability" 
                          value={formData.availability}
                          onValueChange={(value) => updateFormData('availability', value)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="weekdays" id="weekdays" />
                            <Label htmlFor="weekdays">Weekdays</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="weekends" id="weekends" />
                            <Label htmlFor="weekends">Weekends</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="both" id="both" />
                            <Label htmlFor="both">Both</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="experience">Previous Volunteer Experience</Label>
                        <Textarea 
                          id="experience" 
                          placeholder="Share any previous volunteer experience you have..." 
                          value={formData.experience}
                          onChange={(e) => updateFormData('experience', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="howHeard">How did you hear about us?</Label>
                        <Select 
                          value={formData.howHeard} 
                          onValueChange={(value) => updateFormData('howHeard', value)}
                        >
                          <SelectTrigger id="howHeard">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="social_media">Social Media</SelectItem>
                            <SelectItem value="friend">Friend or Family</SelectItem>
                            <SelectItem value="search">Search Engine</SelectItem>
                            <SelectItem value="event">Community Event</SelectItem>
                            <SelectItem value="news">News or Media</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Step 3: Terms and Review */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Review & Submit</h2>
                        <p className="text-muted-foreground">
                          Please review your information and agree to our terms before submitting.
                        </p>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-lg space-y-4">
                        <div>
                          <h3 className="font-semibold">Personal Information</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            <div>
                              <span className="text-muted-foreground text-sm">Name:</span>
                              <p>{formData.firstName} {formData.lastName}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-sm">Email:</span>
                              <p>{formData.email}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-sm">Phone:</span>
                              <p>{formData.phone}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-sm">Location:</span>
                              <p>{[formData.city, formData.state].filter(Boolean).join(', ') || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold">Skills & Interests</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            <div>
                              <span className="text-muted-foreground text-sm">Skills:</span>
                              <p>{formData.skills.join(', ') || 'None selected'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-sm">Interests:</span>
                              <p>{formData.interests.join(', ') || 'None selected'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-sm">Availability:</span>
                              <p>{formData.availability || 'Not specified'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                          <h3 className="font-semibold mb-2">Terms & Conditions</h3>
                          <p className="text-muted-foreground text-sm">
                            As a volunteer with Samarthanam Trust for the Disabled, I agree to:
                          </p>
                          <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground text-sm">
                            <li>Abide by all policies, procedures, and guidelines of Samarthanam Trust.</li>
                            <li>Respect the privacy and dignity of all individuals I work with.</li>
                            <li>Fulfill my volunteer commitments or provide adequate notice if unable to do so.</li>
                            <li>Represent Samarthanam Trust in a positive and professional manner.</li>
                            <li>Complete any required training or orientation programs.</li>
                          </ul>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <Checkbox 
                            id="agreeTerms" 
                            checked={formData.agreeTerms}
                            onCheckedChange={(checked) => updateFormData('agreeTerms', checked)}
                            required
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label 
                              htmlFor="agreeTerms" 
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 required"
                            >
                              I agree to the terms and conditions
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              By checking this box, you confirm that you have read and agree to our terms.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Step 4: Completion */}
                  {step === 4 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-center py-8 space-y-6"
                    >
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Check className="h-10 w-10 text-primary" />
                      </div>
                      
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Registration Complete!</h2>
                        <p className="text-muted-foreground">
                          Thank you for registering as a volunteer with Samarthanam Trust for the Disabled.
                        </p>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-lg text-left">
                        <h3 className="font-semibold mb-2">What happens next?</h3>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          <li>You will receive a confirmation email within 24 hours.</li>
                          <li>Our volunteer coordinator will review your application.</li>
                          <li>You'll be invited to an orientation session to learn more about our programs.</li>
                          <li>We'll match you with volunteer opportunities based on your skills and interests.</li>
                        </ul>
                      </div>
                      
                      <div className="pt-4">
                        <Button asChild>
                          <a href="/events">
                            Browse Upcoming Events
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Form Navigation */}
                  {step < 4 && (
                    <div className="flex justify-between items-center mt-8">
                      {step > 1 ? (
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={prevStep}
                        >
                          Back
                        </Button>
                      ) : (
                        <div></div>
                      )}
                      
                      {step < 3 ? (
                        <Button 
                          type="button"
                          onClick={nextStep}
                          disabled={!isStepValid()}
                        >
                          Next
                        </Button>
                      ) : (
                        <Button 
                          type="submit"
                          disabled={!isStepValid()}
                        >
                          Submit
                        </Button>
                      )}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer />
      <AccessibilityMenu />
    </div>
  );
};

export default Register;
