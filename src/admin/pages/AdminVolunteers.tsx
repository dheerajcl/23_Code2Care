import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Award, Calendar, MapPin, 
  Code, Activity, ChevronDown, ChevronUp, User, UserCheck, Clock
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { useAuth } from '@/lib/authContext';

const AdminVolunteers = () => {
  // State for volunteers data
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  
  // State for UI controls
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'leaderboard', 'analytics'
  
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

  // Fetch volunteers data
  useEffect(() => {
    // This would be replaced with an actual API call
    const fetchVolunteers = async () => {
      // Mocked data for demonstration
      const mockVolunteers = [
        {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          contact: '(555) 123-4567',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          skills: ['Teaching', 'Event Management'],
          domain: 'Education',
          availability: 'Weekends',
          previousVolunteerExperience: 'Worked with local food banks and shelters',
          howDidYouHear: 'Social Media',
          hours: 10,
          events: 5,
          rating: 4.5
        },
        {
          id: 2,
          firstname: 'Jane',
          lastname: 'Smith',
          email: 'jane.smith@example.com',
          contact: '(555) 987-6543',
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          skills: ['Technology', 'Design'],
          domain: 'Technology',
          availability: 'Weekdays',
          previousVolunteerExperience: 'Assisted in coding bootcamps for underprivileged students',
          howDidYouHear: 'Friend Recommendation',
          hours: 15,
          events: 7,
          rating: 4.8
        },
        {
          id: 3,
          firstname: 'Alex',
          lastname: 'Johnson',
          email: 'alex.j@example.com',
          contact: '(555) 456-7890',
          address: '789 Pine Blvd',
          city: 'Chicago',
          state: 'IL',
          skills: ['Administration', 'Counseling'],
          domain: 'Career Development',
          availability: 'Both',
          previousVolunteerExperience: 'Guided students on career counseling sessions',
          howDidYouHear: 'Community Event',
          hours: 8,
          events: 4,
          rating: 4.2
        },
        {
          id: 4,
          firstname: 'Maria',
          lastname: 'Garcia',
          email: 'maria.g@example.com',
          contact: '(555) 234-5678',
          address: '101 Maple St',
          city: 'Houston',
          state: 'TX',
          skills: ['Language Translation', 'Writing'],
          domain: 'Arts & Culture',
          availability: 'Weekdays',
          previousVolunteerExperience: 'Translated documents for refugees and immigrants',
          howDidYouHear: 'Website Search',
          hours: 20,
          events: 9,
          rating: 4.9
        },
        {
          id: 5,
          firstname: 'Sam',
          lastname: 'Wilson',
          email: 'sam.w@example.com',
          contact: '(555) 876-5432',
          address: '567 Cedar Rd',
          city: 'San Francisco',
          state: 'CA',
          skills: ['Event Management', 'Community Outreach'],
          domain: 'Fundraising',
          availability: 'Weekends',
          previousVolunteerExperience: 'Organized fundraising events for local charities',
          howDidYouHear: 'Volunteer Fair',
          hours: 12,
          events: 6,
          rating: 4.6
        }
      ];

      // Extract unique filter options
      const skills = [...new Set(mockVolunteers.flatMap(v => v.skills))];
      const domains = [...new Set(mockVolunteers.map(v => v.domain))];
      const availabilityOptions = [...new Set(mockVolunteers.map(v => v.availability))];

      setFilters({
        skills,
        domain: domains,
        availability: availabilityOptions
      });
      
      setVolunteers(mockVolunteers);
      setFilteredVolunteers(mockVolunteers);
    };

    fetchVolunteers();
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
        selectedFilters.skills.some(skill => volunteer.skills.includes(skill))
      );
    }
    
    // Apply domain filters
    if (selectedFilters.domain.length > 0) {
      result = result.filter(volunteer => 
        selectedFilters.domain.includes(volunteer.domain)
      );
    }
    
    // Apply availability filters - Fixed to correctly match availability
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

  // Render volunteer list view
  const renderVolunteerList = () => (
    <div className="overflow-x-auto">
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
                </td>
                <td className="py-2 px-4 border-b">
                  <div className="flex flex-wrap gap-1">
                    {volunteer.skills.map(skill => (
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
                  {/* Fixed to handle availability as a string */}
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {volunteer.availability}
                  </span>
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <button className="text-blue-600 hover:text-blue-800 mr-2">
                    View
                  </button>
                  <button className="text-blue-600 hover:text-blue-800">
                    Edit
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
    </div>
  );

  // Render leaderboard view
  const renderLeaderboard = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium">Volunteer Leaderboard</h3>
        <p className="text-sm text-gray-500">Top volunteers by hours contributed</p>
      </div>
      <div className="p-4">
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
                  </div>
                </div>
                <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                  <Award size={16} className="mr-1 text-yellow-600" />
                  <span className="text-yellow-800">{volunteer.rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  // Render analytics view
  const renderAnalytics = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium">Volunteer Analytics</h3>
        <p className="text-sm text-gray-500">Overview of volunteer participation</p>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-800 text-sm font-medium">Average Rating</p>
              <h4 className="text-2xl font-bold mt-2">
                {(volunteers.reduce((sum, v) => sum + v.rating, 0) / volunteers.length).toFixed(1)}
              </h4>
            </div>
            <span className="bg-purple-100 p-2 rounded-full">
              <Award size={24} className="text-purple-800" />
            </span>
          </div>
          <div className="mt-4 text-sm text-purple-600">
            <span className="font-medium">+0.2</span> from last month
          </div>
        </div>
        
        <div className="md:col-span-3 mt-4">
          <h4 className="font-medium mb-2">Skill Distribution</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filters.skills.map(skill => {
              // Fixed skill distribution calculation
              const count = volunteers.filter(v => v.skills.includes(skill)).length;
              const percentage = Math.round((count / volunteers.length) * 100);
              
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
              
              <button className="bg-red-800 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-700">
                Add Volunteer
              </button>
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
    </div>
  );
}

export default AdminVolunteers;