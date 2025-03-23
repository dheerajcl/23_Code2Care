import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EventDetailsModalProps {
  event: {
    id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    category: string;
    volunteersNeeded: number;
    image_url?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[800px] max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold">{event.title}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="aspect-video relative overflow-hidden rounded-lg mb-4">
            <img
              src={event.image_url || "https://source.unsplash.com/random/800x600/?volunteer"}
              alt={event.title}
              className="object-cover w-full h-full"
            />
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="font-medium">
                {event.category}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            {/* About This Event Section */}
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-2">About This Event</h3>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>

            {/* Event Details Section */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>
                  {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>
                  {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsModal; 