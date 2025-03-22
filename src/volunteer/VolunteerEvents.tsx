import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';
import { Search, X, ListTodo, MessageSquare } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Charity from '../assets/charity.jpg'
import Workshop from '../assets/workshop.jpg'
import Community from '../assets/community_cleanup.jpg'
import Donation from '../assets/donation.png'
import Cricket from '../assets/cricket.jpg'
import EventCard from '../components/EventCard';
import AccessibilityMenu from '@/components/AccessibilityMenu';

// Borrowing event data from the admin page
export const eventData = [
  {
    id: 1,
    title: "Community Cleanup",
    description: "A community initiative to clean and beautify our local park areas.",
    type: "Environmental",
    date: "April 10, 2025",
    time: "9:00 AM - 2:00 PM",
    location: "Central Park",
    volunteers: 20,
    skills: "No special skills required, willingness to work outdoors",
    roles: "Team Lead, Cleanup Crew, Registration Coordinator",
    accessibility: "Wheelchair accessible paths, rest areas provided",
    materials: "Gloves, trash bags, recycling bins, water stations",
    contact: "Sarah Johnson (sarah.j@cleanupinitiative.org, +1 555-234-5678)",
    deadline: "April 5, 2025",
    dress: "Comfortable clothing, closed-toe shoes, hats recommended",
    feedback: "QR code will be provided at the event for immediate feedback",
    registrations: 45,
    image: Community,
    start_date: "2025-04-10T09:00:00",
    end_date: "2025-04-10T14:00:00",
  },
  {
    id: 2,
    title: "Charity Fundraiser",
    description: "An evening of entertainment and auctions to raise funds for children's education.",
    type: "Fundraising",
    date: "April 15, 2025",
    time: "6:00 PM - 10:00 PM",
    location: "City Hall",
    volunteers: 35,
    skills: "Customer service, auction management, event coordination",
    roles: "Greeter, Auction Assistant, Bar Service, Entertainment Coordinator",
    accessibility: "Elevator access, accessible restrooms, reserved seating available",
    materials: "Auction items, bidding paddles, payment terminals, decorations",
    contact: "Michael Rodriguez (m.rodriguez@educationcharity.org, +1 555-987-6543)",
    deadline: "April 10, 2025",
    dress: "Semi-formal attire, volunteer badges will be provided",
    feedback: "Email survey to be sent the following day",
    registrations: 78,
    image: Charity,
    start_date: "2025-04-15T18:00:00",
    end_date: "2025-04-15T22:00:00",
  },
  {
    id: 3,
    title: "Workshop Series",
    description: "A series of professional development workshops focusing on career advancement skills.",
    type: "Education",
    date: "April 25, 2025",
    time: "1:00 PM - 5:00 PM",
    location: "Community Center",
    volunteers: 15,
    skills: "Teaching experience, professional background, organization skills",
    roles: "Workshop Facilitator, Registration Desk, Technical Support",
    accessibility: "Ground floor venue, materials available in large print",
    materials: "Projector, laptops, handouts, name tags, refreshments",
    contact: "Priya Patel (priya@careerdevelopment.org, +1 555-123-4567)",
    deadline: "April 20, 2025",
    dress: "Business casual attire",
    feedback: "Paper forms distributed after each workshop",
    registrations: 32,
    image: Workshop,
    start_date: "2025-04-25T13:00:00",
    end_date: "2025-04-25T17:00:00",
  },
  {
    id: 4,
    title: "Blood Donation Drive",
    description: "A critical blood donation initiative in partnership with the regional blood bank.",
    type: "Healthcare",
    date: "March 21, 2025",
    time: "10:00 AM - 4:00 PM",
    location: "Downtown Hospital",
    volunteers: 25,
    skills: "Medical background preferred but not required, good communication",
    roles: "Check-in Coordinator, Refreshment Station, Donor Support, Outreach",
    accessibility: "Fully accessible venue with medical staff support",
    materials: "Medical supplies (provided by hospital), refreshments, donor forms",
    contact: "Dr. James Wilson (jwilson@healthalliance.org, +1 555-444-3333)",
    deadline: "March 15, 2025",
    dress: "Casual clothing with closed-toe shoes, volunteer vests provided",
    feedback: "In-person interviews with select participants",
    participants: 56,
    image: Donation,
    start_date: "2025-03-21T10:00:00",
    end_date: "2025-03-21T16:00:00",
  },
  {
    id: 5,
    title: "Blind Cricket Tournament 2023",
    description: "A cricket tournament for visually impaired players to promote inclusivity.",
    type: "Sports",
    date: "October 15, 2023",
    time: "9:00 AM - 5:00 PM",
    location: "Samarthanam Sports Complex, Bangalore",
    volunteers: 20,
    skills: "Basic knowledge of cricket, good communication skills",
    roles: "Umpire, Scorekeeper, Logistics Coordinator, Registration Desk Volunteer",
    accessibility: "Wheelchair ramps, braille scorecards, sign language interpreters",
    materials: "10 cricket bats, 20 chairs, 1 projector",
    contact: "John Doe (john.doe@samarthanam.org, +91 9876543210)",
    deadline: "October 10, 2023",
    dress: "Comfortable sports attire (volunteer t-shirts provided)",
    feedback: "Online feedback form will be sent after the event",
    participants: 48,
    image: Cricket,
    start_date: "2023-10-15T09:00:00",
    end_date: "2023-10-15T17:00:00",
  }
];

