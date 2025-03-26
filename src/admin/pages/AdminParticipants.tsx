import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getParticipants, ParticipantWithEvent } from '@/services/database.service';
import { useAuth } from '@/lib/authContext';
import { format } from 'date-fns';

// UI Components
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Download, Search, UserCircle } from 'lucide-react';
import { CSVLink } from 'react-csv';
import AccessibilityMenu from '@/components/AccessibilityMenu';

const AdminParticipants = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<ParticipantWithEvent[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<ParticipantWithEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch participants data
  useEffect(() => {
    const fetchParticipants = async () => {
      setLoading(true);
      try {
        const { data, error } = await getParticipants();
        
        if (error) throw error;
        if (!data) throw new Error('No participant data received');
        
        setParticipants(data);
        setFilteredParticipants(data);
      } catch (err) {
        console.error('Error fetching participants:', err);
        setError('Failed to load participants. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchParticipants();
  }, []);

  // Apply filtering and sorting
  useEffect(() => {
    let result = [...participants];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(participant => 
        participant.event?.category === categoryFilter
      );
    }
    
    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(participant =>
        participant.participant_name.toLowerCase().includes(searchLower) ||
        participant.participant_email.toLowerCase().includes(searchLower) ||
        participant.participant_phone.toLowerCase().includes(searchLower) ||
        participant.event?.title.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'name_asc':
        result.sort((a, b) => a.participant_name.localeCompare(b.participant_name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.participant_name.localeCompare(a.participant_name));
        break;
      case 'event_asc':
        result.sort((a, b) => (a.event?.title || '').localeCompare(b.event?.title || ''));
        break;
      case 'event_desc':
        result.sort((a, b) => (b.event?.title || '').localeCompare(a.event?.title || ''));
        break;
    }
    
    setFilteredParticipants(result);
  }, [participants, searchTerm, categoryFilter, sortBy]);

  // Helper for formatting dates
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  // Get unique event categories for filter
  const uniqueCategories = Array.from(
    new Set(participants.map(p => p.event?.category).filter(Boolean) as string[])
  );

  // Prepare CSV data for export
  const csvData = [
    ['Name', 'Email', 'Phone', 'Address', 'Special Requirements', 'Event', 'Category', 'Event Date'],
    ...filteredParticipants.map(p => [
      p.participant_name,
      p.participant_email,
      p.participant_phone,
      p.participant_address,
      p.participant_special || 'None',
      p.event?.title || 'Unknown',
      p.event?.category || 'Unknown',
      formatDate(p.event?.start_date)
    ])
  ];

  // Render loading state
  if (loading) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        <AdminHeader user={user} handleLogout={logout} />
        <div className="flex flex-1 overflow-hidden">
          <AdminSidebar />
          <main className="flex-1 overflow-auto p-8">
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-4">Loading participants data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        <AdminHeader user={user} handleLogout={logout} />
        <div className="flex flex-1 overflow-hidden">
          <AdminSidebar />
          <main className="flex-1 overflow-auto p-8">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button variant="default" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <AdminHeader user={user} handleLogout={logout} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Participants</h1>
              <p className="text-muted-foreground">
                Manage event participants and registrations
              </p>
            </div>
            <CSVLink 
              data={csvData}
              filename={'participants.csv'}
              className="inline-flex items-center"
            >
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
              </Button>
            </CSVLink>
          </div>
          
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or event name..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="w-full md:w-48">
                  <label className="text-sm font-medium mb-1 block">Event Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {uniqueCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-48">
                  <label className="text-sm font-medium mb-1 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                      <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                      <SelectItem value="event_asc">Event (A-Z)</SelectItem>
                      <SelectItem value="event_desc">Event (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Participants Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Registered Participants
                <Badge variant="outline" className="ml-2">
                  {filteredParticipants.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Showing {filteredParticipants.length} of {participants.length} total participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredParticipants.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Event Date</TableHead>
                        <TableHead>Special Requirements</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredParticipants.map((participant) => (
                        <TableRow key={participant.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <UserCircle className="mr-2 h-5 w-5 text-primary" />
                              {participant.participant_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{participant.participant_email}</p>
                              <p className="text-muted-foreground">
                                {participant.participant_phone}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{participant.event?.title || 'Unknown event'}</div>
                              <Badge variant="outline" className="mt-1">
                                {participant.event?.category || 'No category'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(participant.event?.start_date)}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {participant.participant_special || 'None specified'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <UserCircle className="mx-auto h-10 w-10 mb-2" />
                  <p>No participants found matching your filters.</p>
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('all');
                      setSortBy('name_asc');
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      <AccessibilityMenu/>
    </div>
  );
};

export default AdminParticipants; 