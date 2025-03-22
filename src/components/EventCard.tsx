import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  category: string;
  volunteersNeeded: number;
  imageSrc?: string;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  description,
  start_date,
  end_date,
  location,
  category,
  volunteersNeeded,
  imageSrc = "https://source.unsplash.com/random/800x600/?volunteer"
}) => {
  const { user } = useAuth();  // Get user from auth context
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);

  useEffect(() => {
    const fetchUserInterests = async () => {
      if (!user) return; // Skip if user isn't logged in
  
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
            setIsRecommended(true);
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    const checkRegistration = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("event_signup")
        .select("*")
        .eq("volunteer_id", user.id)
        .eq("event_id", id)
        .single();

      if (data) setIsRegistered(true);
    };

    fetchUserInterests();
    checkRegistration();
  }, [id, user, category]);

  const handleVolunteerSignup = async () => {
    if (!user) {
      navigate('/join-us');  // Redirect if user isn't logged in
      return;
    }

    try {
      setLoading(true);
      const { error: insertError } = await supabase
        .from("event_signup")
        .insert([{ volunteer_id: user.id, event_id: id, status: "successful" }]);

      if (insertError) throw insertError;

      alert("Successfully signed up as a volunteer!");
      setIsRegistered(true);
    } catch (err) {
      console.error("Error signing up:", err);
      alert("Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <Card className="h-full overflow-hidden flex flex-col relative">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={imageSrc}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-500 ease-in-out hover:scale-105"
          />
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="font-medium">
              {category}
            </Badge>
          </div>
          {isRecommended && (
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
            <span className="line-clamp-1">{location}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{volunteersNeeded} volunteer{volunteersNeeded !== 1 ? 's' : ''} needed</span>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <Button 
            className="w-full" 
            disabled={isRegistered || loading} 
            onClick={handleVolunteerSignup}
          >
            {isRegistered ? "Already Signed Up" : loading ? "Signing Up..." : "Volunteer for Event"}
          </Button>
          <Link to="/participant" className="w-full">
            <Button className="w-full" variant="secondary">
              Register as Participant
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default EventCard;
