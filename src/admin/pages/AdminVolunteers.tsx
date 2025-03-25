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

// Add type definitions at the top of the file
type Volunteer = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  contact?: string;
  city?: string;
  state?: string;
  skills: string[];
  domain: string;
  availability: string;
  created: string;
  events: number;
  hours: number;
  rating: number;
  status: string;
};

type Filters = {
  skills: string[];
  domain: string[];
  availability: string[];
};

type SelectedFilters = {
  skills: string[];
  domain: string[];
  availability: string[];
};

const AdminVolunteers = () => {
  // Update state definitions with proper types
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVolunteers, setSelectedVolunteers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'leaderboard' | 'analytics'>('list');
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEventHistoryModal, setShowEventHistoryModal] = useState(false);
  const [eventHistory, setEventHistory] = useState<any>(null);
  const [loadingEventHistory, setLoadingEventHistory] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    skills: [],
    domain: [],
    availability: []
  });
  
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    skills: [],
    domain: [],
    availability: []
  });

  const { user, logout } = useAuth();
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
            skills: Array.from(skillsSet) as string[],
            domain: Array.from(domainSet) as string[],
            availability: Array.from(availabilitySet) as string[]
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
    const activeVolunteers = volunteers.filter(v => v.status === 'Active').length;
    const totalHours = volunteers.reduce((acc, v) => acc + (v.hours || 0), 0);
    const avgHoursPerVolunteer = totalVolunteers ? Math.round((totalHours / totalVolunteers) * 10) / 10 : 0;
    
    // Group by skills, cities, etc for charts
    const skillsData = volunteers.reduce((acc, volunteer) => {
      volunteer.skills.forEach(skill => {
        acc[skill] = (acc[skill] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    const locationData = volunteers.reduce((acc, volunteer) => {
      const location = volunteer.city || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
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
                {avgHoursPerVolunteer.toFixed(1)}
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
              .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
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
  const renderVolunteerList = () => {
    if (filteredVolunteers.length === 0) {
      return (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No volunteers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {volunteers.length === 0 
              ? "No volunteers have registered yet."
              : "No volunteers match your current filters."}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left">
                <Checkbox 
                  checked={selectAll} 
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all volunteers"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Volunteer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skills
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Events
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Availability
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profile
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVolunteers.map((volunteer) => (
              <tr 
                key={volunteer.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4">
                  <Checkbox
                    checked={selectedVolunteers.has(volunteer.id)}
                    onCheckedChange={() => toggleSelection(volunteer.id)}
                    aria-label={`Select ${volunteer.firstname} ${volunteer.lastname}`}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-600 font-medium">
                          {volunteer.firstname.charAt(0)}
                          {volunteer.lastname.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {volunteer.firstname} {volunteer.lastname}
                      </div>
                      <div className="text-sm text-gray-500">
                        {volunteer.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {volunteer.city || 'Not specified'}, {volunteer.state || ''}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {volunteer.skills.slice(0, 2).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {volunteer.skills.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{volunteer.skills.length - 2}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{volunteer.events}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge className={`
                    ${volunteer.availability === 'weekends' ? 'bg-green-100 text-green-800' : ''}
                    ${volunteer.availability === 'both' ? 'bg-blue-100 text-blue-800' : ''}
                    ${volunteer.availability === 'weekdays' ? 'bg-yellow-100 text-yellow-800' : ''}
                  `}>
                    {volunteer.availability}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewVolunteer(volunteer)}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    View Profile
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

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
        toast.error(`${completeData.first_name} hasn't registered for any events yet`);
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
              <h2 className="text-2xl font-bold">Profile View</h2>
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
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50 px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Volunteers</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and view all registered volunteers
            </p>
          </div>

          {/* View Mode Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setViewMode('list')}
                  className={`${
                    viewMode === 'list'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                >
                  List View
                </button>
                <button
                  onClick={() => setViewMode('leaderboard')}
                  className={`${
                    viewMode === 'leaderboard'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                >
                  Leaderboard
                </button>
                <button
                  onClick={() => setViewMode('analytics')}
                  className={`${
                    viewMode === 'analytics'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                >
                  Analytics
                </button>
              </nav>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search volunteers by name, email, or location..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 w-full"
                />
              </div>
              <div className="flex gap-3 flex-shrink-0">
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
                <Button 
                  variant="destructive" 
                  onClick={deleteSelected}
                  disabled={selectedVolunteers.size === 0}
                  className="flex items-center"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
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
                      className="mb-2 min-h-[100px]"
                      disabled={isSending}
                    />
                    <Button 
                      onClick={sendMessage} 
                      className="w-full" 
                      disabled={isSending || isSent || !messageTitle || !messageBody}
                    >
                      {isSending ? 'Sending...' : isSent ? 'Sent!' : 'Send Message'}
                      {isSent && <CheckCircle className="ml-2 h-4 w-4" />}
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Skills Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {filters.skills.map((skill) => (
                        <label key={skill} className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedFilters.skills.includes(skill)}
                            onCheckedChange={() => toggleFilter('skills', skill)}
                          />
                          <span className="text-sm">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Domain Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                    <div className="space-y-2">
                      {filters.domain.map((domain) => (
                        <label key={domain} className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedFilters.domain.includes(domain)}
                            onCheckedChange={() => toggleFilter('domain', domain)}
                          />
                          <span className="text-sm">{domain}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Availability Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                    <div className="space-y-2">
                      {filters.availability.map((availability) => (
                        <label key={availability} className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedFilters.availability.includes(availability)}
                            onCheckedChange={() => toggleFilter('availability', availability)}
                          />
                          <span className="text-sm">{availability}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" onClick={clearFilters} className="text-sm">
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-lg shadow">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="large" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
              </div>
            ) : viewMode === 'list' ? (
              renderVolunteerList()
            ) : viewMode === 'leaderboard' ? (
              renderLeaderboard()
            ) : (
              renderAnalytics()
            )}
          </div>
        </main>
      </div>
      <AccessibilityMenu />
      {selectedVolunteer && renderVolunteerModal()}
      {showEventHistoryModal && renderEventHistoryModal()}
    </div>
  );
};

export default AdminVolunteers;