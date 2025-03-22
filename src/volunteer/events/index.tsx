import React from 'react';
import { useAuth } from '@/lib/authContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, MapPin, ExternalLink } from 'lucide-react';
import { VolunteerLayout } from '@/components/layouts/VolunteerLayout';

// Mock data (you can replace this with real data from your API)
const events = [
  {
    id: '1',
    title: 'Digital Literacy Workshop',
    date: 'Aug 15, 2023',
    time: '10:00 AM - 1:00 PM',
    location: 'Samarthanam Trust HQ, Bengaluru',
    status: 'registered'
  },
  {
    id: '2',
    title: 'Community Sports Day',
    date: 'Aug 20, 2023',
    time: '9:00 AM - 5:00 PM',
    location: 'Sri Kanteerava Stadium, Bengaluru',
    status: 'open'
  },
  {
    id: '3',
    title: 'Educational Support Program',
    date: 'Aug 28, 2023',
    time: '3:00 PM - 6:00 PM',
    location: 'Government School, Jayanagar, Bengaluru',
    status: 'open'
  },
];

export const VolunteerEvents = () => {
  const { user } = useAuth();

  return (
    <VolunteerLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Registered Events</h1>
          <p className="text-muted-foreground">
            View and manage your registered events and upcoming opportunities.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-start gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                    <span>{event.location}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between pb-3">
                <Badge variant={event.status === 'registered' ? 'default' : 'outline'}>
                  {event.status === 'registered' ? 'Registered' : 'Open for Registration'}
                </Badge>
                <Button variant="ghost" size="sm">
                  Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-center">
          <Button variant="outline">
            Browse More Events
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </VolunteerLayout>
  );
}; 