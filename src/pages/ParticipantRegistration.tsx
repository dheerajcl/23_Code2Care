import React, { useState } from 'react';
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

const ParticipantRegistration = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [submitting, setSubmitting] = useState(false);
  
  // Dummy event data with an image
  const event = {
    id: id || '1',
    title: 'Beach Cleanup Drive',
    description: "Join us for our monthly beach cleanup drive! We'll be collecting trash and plastic waste from the shoreline to protect marine life and keep our beaches beautiful.\n\nThis is a family-friendly event open to volunteers of all ages. We'll provide gloves, trash bags, and refreshments. Come make a difference with us!",
    date: '2025-04-15',
    start_time: '09:00:00',
    end_time: '12:00:00',
    location: 'Sunshine Beach, Main Entrance',
    category: 'Environment',
    capacity: 50,
    requirements: "Please wear comfortable clothes and closed-toe shoes. Don't forget to bring sunscreen, a hat, and a water bottle. We recommend bringing a reusable water bottle to reduce plastic waste.",
    status: 'scheduled',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1353&q=80' // Example image URL
  };
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    specialRequirements: '',
    receiveNotifications: true
  });
  
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
  
  // Handle form submission - simplified to just show success message
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Registration Successful!",
        description: "You've been registered for this event. Check your email for confirmation.",
        duration: 5000,
      });
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        specialRequirements: '',
        receiveNotifications: true
      });
      
      setSubmitting(false);

      navigate('/events/participant/success');
    }, 1000);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (e) {
      return dateString;
    }
  };
  
  const formatTime = (timeString: string) => {
    try {
      return format(new Date(`2000-01-01T${timeString}`), 'h:mm a');
    } catch (e) {
      return timeString;
    }
  };
  
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
                      {formatDate(event.date)}
                    </span>
                    <span className="inline-flex items-center mr-4">
                      <Clock className="mr-1 h-4 w-4" /> 
                      {formatTime(event.start_time)} - {formatTime(event.end_time)}
                    </span>
                    <span className="inline-flex items-center mr-4">
                      <MapPin className="mr-1 h-4 w-4" /> 
                      {event.location}
                    </span>
                    <span className="inline-flex items-center">
                      <User className="mr-1 h-4 w-4" /> 
                      {event.capacity} spots
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
              <div className="mb-6">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              
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
                Fill out the form below to register for this event. We'll send you a confirmation email.
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
              <Button 
                type="submit" 
                className="w-full md:w-auto" 
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Registering...' : 'Register for Event'}
              </Button>
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