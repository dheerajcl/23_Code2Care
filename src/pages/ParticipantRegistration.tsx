import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';
import { format } from 'date-fns';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';

const ParticipantRegistration = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth(); // Changed from isLoading to loading
  
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    specialRequirements: '',
    receiveNotifications: true
  });
  
  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('event')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setEvent(data);
        } else {
          // Handle case where event is not found
          toast({
            title: "Event not found",
            description: "The requested event could not be found.",
            variant: "destructive",
          });
          navigate('/events');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast({
          title: "Error loading event",
          description: "There was a problem loading the event details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [id, navigate, toast]);
  
  // Check if user is logged in and fetch their details
  useEffect(() => {
    const fetchUserData = async () => {
      if (!authLoading && user) { // Changed from isLoading to authLoading
        try {
          // Check if the user already exists in the volunteers table
          const { data, error } = await supabase
            .from('volunteer')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for "no rows returned"
            throw error;
          }
          
          if (data) {
            // Populate form with volunteer data
            setFormData({
              fullName: data.first_name+' '+data.last_name || '',
              email: data.email || '',
              phone: data.phone || '',
              address: data.address || '',
              specialRequirements: '',
              receiveNotifications: true
            });
          } else {
            // User exists but not in volunteers table, just set email
            setFormData(prev => ({
              ...prev,
              email: user.email || ''
            }));
          }
        } catch (error) {
          console.error('Error fetching volunteer data:', error);
        }
      }
    };
    
    fetchUserData();
  }, [user, authLoading]); // Changed from isLoading to authLoading
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      receiveNotifications: checked
    });
  };
  
  // Check if user is already registered for this event
  const checkExistingRegistration = async () => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('participant')
        .select('*')
        .eq('participant_email', user.email)
        .eq('event_id', id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking registration:', error);
      return false;
    }
  };
  
  // Send confirmation email
  const sendConfirmationEmail = async (email: string) => {
    try {
      // Using Supabase Edge Functions to send email
      const { error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          to: email,
          eventName: event?.title,
          eventDate: event?.date,
          eventTime: `${formatTime(event?.start_time)} - ${formatTime(event?.end_time)}`,
          eventLocation: event?.location,
          participantName: formData.fullName
        }
      });
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Continue with registration even if email fails
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Check if already registered
      const isRegistered = await checkExistingRegistration();
      
      if (isRegistered) {
        toast({
          title: "Already Registered",
          description: "You're already registered for this event.",
          duration: 5000,
        });
        setSubmitting(false);
        return;
      }
      
      // Create participant record
      const participantData = {
        participant_id: user?.id || null,
        participant_name: formData.fullName,
        participant_email: formData.email,
        participant_phone: formData.phone,
        participant_address: formData.address,
        participant_special: formData.specialRequirements,
        event_id: id,
        notification: formData.receiveNotifications
      };
      
      const { error } = await supabase
        .from('participant')
        .insert([participantData]);
        
      if (error) throw error;
      
      // Send confirmation email
      await sendConfirmationEmail(formData.email);
      
      toast({
        title: "Registration Successful!",
        description: "You've been registered for this event. Check your email for confirmation.",
        duration: 5000,
      });
      
      navigate('/events/participant/success');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "There was a problem with your registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (e) {
      return dateString;
    }
  };
  
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    try {
      return format(new Date(`2000-01-01T${timeString}`), 'h:mm a');
    } catch (e) {
      return timeString;
    }
  };
  
  if (loading || authLoading) { // Use the LoadingSpinner component
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner />
        <p className="mt-4">Loading event details...</p>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>Event not found</p>
        <Button 
          onClick={() => navigate('/events')}
          className="mt-4"
        >
          Back to Events
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col mt-12">
      <LandingHeader />
      
      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <Button 
            variant="outline" 
            className="mb-6"
            onClick={() => navigate('/events')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
          </Button>
          
          {/* Event Details Section */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl md:text-3xl mb-2">{event.title}</CardTitle>
                  <CardDescription className="text-base">
                    <span className="inline-flex items-center mr-4">
                      <Calendar className="mr-1 h-4 w-4" /> 
                      {formatDate(event.start_date)} - {formatDate(event.end_date)}
                    </span>
                    <br></br>
                    <span className="inline-flex items-center mr-4">
                      <Clock className="mr-1 h-4 w-4" /> 
                      {formatTime(event.start_date)} - {formatTime(event.end_date)}
                    </span>
                    <br></br>
                    <span className="inline-flex items-center mr-4">
                      <MapPin className="mr-1 h-4 w-4" /> 
                      {event.location}
                    </span>
                  </CardDescription>
                </div>
                <div className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm">
                  {event.category}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Event Image */}
              {event.image_url && (
                <div className="mb-6">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">About This Event</h3>
                  <p className="whitespace-pre-line">{event.description}</p>
                </div>
                
                {event.requirements && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Requirements</h3>
                    <p className="whitespace-pre-line">{event.requirements}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Register as Participant</CardTitle>
              <CardDescription>
                {user ? 
                  "Your profile information has been pre-filled. Please verify and complete the form below." :
                  "Fill out the form below to register for this event. We'll send you a confirmation email."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium">
                      Address
                    </label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="specialRequirements" className="text-sm font-medium">
                    Special Requirements or Accommodations
                  </label>
                  <Textarea
                    id="specialRequirements"
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                    placeholder="Let us know if you have any special requirements or need accommodations"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="receiveNotifications"
                    checked={formData.receiveNotifications}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <label 
                    htmlFor="receiveNotifications" 
                    className="text-sm leading-none"
                  >
                    Receive notifications about future similar events
                  </label>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              {submitting ? (
                <Button disabled className="w-full md:w-auto">
                  <LoadingSpinner/> Registering...
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="w-full md:w-auto" 
                  onClick={handleSubmit}
                >
                  Register for Event
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
        <AccessibilityMenu/>
      </main>
      
      <Footer />
    </div>
  );
};

export default ParticipantRegistration;