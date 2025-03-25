import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '@/lib/authContext';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-day-picker';

// Mock data - replace with actual data fetching
const mockNotifications = [
  { id: 1, title: 'Volunteer Meeting', message: 'Upcoming volunteer meeting next week', sent_at: '2025-03-20T10:30:00Z', volunteer_id: 'vol1' },
  { id: 2, title: 'Training Update', message: 'New training modules available', sent_at: '2025-03-22T14:45:00Z', volunteer_id: 'vol2' },
  { id: 3, title: 'Appreciation Note', message: 'Thank you for your hard work', sent_at: '2025-03-25T09:15:00Z', volunteer_id: 'vol3' }
];

// Mock volunteers - replace with actual data fetching
const mockVolunteers = [
  { id: 'vol1', name: 'John Doe' },
  { id: 'vol2', name: 'Jane Smith' },
  { id: 'vol3', name: 'Mike Johnson' }
];

const AdminNotificationHistory = () => {
  const [selectedVolunteer, setSelectedVolunteer] = useState('all');
  const [searchText, setSearchText] = useState('');

  // Filter notifications based on selected volunteer and search text
  const filteredNotifications = mockNotifications
    .filter(noti => selectedVolunteer === 'all' || noti.volunteer_id === selectedVolunteer)
    .filter(noti => 
      noti.title.toLowerCase().includes(searchText.toLowerCase()) || 
      noti.message.toLowerCase().includes(searchText.toLowerCase())
    );

  const { adminUser, logout } = useAuth();
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Fixed logout handler
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
    <AdminHeader user={auth.user} handleLogout={handleLogout} title="Notification History" />

    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto p-4">
      <Card className="w-full">
        <CardHeader className='flex justify-between'>
          <CardTitle>Notification History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <div className="w-full max-w-xs">
              <Select 
                value={selectedVolunteer}
                onValueChange={setSelectedVolunteer}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Volunteer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Volunteers</SelectItem>
                  {mockVolunteers.map(volunteer => (
                    <SelectItem key={volunteer.id} value={volunteer.id}>
                      {volunteer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-grow">
              <Input 
                type="text" 
                placeholder="Search by title or message" 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead>Volunteer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.map(notification => (
                <TableRow key={notification.id}>
                  <TableCell>{notification.title}</TableCell>
                  <TableCell>{notification.message}</TableCell>
                  <TableCell>
                    {new Date(notification.sent_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {mockVolunteers.find(v => v.id === notification.volunteer_id)?.name || 'Unknown'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredNotifications.length === 0 && (
            <div className="text-center text-gray-500 mt-4">
              No notifications found
            </div>
          )}
        </CardContent>
      </Card>
      </main>
    </div>
  </div>
  );
};

export default AdminNotificationHistory;