import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Award, Calendar, MapPin, 
  Code, Activity, ChevronDown, ChevronUp, User, UserCheck, Clock, X
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase';

const AdminVolunteers = () => {
  // State for volunteers data
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for UI controls
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'leaderboard', 'analytics'

  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  // Fetch volunteers data and hours from event_signup
  useEffect(() => {
    const fetchVolunteersAndHours = async () => {
      setIsLoading(true);
      try {
        // First, get volunteer data
        const { data: volunteersData, error: volunteersError } = await supabase
          .from('volunteer')
          .select('*')
          .order('first_name', { ascending: true });

        if (volunteersError) throw volunteersError;
        
        // Then, get event_signup data to calculate hours and event counts
        const { data: signupData, error: signupError } = await supabase
          .from('event_signup')
          .select('volunteer_id, event_id, hours');
        
        if (signupError) throw signupError;
        
        // Calculate hours and event counts per volunteer
        const volunteerStats = {};
        signupData.forEach(signup => {
          // Initialize or update volunteer stats
          if (!volunteerStats[signup.volunteer_id]) {
            volunteerStats[signup.volunteer_id] = {
              totalHours: 0,
              eventCount: new Set()
            };
          }
          
          // Add hours
          volunteerStats[signup.volunteer_id].totalHours += signup.hours || 0;
          // Add event to count unique events
          volunteerStats[signup.volunteer_id].eventCount.add(signup.event_id);
        });
        
        // Process volunteer data with stats
        const processedData = volunteersData.map(volunteer => {
          const stats = volunteerStats[volunteer.id] || { totalHours: 0, eventCount: new Set() };
          
          return {
            id: volunteer.id,
            firstname: volunteer.first_name || '',
            lastname: volunteer.last_name || '',
            email: volunteer.email || '',
            contact: volunteer.phone || '',
            city: volunteer.city || '',
            state: volunteer.state || '',
            skills: volunteer.skills || [],
            domain: volunteer.interests ? volunteer.interests[0] : 'Not specified', // Using interests as domain
            availability: volunteer.availability || 'Not specified',
            previousVolunteerExperience: volunteer.experience || '',
            hours: stats.totalHours,
            events: stats.eventCount.size,
            heardFrom: volunteer.how_heard || 'Not specified'
          };
        });
        
        setVolunteers(processedData);
        setFilteredVolunteers(processedData);
        
        // Extract unique values for filters
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
        
      } catch (err) {
        console.error('Error fetching volunteers:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVolunteersAndHours();
  }, []);

  // Filter volunteers based on search and selected filters
  useEffect(() => {
    let result = volunteers;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(volunteer => 
        (volunteer.firstname + " " + volunteer.lastname).toLowerCase().includes(term) || 
        volunteer.email.toLowerCase().includes(term)
      );
    }
    
    // Apply skill filters
    if (selectedFilters.skills.length > 0) {
      result = result.filter(volunteer => 
        selectedFilters.skills.some(skill => volunteer.skills && volunteer.skills.includes(skill))
      );
    }
    
    // Apply domain filters
    if (selectedFilters.domain.length > 0) {
      result = result.filter(volunteer => 
        selectedFilters.domain.includes(volunteer.domain)
      );
    }
    
    // Apply availability filters
    if (selectedFilters.availability.length > 0) {
      result = result.filter(volunteer => 
        selectedFilters.availability.includes(volunteer.availability)
      );
    }
    
    setFilteredVolunteers(result);
  }, [searchTerm, selectedFilters, volunteers]);

  // Handle filter selection
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

  // Render volunteer modal - Rating related content removed
  const renderVolunteerModal = () => {
    if (!selectedVolunteer) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
          <div className="flex justify-between items-center border-b p-4">
            <h3 className="text-xl font-semibold">
              {selectedVolunteer.firstname} {selectedVolunteer.lastname}
            </h3>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Email:</span> {selectedVolunteer.email}</p>
                  <p><span className="font-medium">Phone:</span> {selectedVolunteer.contact}</p>
                  <p><span className="font-medium">Location:</span> {selectedVolunteer.city}, {selectedVolunteer.state}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Volunteer Stats</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Hours Contributed:</span> {selectedVolunteer.hours}</p>
                  <p><span className="font-medium">Events Attended:</span> {selectedVolunteer.events}</p>
                  <p><span className="font-medium">Availability:</span> {selectedVolunteer.availability}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-2">Previous Volunteer Experience</h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                {selectedVolunteer.previousVolunteerExperience || 'No previous experience provided.'}
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-2">How They Heard About Us</h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                {selectedVolunteer.heardFrom || 'Not specified'}
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {selectedVolunteer.skills && selectedVolunteer.skills.map(skill => (
                  <span key={skill} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t p-4 flex justify-end">
            <button 
              onClick={closeModal}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 mr-2"
            >
              Close
            </button>
            <button 
              className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Edit Details
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render volunteer list view - Rating removed
  const renderVolunteerList = () => (
    <div className="overflow-x-auto">
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-800"></div>
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-600">
          Error loading volunteers: {error}
        </div>
      ) : (
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Contact</th>
              <th className="py-2 px-4 border-b text-left">Skills</th>
              <th className="py-2 px-4 border-b text-left">Domain</th>
              <th className="py-2 px-4 border-b text-left">Availability</th>
              <th className="py-2 px-4 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVolunteers.length > 0 ? (
              filteredVolunteers.map(volunteer => (
                <tr key={volunteer.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{volunteer.firstname + " " + volunteer.lastname}</td>
                  <td className="py-2 px-4 border-b">
                    <div>{volunteer.email}</div>
                    <div className="text-sm text-gray-500">{volunteer.contact}</div>
                    <div className="text-xs text-gray-500">{volunteer.city}, {volunteer.state}</div>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex flex-wrap gap-1">
                      {volunteer.skills && volunteer.skills.map(skill => (
                        <span key={skill} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex items-center">
                      {volunteer.domain}
                    </div>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {volunteer.availability}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <button className="text-blue-600 hover:text-blue-800 mr-2" onClick={() => handleViewVolunteer(volunteer)}>
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-500">
                  No volunteers found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );

  // Render leaderboard view - Rating removed
  const renderLeaderboard = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium">Volunteer Leaderboard</h3>
        <p className="text-sm text-gray-500">Top volunteers by hours contributed</p>
      </div>
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-800"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">
            Error loading volunteers: {error}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVolunteers
              .sort((a, b) => b.hours - a.hours)
              .map((volunteer, index) => (
                <div key={volunteer.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-800 font-semibold mr-4">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{volunteer.firstname + " " + volunteer.lastname}</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock size={16} className="mr-1" />
                      {volunteer.hours} hours
                      <span className="mx-2">•</span>
                      <Calendar size={16} className="mr-1" />
                      {volunteer.events} events
                      <span className="mx-2">•</span>
                      <MapPin size={16} className="mr-1" />
                      {volunteer.city}, {volunteer.state}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render analytics view - Rating references removed
  const renderAnalytics = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium">Volunteer Analytics</h3>
        <p className="text-sm text-gray-500">Overview of volunteer participation</p>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-800"></div>
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-600">
          Error loading analytics: {error}
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-800 text-sm font-medium">Total Volunteers</p>
                <h4 className="text-2xl font-bold mt-2">{volunteers.length}</h4>
              </div>
              <span className="bg-blue-100 p-2 rounded-full">
                <UserCheck size={24} className="text-blue-800" />
              </span>
            </div>
            <div className="mt-4 text-sm text-blue-600">
              <span className="font-medium">+5%</span> from last month
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-800 text-sm font-medium">Total Hours</p>
                <h4 className="text-2xl font-bold mt-2">
                  {volunteers.reduce((sum, v) => sum + v.hours, 0)}
                </h4>
              </div>
              <span className="bg-green-100 p-2 rounded-full">
                <Clock size={24} className="text-green-800" />
              </span>
            </div>
            <div className="mt-4 text-sm text-green-600">
              <span className="font-medium">+12%</span> from last month
            </div>
          </div>
          
          <div className="md:col-span-2 mt-4">
            <h4 className="font-medium mb-2">Skill Distribution</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filters.skills.map(skill => {
                // Calculate skill distribution
                const count = volunteers.filter(v => v.skills && v.skills.includes(skill)).length;
                const percentage = volunteers.length > 0 ? Math.round((count / volunteers.length) * 100) : 0;
                
                return (
                  <div key={skill} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{skill}</span>
                      <span className="text-sm text-gray-500">{count} volunteers</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const { user, logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    // Redirect is handled by the auth context
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <AdminHeader user={user} handleLogout={handleLogout}/>
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-8">
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Volunteers</h1>
              <p className="text-gray-600">Manage and analyze volunteer data</p>
            </div>
            
            {/* View Mode Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <div className="flex space-x-6">
                <button
                  className={`py-2 px-1 -mb-px ${viewMode === 'list' ? 'border-b-2 border-red-600 text-red-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setViewMode('list')}
                >
                  <span className="flex items-center">
                    <User size={20} className="mr-2" />
                    Volunteer List
                  </span>
                </button>
                <button
                  className={`py-2 px-1 -mb-px ${viewMode === 'leaderboard' ? 'border-b-2 border-red-600 text-red-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setViewMode('leaderboard')}
                >
                  <span className="flex items-center">
                    <Award size={20} className="mr-2" />
                    Leaderboard
                  </span>
                </button>
                <button
                  className={`py-2 px-1 -mb-px ${viewMode === 'analytics' ? 'border-b-2 border-red-600 text-red-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setViewMode('analytics')}
                >
                  <span className="flex items-center">
                    <Activity size={20} className="mr-2" />
                    Analytics
                  </span>
                </button>
              </div>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search volunteers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Filter size={18} className="mr-2" />
                  Filters
                  {showFilters ? (
                    <ChevronUp size={18} className="ml-2" />
                  ) : (
                    <ChevronDown size={18} className="ml-2" />
                  )}
                </button>
                
                {(selectedFilters.skills.length > 0 || 
                  selectedFilters.domain.length > 0 || 
                  selectedFilters.availability.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-100"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
            {/* Filter Panel */}
            {showFilters && (
              <div className="mb-6 bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Skills Filter */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Code size={16} className="mr-2" />
                      Filter by Skills
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {filters.skills.map(skill => (
                        <div key={skill} className="flex items-center">
                          <input
                            id={`skill-${skill}`}
                            type="checkbox"
                            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                            checked={selectedFilters.skills.includes(skill)}
                            onChange={() => toggleFilter('skills', skill)}
                          />
                          <label htmlFor={`skill-${skill}`} className="ml-2 text-sm text-gray-700">
                            {skill}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Domain Filter */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <MapPin size={16} className="mr-2" />
                      Filter by Domain
                    </h3>
                    <div className="space-y-2">
                      {filters.domain.map(domain => (
                        <div key={domain} className="flex items-center">
                          <input
                            id={`domain-${domain}`}
                            type="checkbox"
                            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                            checked={selectedFilters.domain.includes(domain)}
                            onChange={() => toggleFilter('domain', domain)}
                          />
                          <label htmlFor={`domain-${domain}`} className="ml-2 text-sm text-gray-700">
                            {domain}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Availability Filter */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Calendar size={16} className="mr-2" />
                      Filter by Availability
                    </h3>
                    <div className="space-y-2">
                      {filters.availability.map(time => (
                        <div key={time} className="flex items-center">
                          <input
                            id={`availability-${time}`}
                            type="checkbox"
                            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                            checked={selectedFilters.availability.includes(time)}
                            onChange={() => toggleFilter('availability', time)}
                          />
                          <label htmlFor={`availability-${time}`} className="ml-2 text-sm text-gray-700">
                            {time}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Content based on view mode */}
            <div className="bg-gray-50 p-4 rounded-lg">
              {viewMode === 'list' && renderVolunteerList()}
              {viewMode === 'leaderboard' && renderLeaderboard()}
              {viewMode === 'analytics' && renderAnalytics()}
            </div>
          </div>
        </main>
      </div>
      
      {/* Modal rendered conditionally - Moved outside and fixed */}
      {showModal && renderVolunteerModal()}
    </div>
  );
};

export default AdminVolunteers;
