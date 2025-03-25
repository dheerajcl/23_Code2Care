import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebmasterAuth } from '@/lib/authContext';
import { User, Search, Filter, ChevronDown, ChevronUp, Calendar, XCircle, ArrowUp, ArrowDown, Eye, BarChart2, List } from 'lucide-react';
import { WebmasterHeader } from '../components/WebmasterHeader';
import { WebmasterSidebar } from '../components/WebmasterSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getVolunteers, getVolunteerEventHistory } from '@/services/database.service';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { toast } from '@/components/ui/use-toast';

export const WebmasterVolunteers: React.FC = () => {
  // State for volunteers data
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for UI controls
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'analytics'

  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // New state for event history modal
  const [showEventHistoryModal, setShowEventHistoryModal] = useState(false);
  const [eventHistory, setEventHistory] = useState(null);
  const [loadingEventHistory, setLoadingEventHistory] = useState(false);
  
  const auth = useWebmasterAuth();
  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState({
    skills: [],
    domain: [],
    availability: []
  });
  const [selectedFilters, setSelectedFilters] = useState({
    skills: [],
    domain: [],
    availability: []
  });

  // Fetch volunteers data from Supabase
  useEffect(() => {
    const fetchVolunteersData = async () => {
      setIsLoading(true);
      try {
        // Get volunteer data
        const { data, error } = await getVolunteers();
        
        if (error) throw error;
        
        if (data) {
          // Process volunteer data for display
          let processedData = data.map(volunteer => {
            return {
              id: volunteer.id,
              firstname: volunteer.first_name || '',
              lastname: volunteer.last_name || '',
              email: volunteer.email || '',
              contact: volunteer.phone || '',
              city: volunteer.city || '',
              state: volunteer.state || '',
              skills: volunteer.skills || [],
              domain: volunteer.interests ? volunteer.interests[0] : 'Not specified', 
              availability: volunteer.availability || 'Not specified',
              created: volunteer.created_at || new Date().toISOString(),
              events: 0, // Will be updated if we have event registration data
              hours: 0,  // Will be updated if we have event registration data
              rating: 5, // Default rating
              status: 'Active' // Default status
            };
          });
          
          // Fetch event registration data to get events and hours
          const { data: signupData, error: signupError } = await supabase
            .from('event_signup')
            .select('volunteer_id, event_id, hours');
          
          if (signupError) throw signupError;
          
          // Update volunteer events and hours if signup data exists
          if (signupData) {
            processedData = processedData.map(volunteer => {
              const volunteerSignups = signupData.filter(s => s.volunteer_id === volunteer.id);
              const uniqueEvents = new Set(volunteerSignups.map(s => s.event_id));
              const totalHours = volunteerSignups.reduce((sum, s) => sum + (s.hours || 0), 0);
              
              return {
                ...volunteer,
                events: uniqueEvents.size,
                hours: totalHours
              };
            });
          }
          
          // Get unique values for filters
          const skillsSet = new Set();
          const domainSet = new Set();
          const availabilitySet = new Set();
          
          processedData.forEach(volunteer => {
            if (volunteer.skills) {
              volunteer.skills.forEach(skill => skillsSet.add(skill));
            }
            
            if (volunteer.domain) {
              domainSet.add(volunteer.domain);
            }
            
            if (volunteer.availability) {
              availabilitySet.add(volunteer.availability);
            }
          });
          
          setFilters({
            skills: Array.from(skillsSet),
            domain: Array.from(domainSet),
            availability: Array.from(availabilitySet)
          });
          
          setVolunteers(processedData);
          setFilteredVolunteers(processedData);
        }
      } catch (err) {
        console.error("Error fetching volunteers:", err);
        setError(err.message);
        toast({
          title: "Error",
          description: "Could not fetch volunteers data: " + err.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVolunteersData();
  }, []);

  // Search and filter functionality
  useEffect(() => {
    let result = [...volunteers];
    
    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(volunteer => 
        `${volunteer.firstname} ${volunteer.lastname}`.toLowerCase().includes(lowerSearchTerm) ||
        volunteer.email.toLowerCase().includes(lowerSearchTerm) ||
        (volunteer.city && volunteer.city.toLowerCase().includes(lowerSearchTerm)) ||
        (volunteer.state && volunteer.state.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // Apply advanced filters
    if (selectedFilters.skills.length > 0) {
      result = result.filter(volunteer => 
        selectedFilters.skills.some(skill => 
          volunteer.skills && volunteer.skills.includes(skill)
        )
      );
    }
    
    if (selectedFilters.domain.length > 0) {
      result = result.filter(volunteer => 
        selectedFilters.domain.includes(volunteer.domain)
      );
    }
    
    if (selectedFilters.availability.length > 0) {
      result = result.filter(volunteer => 
        selectedFilters.availability.includes(volunteer.availability)
      );
    }
    
    setFilteredVolunteers(result);
  }, [searchTerm, selectedFilters, volunteers]);

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Toggle filter selection
  const toggleFilter = (type, value) => {
    setSelectedFilters(prev => {
      const current = [...prev[type]];
      const index = current.indexOf(value);
      
      if (index === -1) {
        current.push(value);
      } else {
        current.splice(index, 1);
      }
      
      return {
        ...prev,
        [type]: current
      };
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters({
      skills: [],
      domain: [],
      availability: []
    });
    setSearchTerm('');
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Unknown date';
    }
  };
  
  // Handle opening the volunteer details modal
  const handleViewVolunteer = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowModal(true);
  };

  // Close the modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedVolunteer(null);
  };

  // Handle viewing event history
  const handleViewEventHistory = async (volunteerId) => {
    setLoadingEventHistory(true);
    setShowEventHistoryModal(true);
    
    try {
      // Fetch events this volunteer has participated in
      const { data, error } = await getVolunteerEventHistory(volunteerId);
      
      if (error) throw error;
      
      setEventHistory(data || []);
    } catch (err) {
      console.error("Error fetching event history:", err);
      toast({
        title: "Error",
        description: "Could not fetch event history: " + err.message,
        variant: "destructive"
      });
    } finally {
      setLoadingEventHistory(false);
    }
  };

  // ANALYTICS VIEW COMPONENTS
  const renderAnalytics = () => {
    // Calculate analytics
    const totalVolunteers = volunteers.length;
    const totalHours = volunteers.reduce((sum, v) => sum + v.hours, 0);
    const totalEvents = new Set(volunteers.flatMap(v => v.events || [])).size;
    const activeVolunteers = volunteers.filter(v => v.status === 'Active').length;
    
    // Group by skills, cities, etc for charts
    const skillsData = {};
    volunteers.forEach(volunteer => {
      if (volunteer.skills) {
        volunteer.skills.forEach(skill => {
          skillsData[skill] = (skillsData[skill] || 0) + 1;
        });
      }
    });
    
    const locationData = {};
    volunteers.forEach(volunteer => {
      if (volunteer.city) {
        locationData[volunteer.city] = (locationData[volunteer.city] || 0) + 1;
      }
    });
    
    // Sort skill and location data by count
    const sortedSkills = Object.entries(skillsData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const sortedLocations = Object.entries(locationData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Summary Cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVolunteers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeVolunteers} active ({Math.round((activeVolunteers / totalVolunteers) * 100)}%)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Volunteer Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average {(totalHours / totalVolunteers).toFixed(1)} hours per volunteer
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedSkills.map(([skill, count], index) => (
                <div key={skill} className="flex justify-between items-center">
                  <span className="text-sm">{skill}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedLocations.map(([location, count], index) => (
                <div key={location} className="flex justify-between items-center">
                  <span className="text-sm">{location}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        <div className="md:col-span-2 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Registrations</CardTitle>
              <CardDescription>New volunteers who recently signed up</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {volunteers
                  .sort((a, b) => new Date(b.created) - new Date(a.created))
                  .slice(0, 5)
                  .map(volunteer => (
                    <div key={volunteer.id} className="flex items-center p-2 border-b">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-3">
                        {volunteer.firstname.charAt(0)}{volunteer.lastname.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{volunteer.firstname} {volunteer.lastname}</p>
                        <p className="text-sm text-gray-500">Joined {formatDate(volunteer.created)}</p>
                      </div>
                      <Badge variant="outline">{volunteer.city || 'No location'}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // LIST VIEW COMPONENTS
  const renderVolunteerList = () => (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Volunteer
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Skills
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Events
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hours
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Availability
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredVolunteers.map((volunteer) => (
            <tr key={volunteer.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center">
                    {volunteer.firstname.charAt(0)}{volunteer.lastname.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {volunteer.firstname} {volunteer.lastname}
                    </div>
                    <div className="text-sm text-gray-500">{volunteer.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{volunteer.city || 'Not specified'}</div>
                <div className="text-sm text-gray-500">{volunteer.state || ''}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {volunteer.skills && volunteer.skills.length > 0 ? (
                    volunteer.skills.slice(0, 2).map(skill => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No skills specified</span>
                  )}
                  {volunteer.skills && volunteer.skills.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{volunteer.skills.length - 2} more
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {volunteer.events}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {volunteer.hours}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant="outline" className={`
                  ${volunteer.availability === 'weekends' ? 'bg-blue-100 text-blue-800' : ''}
                  ${volunteer.availability === 'both' ? 'bg-green-100 text-green-800' : ''}
                  ${volunteer.availability === 'weekdays' ? 'bg-amber-100 text-amber-800' : ''}
                `}>
                  {volunteer.availability}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Button 
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => handleViewVolunteer(volunteer)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Volunteer Modal Component
  const renderVolunteerModal = () => {
    if (!selectedVolunteer) return null;
    
    return (
      <Dialog open={showModal} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Volunteer Profile</DialogTitle>
            <DialogDescription>
              Volunteer details and history
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xl font-semibold">
                {selectedVolunteer.firstname.charAt(0)}{selectedVolunteer.lastname.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{selectedVolunteer.firstname} {selectedVolunteer.lastname}</h3>
                <div className="text-sm text-gray-500">{selectedVolunteer.email}</div>
                <div className="text-sm text-gray-500">{selectedVolunteer.contact || 'No contact number'}</div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Read-only View
                  </Badge>
                  <Badge variant={selectedVolunteer.status === 'Active' ? 'success' : 'secondary'}>
                    {selectedVolunteer.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Location</h4>
                <p className="text-base">{selectedVolunteer.city || 'Not specified'}{selectedVolunteer.state ? `, ${selectedVolunteer.state}` : ''}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Availability</h4>
                <p className="text-base">{selectedVolunteer.availability}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Events Attended</h4>
                <p className="text-base">{selectedVolunteer.events}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Volunteer Hours</h4>
                <p className="text-base">{selectedVolunteer.hours}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {selectedVolunteer.skills && selectedVolunteer.skills.length > 0 ? (
                  selectedVolunteer.skills.map(skill => (
                    <Badge key={skill} variant="outline" className="bg-gray-100">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-400">No skills specified</span>
                )}
              </div>
            </div>
            
            <Button 
              variant="outline"
              onClick={() => {
                handleViewEventHistory(selectedVolunteer.id);
                closeModal();
              }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              View Event History
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Event History Modal
  const renderEventHistoryModal = () => {
    return (
      <Dialog open={showEventHistoryModal} onOpenChange={setShowEventHistoryModal}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Event Participation History</DialogTitle>
            <DialogDescription>
              {selectedVolunteer ? `Events attended by ${selectedVolunteer.firstname} ${selectedVolunteer.lastname}` : 'Volunteer event history'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {loadingEventHistory ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
              </div>
            ) : (
              <div>
                {eventHistory && eventHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Event
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hours
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {eventHistory.map((record) => (
                          <tr key={record.id}>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{record.event?.title || 'Unknown Event'}</div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{formatDate(record.event?.start_date)}</div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{record.event?.location || 'Not specified'}</div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{record.hours || 'Not logged'}</div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <Badge variant={
                                record.status === 'confirmed' ? 'success' :
                                record.status === 'pending' ? 'outline' : 'secondary'
                              }>
                                {record.status || 'Registered'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No past events</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <WebmasterHeader />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <WebmasterSidebar />
        
        <main className="flex-1 overflow-y-auto p-4">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-500">View all registered volunteers</p>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Read-only View
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'} 
                className="flex items-center"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-2" />
                List View
              </Button>
              <Button 
                variant={viewMode === 'analytics' ? 'default' : 'outline'} 
                className="flex items-center"
                onClick={() => setViewMode('analytics')}
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search volunteers by name, email, or location..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                
                <div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    {showFilters ? 
                      <ChevronUp className="ml-2 h-4 w-4" /> : 
                      <ChevronDown className="ml-2 h-4 w-4" />
                    }
                  </Button>
                </div>
              </div>
              
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Skills Filter */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {filters.skills.slice(0, 10).map(skill => (
                          <Badge
                            key={skill}
                            variant={selectedFilters.skills.includes(skill) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleFilter('skills', skill)}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Domain Filter */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Interest Areas</h3>
                      <div className="flex flex-wrap gap-2">
                        {filters.domain.map(domain => (
                          <Badge
                            key={domain}
                            variant={selectedFilters.domain.includes(domain) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleFilter('domain', domain)}
                          >
                            {domain}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Availability Filter */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Availability</h3>
                      <div className="flex flex-wrap gap-2">
                        {filters.availability.map(availability => (
                          <Badge
                            key={availability}
                            variant={selectedFilters.availability.includes(availability) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleFilter('availability', availability)}
                          >
                            {availability}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Clear Filters Button */}
                  {(selectedFilters.skills.length > 0 || selectedFilters.domain.length > 0 || selectedFilters.availability.length > 0) && (
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="ghost" 
                        className="text-red-600 flex items-center"
                        onClick={clearFilters}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading volunteers...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          ) : filteredVolunteers.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow-md">
              <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No volunteers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {volunteers.length === 0 
                  ? "No volunteers have registered yet."
                  : "No volunteers match your current filters."}
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'list' && renderVolunteerList()}
              {viewMode === 'analytics' && renderAnalytics()}
            </>
          )}
          
          {/* Volunteer details modal */}
          {showModal && renderVolunteerModal()}
          
          {/* Event history modal */}
          {renderEventHistoryModal()}
        </main>
      </div>
      <AccessibilityMenu/>
    </div>
  );
}; 