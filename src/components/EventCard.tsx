import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import { Badge } from './ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/authContext';
import EventDetailsModal from './EventDetailsModal';
import { useVolunteerAuth } from '@/lib/authContext';

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  category: string;
  volunteersNeeded: number;
  image_url?: string;
  isRegistered?: boolean;
  isRecommended?: boolean;
  loading?: boolean;
  handleVolunteerSignup?: () => void;
  customButtons?: React.ReactNode;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  description,
  start_date,
  end_date,
  location: eventLocation,
  category,
  volunteersNeeded,
  image_url = "https://source.unsplash.com/random/800x600/?volunteer",
  isRegistered = false,
  isRecommended = false,
  loading = false,
  handleVolunteerSignup,
  customButtons
}) => {
  const { user, registerForEvent } = useVolunteerAuth();
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const [localIsRegistered, setLocalIsRegistered] = useState(isRegistered);
  const [localLoading, setLocalLoading] = useState(loading);
  const [localIsRecommended, setLocalIsRecommended] = useState(isRecommended);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setLocalIsRegistered(isRegistered);
  }, [isRegistered]);

  useEffect(() => {
    setLocalLoading(loading);
  }, [loading]);

  useEffect(() => {
    setLocalIsRecommended(isRecommended);
  }, [isRecommended]);

  // Only check interests on the main events page
  useEffect(() => {
    const fetchUserInterests = async () => {
      if (!user || localIsRecommended || currentLocation.pathname !== '/events') return;
  
      try {
        const { data, error } = await supabase
          .from("volunteer")
          .select("interests")
          .eq("id", user.id)
          .single();
  
        if (error) {
          console.error("Error fetching user interests:", error);
          return;
        }
  
        if (data?.interests) {
          const userInterests = data.interests.map((interest: string) => interest.toLowerCase());
  
          if (userInterests.includes(category.toLowerCase())) {
            setLocalIsRecommended(true);
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    fetchUserInterests();
  }, [user, category, localIsRecommended, currentLocation.pathname]);

  // Handle volunteer signup
  const onVolunteerSignup = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (localIsRegistered) {
      return;
    }
    
    if (!user) {
      // User is not logged in, redirect to login
      navigate('/login');
      return;
    }
    
    try {
      setLocalLoading(true);
      
      let success = false;
      
      // Use registerForEvent from context if available, otherwise use prop
      if (registerForEvent) {
        success = await registerForEvent(id);
      } else if (handleVolunteerSignup) {
        success = await handleVolunteerSignup(id);
      } else {
        // Fallback to default behavior
        const { error } = await supabase
          .from('event_signup')
          .insert([
            { event_id: id, volunteer_id: user.id }
          ]);
          
        if (error) throw error;
        success = true;
      }
      
      if (success) {
        setLocalIsRegistered(true);
      }
    } catch (error) {
      console.error('Error signing up for event:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
      >
        <Card className="h-full overflow-hidden flex flex-col relative">
          <div className="aspect-video relative overflow-hidden">
            <img
              src={image_url}
              alt={title}
              className="object-cover w-full h-full transition-transform duration-500 ease-in-out hover:scale-105"
            />
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="font-medium">
                {category}
              </Badge>
            </div>
            {currentLocation.pathname === '/events' && localIsRecommended && (
              <div className="absolute top-3 left-3">
                <Badge variant="outline" className="font-medium bg-green-200 text-green-700">
                  Recommended
                </Badge>
              </div>
            )}
          </div>

          <CardHeader className="pb-2">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="line-clamp-2">{description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 flex-grow">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{new Date(start_date).toLocaleDateString()} - {new Date(end_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{new Date(start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-start text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1">{eventLocation}</span>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            {customButtons ? (
              customButtons
            ) : (
              <>
                <Button 
                  className="w-full" 
                  disabled={localIsRegistered || localLoading} 
                  onClick={onVolunteerSignup}
                >
                  {localIsRegistered ? "Already Signed Up" : localLoading ? "Signing Up..." : "Volunteer for Event"}
                </Button>
                <Link to={`/events/${id}/participant`} className="w-full">
                  <Button className="w-full" variant="secondary">
                    Register as Participant
                  </Button>
                </Link>
              </>
            )}
          </CardFooter>
        </Card>
      </motion.div>

      <EventDetailsModal
        event={{
          id,
          title,
          description,
          start_date,
          end_date,
          location: eventLocation,
          category,
          volunteersNeeded,
          image_url
        }}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default EventCard;