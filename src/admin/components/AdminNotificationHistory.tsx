import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '@/lib/authContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const AdminNotificationHistory = () => {
  const [notifications, setNotifications] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState('all');
  const [searchText, setSearchText] = useState('');
  const { adminUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('internal_noti')
        .select('*')
        .order('sent_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data || []);
      }
    };

    const fetchVolunteers = async () => {
      const { data: notificationData, error: notificationError } = await supabase
        .from('internal_noti')
        .select('volunteer_id');

      if (notificationError) {
        console.error('Error fetching notification volunteer IDs:', notificationError);
        return;
      }

      const volunteerIds = notificationData.map(noti => noti.volunteer_id);

      const { data, error } = await supabase
        .from('volunteer')
        .select('id, first_name, last_name')
        .in('id', volunteerIds); // Fetch only volunteers in the notification list

      if (error) {
        console.error('Error fetching volunteers:', error);
      } else {
        setVolunteers(data || []);
      }
    };

    fetchNotifications();
    fetchVolunteers();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  // Filter notifications based on selected volunteer and search text
  const filteredNotifications = notifications
    .filter(noti => selectedVolunteer === 'all' || noti.volunteer_id === selectedVolunteer)
    .filter(noti =>
      noti.title_noti.toLowerCase().includes(searchText.toLowerCase()) ||
      noti.message.toLowerCase().includes(searchText.toLowerCase())
    );

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <AdminHeader user={adminUser} handleLogout={handleLogout} title="Notification History" />

      <div className="flex h-screen bg-gray-100 overflow-hidden">
        <AdminSidebar />

        <main className="flex-1 overflow-y-auto p-4">
          <Card className="w-full">
            <CardHeader className="flex justify-between">
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
                      {volunteers.map(volunteer => (
                        <SelectItem key={volunteer.id} value={volunteer.id}>
                          {`${volunteer.first_name} ${volunteer.last_name}`}
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
                      <TableCell>{notification.title_noti}</TableCell>
                      <TableCell>{notification.message}</TableCell>
                      <TableCell>
                        {new Date(notification.sent_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {volunteers.find(v => v.id === notification.volunteer_id)
                          ? `${volunteers.find(v => v.id === notification.volunteer_id).first_name} ${volunteers.find(v => v.id === notification.volunteer_id).last_name}`
                          : 'Unknown'}
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