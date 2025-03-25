import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter 
} from './ui/card';
import { Badge } from './ui/badge';
import { supabase } from '@/lib/supabase';
import { useVolunteerAuth } from '@/lib/authContext';
import EventDetailsModal from './EventDetailsModal';
import { useLanguage } from './LanguageContext';
import { toast } from './ui/use-toast';

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  category: string;
  volunteersNeeded: number; // Max volunteers
  remainingSpots?: number | null; // New prop for remaining spots
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
  remainingSpots,
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
  const { t } = useLanguage();
  const [localIsRegistered, setLocalIsRegistered] = useState(isRegistered);
  const [localLoading, setLocalLoading] = useState(loading);
  const [localIsRecommended, setLocalIsRecommended] = useState(isRecommended);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setLocalIsRegistered(isRegistered);
  }, [isRegistered]);

  useEffect(() => {
    setLocalLoading(loading);
  }, [loading]);

  useEffect(() => {
    setLocalIsRecommended(isRecommended);
  }, [isRecommended]);

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

  const onVolunteerSignup = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (localIsRegistered) {
      return;
    }
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      setLocalLoading(true);
      
      let result;
      
      if (registerForEvent) {
        result = await registerForEvent(id);
      } else if (handleVolunteerSignup) {
        const success = await handleVolunteerSignup(id);
        result = { success, message: success ? `Successfully registered for "${title}"!` : `Failed to register for "${title}".` };
      } else {
        const { error } = await supabase
          .from('event_signup')
          .insert([{ event_id: id, volunteer_id: user.id }]);
          
        if (error) throw error;
        result = { success: true, message: `Successfully registered for "${title}"!` };
      }
      
      if (result.success) {
        setLocalIsRegistered(true);
        toast({
          title: t('success'),
          description: result.message,
          variant: "default",
          className: "bg-green-100 border-green-400 text-green-700",
          duration: 3000,
        });
      } else {
        toast({
          title: t('error'),
          description: result.message,
          variant: "destructive",
          className: "bg-red-100 border-red-400 text-red-700",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error signing up for event:', error);
      toast({
        title: t('error'),
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
        className: "bg-red-100 border-red-400 text-red-700",
        duration: 5000,
      });
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
                  {t('recommended')}
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
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>
                {remainingSpots !== null 
                  ? `${remainingSpots} spot${remainingSpots === 1 ? '' : 's'} remaining to volunteer` 
                  : 'Unlimited volunteers'}
              </span>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            {customButtons ? (
              customButtons
            ) : (
              <>
                <Button 
                  className="w-full" 
                  disabled={localIsRegistered || localLoading || (remainingSpots !== null && remainingSpots <= 0)} 
                  onClick={onVolunteerSignup}
                >
                  {localIsRegistered ? t('alreadySignedUp') : localLoading ? t('signingUp') : t('volunteerForEvent')}
                </Button>
                <Link to={`/events/${id}/participant`} className="w-full">
                  <Button className="w-full" variant="secondary">
                    {t('registerAsParticipant')}
                  </Button>
                </Link>
              </>
            )}
          </CardFooter>
        </Card>
      </motion.div>

      <EventDetailsModal
        eventData={{
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