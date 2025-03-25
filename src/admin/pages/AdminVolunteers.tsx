import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Award, Calendar, MapPin, 
  Code, Activity, ChevronDown, ChevronUp, User, UserCheck, Clock, X,MessageSquare, Trash,CheckCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase';
import { getVolunteers, getVolunteerDetails } from '@/services/database.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { pointsService } from '@/services/points.service';
import { getVolunteerLeaderboard } from '@/services/database.service';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

const AdminVolunteers = () => {
  // State for volunteers data
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVolunteers, setSelectedVolunteers] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  // State for UI controls
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'leaderboard', 'analytics'

  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // New state for event history modal
  const [showEventHistoryModal, setShowEventHistoryModal] = useState(false);
  const [eventHistory, setEventHistory] = useState(null);
  const [loadingEventHistory, setLoadingEventHistory] = useState(false);
  
  const { adminUser, logout } = useAuth();
  const auth = useAuth();
  const navigate = useNavigate();

  // Leaderboard data fetch with React Query - moved to component top level
  const { 
    data: leaderboardData, 
    isLoading: leaderboardLoading, 
    error: leaderboardError 
  } = useQuery({
    queryKey: ['admin-leaderboard'],
    queryFn: () => pointsService.getLeaderboard(20), // Get top 20 volunteers
    retryDelay: 1000,
    retry: 3,
    // Only fetch when viewing leaderboard to save resources
    enabled: viewMode === 'leaderboard'
  });

  // Handle opening the volunteer details modal
  const handleViewVolunteer = (volunteer) => {
    console.log("Selected volunteer for view:", volunteer);
    setSelectedVolunteer(volunteer);
    setShowModal(true);
  };

  // Close the modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedVolunteer(null);
  };

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
          
          // Calculate hours and event counts per volunteer
          if (signupData) {
            const volunteerStats = {};
            signupData.forEach(signup => {
              if (!volunteerStats[signup.volunteer_id]) {
                volunteerStats[signup.volunteer_id] = {
                  events: new Set(),
                  hours: 0
                };
              }
              
              volunteerStats[signup.volunteer_id].events.add(signup.event_id);
              volunteerStats[signup.volunteer_id].hours += parseFloat(signup.hours) || 0;
            });
            
            // Update processed data with event stats
            processedData = processedData.map(volunteer => {
              if (volunteerStats[volunteer.id]) {
                return {
                  ...volunteer,
                  events: volunteerStats[volunteer.id].events.size,
                  hours: volunteerStats[volunteer.id].hours
                };
              }
              return volunteer;
            });
          }
          
          // Extract all unique skills, domains and availability options for filters
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
            skills: [...skillsSet],
            domain: [...domainSet],
            availability: [...availabilitySet]
          });
          
          // Sort volunteers alphabetically by name
          processedData.sort((a, b) => {
            const nameA = `${a.firstname} ${a.lastname}`.toLowerCase();
            const nameB = `${b.firstname} ${b.lastname}`.toLowerCase();
            return nameA.localeCompare(nameB);
          });
          
          setVolunteers(processedData);
          setFilteredVolunteers(processedData);
        }
      } catch (err) {
        console.error('Error fetching volunteers:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVolunteersData();
  }, []);
   // Toggle individual volunteer selection
   const toggleSelection = (id) => {
    setSelectedVolunteers((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedVolunteers(new Set());
    } else {
      setSelectedVolunteers(new Set(volunteers.map((v) => v.id)));
    }
    setSelectAll(!selectAll);
  };
  const deleteSelected = async () => {
    if (selectedVolunteers.size === 0) {
      toast.error('No volunteers selected for deletion');
      return;
    }

    const idsToDelete = Array.from(selectedVolunteers);
    const { error } = await supabase.from('volunteer').delete().in('id', idsToDelete);

    if (error) {
      toast.error('Failed to delete volunteers');
    } else {
      toast.success('Selected volunteers deleted');
      setVolunteers(volunteers.filter((v) => !selectedVolunteers.has(v.id)));
      setSelectedVolunteers(new Set());
      setSelectAll(false);
    }
  };
  
  const sendMessage = async () => {
    if (selectedVolunteers.size === 0) {
      toast.error('No volunteers selected for messaging');
      return;
    }
    if (!messageTitle || !messageBody) {
      toast.error('Title and message cannot be empty');
      return;
    }

    const messages = Array.from(selectedVolunteers).map((volunteerId) => ({
      volunteer_id: volunteerId,
      title_noti: messageTitle,
      message: messageBody,
      sent_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('internal_noti').insert(messages);

    if (error) {
      toast.error('Failed to send message');
      setIsSending(false);
    } else {
      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        setMessageTitle('');
        setMessageBody('');
        setSelectedVolunteers(new Set());
        setSelectAll(false);
      }, 2000);
    }
    setIsSending(false);
  };

  // Filter volunteers based on search and filters
  useEffect(() => {
    if (!volunteers.length) return;
    
    let filtered = [...volunteers];
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(v => 
        v.firstname.toLowerCase().includes(search) ||
        v.lastname.toLowerCase().includes(search) ||
        v.email.toLowerCase().includes(search) ||
        v.city.toLowerCase().includes(search)
      );
    }
    
    // Apply skill filters
    if (selectedFilters.skills.length > 0) {
      filtered = filtered.filter(v => 
        selectedFilters.skills.some(skill => 
          v.skills && v.skills.includes(skill)
        )
      );
    }
    
    // Apply domain filters
    if (selectedFilters.domain.length > 0) {
      filtered = filtered.filter(v => 
        selectedFilters.domain.includes(v.domain)
      );
    }
    
    // Apply availability filters
    if (selectedFilters.availability.length > 0) {
      filtered = filtered.filter(v => 
        selectedFilters.availability.includes(v.availability)
      );
    }
    
    setFilteredVolunteers(filtered);
  }, [searchTerm, selectedFilters, volunteers]);

  const toggleFilter = (type, value) => {
    const filtersCopy = { ...selectedFilters };
    
    if (filtersCopy[type].includes(value)) {
      // Remove the filter if it's already selected
      filtersCopy[type] = filtersCopy[type].filter(item => item !== value);
    } else {
      // Add the filter if it's not already selected
      filtersCopy[type] = [...filtersCopy[type], value];
    }
    
    setSelectedFilters(filtersCopy);
  };

  const clearFilters = () => {
    setSelectedFilters({
      skills: [],
      domain: [],
      availability: []
    });
    setSearchTerm('');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLogout = async () => {
    // Fixed logout handler
    await logout();
    navigate('/admin/login');
  };
  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (err) {
      return "Invalid date";
    }
  };

  // LEADERBOARD VIEW COMPONENTS - Using points system
  const renderLeaderboard = () => {
    if (leaderboardLoading) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md flex justify-center">
          <LoadingSpinner size="medium" text="Loading leaderboard..." />
        </div>
      );
    }
    
    if (leaderboardError) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center text-red-500 py-4">
            Failed to load leaderboard. Please try again later.
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-6 text-center">Volunteer Leaderboard</h2>
        <div className="overflow-hidden">
          {leaderboardData && leaderboardData.length > 0 ? (
            leaderboardData.map((volunteer, index) => (
              <div 
                key={volunteer.volunteer_id}
                className="flex items-center py-3 border-b last:border-0 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 font-bold text-center">{index + 1}</div>
                <div className="flex-1 flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                    {volunteer.profile_image ? (
                      <img 
                        src={volunteer.profile_image} 
                        alt={`${volunteer.first_name} ${volunteer.last_name}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{volunteer.first_name} {volunteer.last_name}</h3>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-lg font-bold">{volunteer.total_points} points</div>
                  <div className="text-xs text-gray-500">{volunteer.badge_count} badges</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              No volunteers data available
            </div>
          )}
        </div>
      </div>
    );
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary Cards */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Volunteer Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Total Volunteers</p>
              <p className="text-3xl font-bold">{totalVolunteers}</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Active Volunteers</p>
              <p className="text-3xl font-bold">{activeVolunteers}</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Total Hours</p>
              <p className="text-3xl font-bold">{totalHours}</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Avg Hours/Volunteer</p>
              <p className="text-3xl font-bold">
                {totalVolunteers ? (totalHours / totalVolunteers).toFixed(1) : '0'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Skills Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Top Skills</h2>
          <div className="space-y-3">
            {sortedSkills.map(([skill, count]) => (
              <div key={skill} className="flex items-center">
                <span className="w-1/3">{skill}</span>
                <div className="flex-1">
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-200">
                      <div 
                        style={{ width: `${(count / totalVolunteers) * 100}%` }} 
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                      ></div>
                    </div>
                  </div>
                </div>
                <span className="w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Location Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Volunteer Locations</h2>
          <div className="space-y-3">
            {sortedLocations.map(([location, count]) => (
              <div key={location} className="flex items-center">
                <span className="w-1/3">{location}</span>
                <div className="flex-1">
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                      <div 
                        style={{ width: `${(count / totalVolunteers) * 100}%` }} 
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      ></div>
                    </div>
                  </div>
                </div>
                <span className="w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Recent Registrations</h2>
          <div className="space-y-3">
            {volunteers
              .sort((a, b) => new Date(b.created) - new Date(a.created))
              .slice(0, 5)
              .map(volunteer => (
                <div key={volunteer.id} className="flex items-center p-2 border-b">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">{volunteer.firstname} {volunteer.lastname}</p>
                    <p className="text-sm text-gray-500">Joined {formatDate(volunteer.created)}</p>
                  </div>
                </div>
              ))}
          </div>
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
               <td className="border px-4 py-2">
                    <Checkbox
                      checked={selectedVolunteers.has(volunteer.id)}
                      onCheckedChange={() => toggleSelection(volunteer.id)}
                    />
                  </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
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
                <Badge className={`
                  ${volunteer.availability === 'weekends' ? 'bg-green-100 text-green-800' : ''}
                  ${volunteer.availability === 'both' ? 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 text-white' : ''}
                  ${volunteer.availability === 'weekdays' ? 'bg-green-100 text-green-800' : ''}
                `}>
                  {volunteer.availability}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewVolunteer(volunteer)}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // New function to handle viewing event history
  const handleViewEventHistory = async () => {
    if (!selectedVolunteer) return;
    
    try {
      setLoadingEventHistory(true);
      const volunteerId = selectedVolunteer.id;
      console.log("Fetching event history for volunteer ID:", volunteerId);
      
      // First check if the event_signup table is working correctly
      const { checkEventSignupTable, getVolunteerEvents } = await import('@/services/database.service');
      const tableStatus = await checkEventSignupTable();
      console.log("Event signup table status:", tableStatus);
      
      // If table doesn't exist or has issues, show a toast message
      if (!tableStatus.exists || !tableStatus.complete) {
        toast.error(`Database issue: ${tableStatus.details}`);
        console.error("Event signup table issue:", tableStatus);
      }
      
      // Get volunteer details first
      const { data: volunteerData, error: volunteerError } = await getVolunteerDetails(volunteerId);
      
      if (volunteerError) throw volunteerError;
      
      // Get events directly with our new function
      const { pastEvents, upcomingEvents, stats, error: eventsError } = 
        await getVolunteerEvents(volunteerId);
      
      if (eventsError) {
        console.error("Error fetching volunteer events:", eventsError);
        toast.error("Failed to load events data");
      }
      
      // Combine the volunteer details with event history
      const completeData = {
        ...volunteerData,
        pastEvents: pastEvents || [],
        upcomingEvents: upcomingEvents || [],
        stats: stats || { totalHours: 0, eventsAttended: 0, signupCount: 0 }
      };
      
      console.log("Combined volunteer data:", completeData);
      console.log("Past events:", completeData.pastEvents);
      console.log("Upcoming events:", completeData.upcomingEvents);
      console.log("Stats:", completeData.stats);
      
      // If no event data but the volunteer exists, show a message
      if (completeData.stats.signupCount === 0) {
        toast.info(`${completeData.first_name} hasn't registered for any events yet`);
      }
      
      setEventHistory(completeData);
      setShowEventHistoryModal(true);
      
    } catch (err) {
      console.error('Error fetching volunteer event history:', err);
      toast.error('Failed to load event history');
    } finally {
      setLoadingEventHistory(false);
    }
  };
  
  // Close the event history modal
  const closeEventHistoryModal = () => {
    setShowEventHistoryModal(false);
    setEventHistory(null);
  };

  // Modal for viewing volunteer details
  const renderVolunteerModal = () => {
    if (!selectedVolunteer) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Volunteer Profile</h2>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column - Personal info */}
              <div className="md:col-span-1">
                <div className="flex flex-col items-center mb-4">
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                    <User className="h-12 w-12 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold">{selectedVolunteer.firstname} {selectedVolunteer.lastname}</h3>
                  <p className="text-sm text-gray-500">{selectedVolunteer.email}</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p>{selectedVolunteer.contact || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p>{selectedVolunteer.city}{selectedVolunteer.state ? `, ${selectedVolunteer.state}` : ''}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Joined</p>
                    <p>{formatDate(selectedVolunteer.created)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Availablity</p>
                    <Badge className={`
                      ${selectedVolunteer.availability === 'weekends' ? 'bg-green-100 text-green-800' : ''}
                      ${selectedVolunteer.availability === 'both' ? 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 text-white' : ''}
                      ${selectedVolunteer.availability === 'weekdays' ? 'bg-green-100 text-green-800' : ''}
                    `}>
                      {selectedVolunteer.availability}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Middle column - Skills and interests */}
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold mb-3">Skills & Interests</h3>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedVolunteer.skills && selectedVolunteer.skills.length > 0 ? (
                      selectedVolunteer.skills.map(skill => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-400">No skills specified</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Primary Interest</p>
                  <Badge variant="outline">{selectedVolunteer.domain}</Badge>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Availability</p>
                  <p>{selectedVolunteer.availability}</p>
                </div>
              </div>
              
              {/* Right column - Stats */}
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold mb-3">Volunteer Stats</h3>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-500">Events</p>
                    <p className="text-2xl font-bold">{selectedVolunteer.events}</p>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-500">Hours</p>
                    <p className="text-2xl font-bold">{selectedVolunteer.hours}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={handleViewEventHistory}
                    disabled={loadingEventHistory}
                  >
                    {loadingEventHistory ? 'Loading...' : 'View Event History'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // New modal for displaying event history
  const renderEventHistoryModal = () => {
    if (!showEventHistoryModal || !eventHistory) return null;
    
    console.log("Rendering event history modal with data:", eventHistory);
    const pastEvents = eventHistory.pastEvents || [];
    const upcomingEvents = eventHistory.upcomingEvents || [];
    
    console.log("Past events count:", pastEvents.length);
    console.log("Upcoming events count:", upcomingEvents.length);
    console.log("Stats for display:", eventHistory.stats);
    
    // Ensure stats exists and has default values if any property is missing
    const stats = eventHistory.stats || {};
    const totalEvents = stats.signupCount || pastEvents.length + upcomingEvents.length;
    const eventsAttended = stats.eventsAttended || 0;
    const totalHours = stats.totalHours || 0;
    
    console.log("Calculated stats for display:", { totalEvents, eventsAttended, totalHours });
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Event History for {eventHistory.first_name} {eventHistory.last_name}</h2>
              <Button variant="ghost" size="sm" onClick={closeEventHistoryModal}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-8">
              {/* Volunteer stats summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Total Events</p>
                  <p className="text-2xl font-bold">{totalEvents}</p>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Events Attended</p>
                  <p className="text-2xl font-bold">{eventsAttended}</p>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Total Hours</p>
                  <p className="text-2xl font-bold">{totalHours}</p>
                </div>
              </div>
              
              {/* Upcoming events section */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Upcoming Events</h3>
                {upcomingEvents.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Event Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {upcomingEvents.map((signup) => (
                          <tr key={signup.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {signup.event?.title || 'Unknown Event'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {signup.event?.start_date ? formatDate(signup.event.start_date) : 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {signup.event?.location || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="outline">
                                {signup.event?.category || 'Uncategorized'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="outline" className={`
                                ${signup.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                                ${signup.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                              `}>
                                {signup.status || 'Registered'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No upcoming events</p>
                  </div>
                )}
              </div>
              
              {/* Past events section */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Past Events</h3>
                {pastEvents.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Event Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hours
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Attended
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pastEvents.map((signup) => (
                          <tr key={signup.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {signup.event?.title || 'Unknown Event'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {signup.event?.start_date ? formatDate(signup.event.start_date) : 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {signup.event?.location || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="outline">
                                {signup.event?.category || 'Uncategorized'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {signup.hours || '0'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={signup.attended ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {signup.attended ? 'Yes' : 'No'}
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
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <AdminHeader  user={auth.user} handleLogout={handleLogout} title="Volunteer Management" />

    <div className="flex h-screen bg-gray-100 overflow-hidden">

      <AdminSidebar />
        
        <main className="flex-1 overflow-y-auto p-4">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>
              <p className="text-gray-500">Manage and view all registered volunteers</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                List View
              </Button>
              <Button 
                variant={viewMode === 'leaderboard' ? 'default' : 'outline'}
                onClick={() => setViewMode('leaderboard')}
                className={viewMode === 'leaderboard' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                Leaderboard
              </Button>
              <Button 
                variant={viewMode === 'analytics' ? 'default' : 'outline'}
                onClick={() => setViewMode('analytics')}
                className={viewMode === 'analytics' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                Analytics
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
              <th className="border px-4 py-2">
                  <Checkbox checked={selectAll} onCheckedChange={toggleSelectAll} />
                </th>
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
                <Button onClick={deleteSelected} variant="destructive">
                <Trash className="w-5 h-5 mr-2" />
        </Button>
              <Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      <MessageSquare className="w-5 h-5 mr-2" />
      Send Message
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-80 p-4">
    <h3 className="text-lg font-semibold mb-2">Send Notification</h3>
    <Input
      placeholder="Enter Title"
      value={messageTitle}
      onChange={(e) => setMessageTitle(e.target.value)}
      className="mb-2"
      disabled={isSending}
    />
    <Textarea
      placeholder="Enter Message"
      value={messageBody}
      onChange={(e) => setMessageBody(e.target.value)}
      className="mb-2"
      disabled={isSending}
    />
    <Button onClick={sendMessage} className="w-full" disabled={isSending || isSent}>
      {isSent ? <CheckCircle className="w-5 h-5 mr-2" /> : null}
      {isSent ? 'Sent!' : isSending ? 'Sending...' : 'Send'}
    </Button>
  </PopoverContent>
</Popover>

              </div>
              
              {showFilters && (
                <div className="mt-4 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Skills filter */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {filters.skills.map(skill => (
                          <Badge 
                            key={skill}
                            variant={selectedFilters.skills.includes(skill) ? "default" : "outline"}
                            className={`cursor-pointer ${
                              selectedFilters.skills.includes(skill) ? 'bg-purple-600' : ''
                            }`}
                            onClick={() => toggleFilter('skills', skill)}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Domain filter */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Primary Interest</h3>
                      <div className="flex flex-wrap gap-2">
                        {filters.domain.map(domain => (
                          <Badge 
                            key={domain}
                            variant={selectedFilters.domain.includes(domain) ? "default" : "outline"}
                            className={`cursor-pointer ${
                              selectedFilters.domain.includes(domain) ? 'bg-purple-600' : ''
                            }`}
                            onClick={() => toggleFilter('domain', domain)}
                          >
                            {domain}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Availability filter */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Availability</h3>
                      <div className="flex flex-wrap gap-2">
                        {filters.availability.map(availability => (
                          <Badge 
                            key={availability}
                            variant={selectedFilters.availability.includes(availability) ? "default" : "outline"}
                            className={`cursor-pointer ${
                              selectedFilters.availability.includes(availability) ? 'bg-purple-600' : ''
                            }`}
                            onClick={() => toggleFilter('availability', availability)}
                          >
                            {availability}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {(selectedFilters.skills.length > 0 || 
                    selectedFilters.domain.length > 0 || 
                    selectedFilters.availability.length > 0) && (
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="mr-2 h-4 w-4" />
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          ) : filteredVolunteers.length === 0 ? (
            <div className="text-center py-10">
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
              {viewMode === 'leaderboard' && renderLeaderboard()}
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

export default AdminVolunteers;
