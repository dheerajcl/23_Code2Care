
'use client';

import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface EventCardProps {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  volunteersNeeded: number;
  imageSrc?: string;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  description,
  date,
  time,
  location,
  category,
  volunteersNeeded,
  imageSrc = "https://source.unsplash.com/random/800x600/?volunteer"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <Card className="h-full overflow-hidden flex flex-col">
        <div className="aspect-video relative overflow-hidden">
          {/* Next.js Image component with remote images requires width and height */}
          <div className="relative w-full h-full">
            <img
              src={imageSrc}
              alt={title}
              className="object-cover w-full h-full transition-transform duration-500 ease-in-out hover:scale-105"
            />
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="font-medium">
              {category}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3 flex-grow">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{date}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{time}</span>
          </div>
          
          <div className="flex items-start text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{location}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>
              {volunteersNeeded} volunteer{volunteersNeeded !== 1 ? 's' : ''} needed
            </span>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button className="w-full" aria-label={`Register for ${title}`}>
            Register as Volunteer
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default EventCard;