const VolunteerEvents = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [myVolunteeringFilter, setMyVolunteeringFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  // Track events the user has volunteered for
  const [myVolunteering, setMyVolunteering] = useState([]);

  const eventTypes = [...new Set(eventData.map(event => event.type))];

  useEffect(() => {
    // Simulate loading events and volunteer status from API
    setTimeout(() => {
      setEvents(eventData);
      // Simulate user has already volunteered for two events (IDs 1 and 3)
      setMyVolunteering([
        { eventId: 1, status: 'confirmed' },
        { eventId: 3, status: 'confirmed' }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleLogout = async () => {
    await logout();
    // Redirect is handled by the auth context
  };

  const navigateToEventDetails = (id) => {
    navigate(`/volunteer/events/${id}`);
  };

  const handleViewTasks = (id, e) => {
    e.stopPropagation();
    navigate(`/volunteer/events/${id}/tasks`);
  };

  const handleProvideFeedback = (id, e) => {
    e.stopPropagation();
    navigate(`/volunteer/events/${id}/feedback`);
  };

  const handleVolunteerSignup = (id, e) => {
    e && e.stopPropagation();
    
    // Check if already volunteered
    if (myVolunteering.some(v => v.eventId === id)) {
      toast.error("You've already volunteered for this event");
      return;
    }
    
    // Add to volunteering list
    setMyVolunteering([...myVolunteering, { eventId: id, status: 'confirmed' }]);
    toast.success("Successfully signed up as a volunteer!");
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeChange = (value) => {
    setSelectedType(value);
  };

  const handleDateChange = (value) => {
    setSelectedDate(value);
  };

  const handleVolunteeringFilterChange = (value) => {
    setMyVolunteeringFilter(value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedDate('all');
    setMyVolunteeringFilter('all');
  };

  // Check if user has volunteered for an event
  const hasVolunteered = (eventId) => {
    return myVolunteering.some(v => v.eventId === eventId);
  };

  // Check if event is in the past
  const isEventPast = (eventDate) => {
    return new Date(eventDate) < new Date();
  };

  // Filter events based on search term and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || 
      event.type === selectedType;
    
    const matchesDate = selectedDate === 'all' || 
      (selectedDate === 'upcoming' && new Date(event.date) >= new Date()) ||
      (selectedDate === 'past' && new Date(event.date) < new Date()) ||
      (selectedDate === 'thisMonth' && new Date(event.date).getMonth() === new Date().getMonth()) ||
      (selectedDate === 'nextMonth' && new Date(event.date).getMonth() === (new Date().getMonth() + 1) % 12);
    
    const matchesVolunteering = myVolunteeringFilter === 'all' || 
      (myVolunteeringFilter === 'myEvents' && hasVolunteered(event.id));
    
    return matchesSearch && matchesType && matchesDate && matchesVolunteering;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  // Custom buttons for EventCard
  const renderCustomButtons = (event) => {
    const userVolunteered = hasVolunteered(event.id);
    const isPastEvent = isEventPast(event.date);
    
    if (isPastEvent) {
      // For past events
      return userVolunteered ? (
        // For past events where user volunteered
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleProvideFeedback(event.id, e)}
          className="flex items-center bg-blue-600 justify-center gap-1 text-sm text-white w-full hover:bg-blue-700"
        >
          <MessageSquare size={16} />
          <span>Provide Feedback</span>
        </Button>
      ) : (
        // For past events where user didn't volunteer
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleProvideFeedback(event.id, e)}
          className="flex items-center bg-gray-600 justify-center gap-1 text-sm text-white w-full hover:bg-gray-700"
        >
          <MessageSquare size={16} />
          <span>Give Feedback</span>
        </Button>
      );
    } else if (userVolunteered) {
      // For upcoming events user has volunteered for
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleViewTasks(event.id, e)}
          className="flex items-center bg-green-600 justify-center gap-1 text-sm text-white w-full hover:bg-green-700"
        >
          <ListTodo size={16} />
          <span>View Tasks</span>
        </Button>
      );
    } else {
      // For upcoming events user hasn't volunteered for
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleVolunteerSignup(event.id, e)}
          className="flex items-center bg-red-600 justify-center gap-1 text-sm text-white w-full hover:bg-red-700"
        >
          <span>Volunteer Now</span>
        </Button>
      );
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <Header user={user} handleLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-8 pt-28">
          {/* Events Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Volunteer Opportunities</h1>
              <p className="text-gray-600">Find and join events that match your interests</p>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="bg-card rounded-xl shadow-sm border border-border mb-8 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search events by name, description, or location" 
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                  aria-label="Search events"
                />
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Select value={selectedType} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-40" aria-label="Filter by type">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {eventTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedDate} onValueChange={handleDateChange}>
                  <SelectTrigger className="w-40" aria-label="Filter by date">
                    <SelectValue placeholder="All Dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="nextMonth">Next Month</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={myVolunteeringFilter} onValueChange={handleVolunteeringFilterChange}>
                  <SelectTrigger className="w-40" aria-label="Filter by my events">
                    <SelectValue placeholder="All Events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="myEvents">My Events</SelectItem>
                  </SelectContent>
                </Select>
                
                {(searchTerm || selectedType !== 'all' || selectedDate !== 'all' || myVolunteeringFilter !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    aria-label="Clear filters"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
            
            {/* Active Filters */}
            {(searchTerm || selectedType !== 'all' || selectedDate !== 'all' || myVolunteeringFilter !== 'all') && (
              <div className="mt-4 flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center">
                    Search: {searchTerm}
                    <button 
                      onClick={() => setSearchTerm('')} 
                      className="ml-1 hover:text-primary"
                      aria-label="Remove search filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {selectedType !== 'all' && (
                  <Badge variant="secondary" className="flex items-center">
                    Type: {selectedType}
                    <button 
                      onClick={() => setSelectedType('all')} 
                      className="ml-1 hover:text-primary"
                      aria-label="Remove type filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {selectedDate !== 'all' && (
                  <Badge variant="secondary" className="flex items-center">
                    Date: {selectedDate}
                    <button 
                      onClick={() => setSelectedDate('all')} 
                      className="ml-1 hover:text-primary"
                      aria-label="Remove date filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {myVolunteeringFilter !== 'all' && (
                  <Badge variant="secondary" className="flex items-center">
                    My Events Only
                    <button 
                      onClick={() => setMyVolunteeringFilter('all')} 
                      className="ml-1 hover:text-primary"
                      aria-label="Remove my events filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <div key={event.id} onClick={() => navigateToEventDetails(event.id)}>
                  <EventCard
                    id={event.id.toString()}
                    title={event.title}
                    description={event.description}
                    start_date={event.start_date}
                    end_date={event.end_date}
                    location={event.location}
                    category={event.type}
                    volunteersNeeded={event.volunteers}
                    imageSrc={event.image}
                    isRegistered={hasVolunteered(event.id)}
                    isRecommended={false}
                    loading={false}
                    handleVolunteerSignup={() => handleVolunteerSignup(event.id, e)}
                    customButtons={renderCustomButtons(event)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No events found</h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria to find events.
              </p>
              <Button 
                variant="outline" 
                onClick={clearFilters} 
                className="mt-4"
              >
                Clear All Filters
              </Button>
            </motion.div>
          )}
        </main>
      </div>
      <AccessibilityMenu/>
    </div>
  );
};

export default VolunteerEvents;