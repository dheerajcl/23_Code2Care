import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';
import { Edit, UserPlus, List, Calendar, MapPin, Users, Search, X } from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../components/ui/select';
import { motion } from 'framer-motion';
import Charity from '../../assets/charity.jpg'
import Workshop from '../../assets/workshop.jpg'
import Community from '../../assets/community_cleanup.jpg'
import Donation from '../../assets/donation.png'
import Cricket from '../../assets/cricket.jpg'

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
    image: Community
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
    image: Charity
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
    image: Workshop
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
    image: Donation
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
    image: Cricket
  }
];

const AdminEventsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [loading, setLoading] = useState(true);

  const eventTypes = [...new Set(eventData.map(event => event.type))];

  useEffect(() => {
    // Simulate loading events from API
    setTimeout(() => {
      setEvents(eventData);
      setLoading(false);
    }, 500);
  }, []);

  const handleLogout = async () => {
    await logout();
    // Redirect is handled by the auth context
  };

  const navigateToEventDetails = (id) => {
    navigate(`/admin/events/${id}`);
  };

  const handleUpdateEvent = (id, e) => {
    e.stopPropagation();
    // Navigate to update event form with the event ID
    navigate(`/admin/events/edit/${id}`);
  };

  const handleAddVolunteers = (id, e) => {
    e.stopPropagation();
    // Navigate to volunteer management page for this event
    navigate(`/admin/events/${id}/volunteers`);
  };

  const handleViewDetails = (id, e) => {
    e.stopPropagation();
    // Navigate to event details page (tasks, etc.)
    navigate(`/admin/events/${id}`);
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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedDate('all');
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
    
    return matchesSearch && matchesType && matchesDate;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <AdminHeader user={user} handleLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-8">
          {/* Events Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Events</h1>
              <p className="text-gray-600">Manage all organization events</p>
            </div>
            <Button 
              onClick={() => navigate('')}
              className="bg-red-700 hover:bg-red-800"
            >
              Create Event
            </Button>
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
              
              <div className="flex gap-4">
                <Select value={selectedType} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-40 md:w-48" aria-label="Filter by type">
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
                  <SelectTrigger className="w-40 md:w-48" aria-label="Filter by date">
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
                
                {(searchTerm || selectedType !== 'all' || selectedDate !== 'all') && (
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
            {(searchTerm || selectedType !== 'all' || selectedDate !== 'all') && (
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
              </div>
            )}
          </div>
          
          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigateToEventDetails(event.id)}
                >
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="mb-2">
                      <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">
                        {event.type}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-2 line-clamp-1">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                    
                    <div className="flex flex-col gap-2 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{event.date} • {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-400" />
                        <span>
                          {event.registrations || event.participants || 0} Registrations • {event.volunteers} Volunteers
                        </span>
                      </div>
                    </div>
                    
                    {/* Replace the existing button layout in your event card with this code */}
                    <div className="border-t pt-4 flex flex-col gap-2">
                    {new Date(event.date) >= new Date() ? (
                      // For upcoming events, show Update and Volunteers buttons
                      <div className="flex justify-between gap-4 w-full">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleUpdateEvent(event.id, e)}
                          className="flex items-center bg-rose-900 justify-center gap-1 text-sm text-white w-1/2 hover:bg-red-800"
                        >
                          <Edit size={16} />
                          <span>Update</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleAddVolunteers(event.id, e)}
                          className="flex items-center bg-rose-900 justify-center gap-1 text-sm text-white w-1/2 hover:bg-red-800"
                        >
                          <UserPlus size={16} />
                          <span>Volunteers</span>
                        </Button>
                      </div>
                    ) : (
                      // For past events, show View Feedback and Delete buttons
                      <div className="flex justify-between gap-4 w-full">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => ({})}
                          className="flex items-center bg-rose-900 justify-center gap-1 text-sm text-white w-1/2 hover:bg-red-800"
                        >
                          <List size={16} />
                          <span>View Feedback</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => ({})}
                          className="flex items-center bg-rose-900 justify-center gap-1 text-sm text-white w-1/2 hover:bg-red-800"
                        >
                          <X size={16} />
                          <span>Delete</span>
                        </Button>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleViewDetails(event.id, e)}
                      className="flex items-center bg-rose-900 justify-center gap-1 text-sm text-white w-full hover:bg-red-800"
                    >
                      <List size={16} />
                      <span>Tasks</span>
                    </Button>
                  </div>
                  </div>
                </motion.div>
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
    </div>
  );
};

export default AdminEventsPage;