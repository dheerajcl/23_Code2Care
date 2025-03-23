import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, PieChart, Pie, Cell, ResponsiveContainer 
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { getReportData, ReportData } from '@/services/database.service';
import { useAuth } from "@/lib/authContext";
import { CSVLink } from "react-csv";

// UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const AdminReports = () => {
  const { user, logout } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const { data, error } = await getReportData();
        if (error) throw error;
        
        setReportData(data);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, []);
  
  const handleGeneratePDF = () => {
    if (!reportData) return;
    
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Volunteer Management System - Reports', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    // Top Events
    doc.setFontSize(14);
    doc.text('Top Events by Participation', 14, 45);
    const topEventsData = reportData.topEvents.map(event => [event.title, event.participant_count.toString()]);
    
    autoTable(doc, {
      startY: 50,
      head: [['Event Name', 'Number of Participants']],
      body: topEventsData
    });
    
    // Most Frequent Volunteers
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.text('Most Frequent Volunteers', 14, finalY + 10);
    const frequentVolunteersData = reportData.frequentVolunteers.map(vol => [vol.volunteer_name, vol.event_count.toString()]);
    
    autoTable(doc, {
      startY: finalY + 15,
      head: [['Volunteer Name', 'Number of Events']],
      body: frequentVolunteersData
    });
    
    // Volunteer Retention
    doc.text(`Volunteer Retention Rate: ${reportData.retentionRate}%`, 14, (doc as any).lastAutoTable.finalY + 10);
    
    // Add more sections as needed
    
    doc.save('volunteer-system-reports.pdf');
  };
  
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
              <p className="mt-4">Loading reports data...</p>
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
            <h1 className="text-3xl font-bold">Advanced Insights & Reports</h1>
            <Button onClick={handleGeneratePDF}>Generate PDF Report</Button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Events */}
            <Card>
              <CardHeader>
                <CardTitle>Top Events by Participation</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {reportData?.topEvents && reportData.topEvents.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData.topEvents.slice(0, 5)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" angle={-45} textAnchor="end" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="participant_count" name="Participants" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-4">No event data available</p>
                )}
              </CardContent>
            </Card>
            
            {/* Frequent Volunteers */}
            <Card>
              <CardHeader>
                <CardTitle>Most Frequent Volunteers</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {reportData?.frequentVolunteers && reportData.frequentVolunteers.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData.frequentVolunteers.slice(0, 5)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="volunteer_name" angle={-45} textAnchor="end" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="event_count" name="Events Attended" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-4">No volunteer data available</p>
                )}
              </CardContent>
            </Card>
            
            {/* Retention Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Retention Rate</CardTitle>
                <CardDescription>
                  Percentage of volunteers who participated in more than one event
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-40">
                <div className="text-5xl font-bold text-primary">
                  {reportData?.retentionRate}%
                </div>
              </CardContent>
            </Card>
            
            {/* Event Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Event Task Completion</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {reportData?.eventTasks && reportData.eventTasks.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData.eventTasks.slice(0, 5)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="event_name" angle={-45} textAnchor="end" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed_tasks" name="Completed" stackId="a" fill="#4ade80" />
                      <Bar dataKey="pending_tasks" name="Pending" stackId="a" fill="#facc15" />
                      <Bar dataKey="overdue_tasks" name="Overdue" stackId="a" fill="#f87171" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-4">No task data available</p>
                )}
              </CardContent>
            </Card>
            
            {/* Location Data */}
            <Card>
              <CardHeader>
                <CardTitle>Location-based Analytics</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {reportData?.locationData && reportData.locationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData.locationData.slice(0, 5)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="location" angle={-45} textAnchor="end" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="volunteer_count" name="Volunteers" fill="#8884d8" />
                      <Bar dataKey="event_count" name="Events" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-4">No location data available</p>
                )}
              </CardContent>
            </Card>
            
            {/* Skill Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Skill Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {reportData?.skillData && reportData.skillData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.skillData.slice(0, 5)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="available"
                        nameKey="skill"
                      >
                        {reportData.skillData.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-4">No skill data available</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Volunteer Engagement */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Top Volunteer Engagement Scores</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData?.volunteerEngagement && reportData.volunteerEngagement.length > 0 ? (
                <div className="space-y-4">
                  {reportData.volunteerEngagement.slice(0, 5).map((volunteer, index) => (
                    <div key={index} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-semibold">{volunteer.volunteer_name}</h4>
                          <div className="text-sm text-gray-500">
                            Events: {volunteer.event_frequency}, Variety: {volunteer.event_variety}
                            {volunteer.timely_completion_percentage !== null ? 
                              `, Task Completion: ${volunteer.timely_completion_percentage.toFixed(0)}%` : 
                              ', No tasks assigned'}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-lg font-bold">
                          Score: {volunteer.engagement_score}/75
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No engagement data available</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Download Reports</CardTitle>
            </CardHeader>
            <CardFooter className="flex gap-4">
              <Button onClick={handleGeneratePDF}>Download PDF</Button>
              {reportData && (
                <CSVLink 
                  data={[
                    ["Top Events by Participation"],
                    ["Event", "Participants"],
                    ...reportData.topEvents.map(e => [e.title, e.participant_count]),
                    [],
                    ["Most Frequent Volunteers"],
                    ["Volunteer", "Events Participated"],
                    ...reportData.frequentVolunteers.map(v => [v.volunteer_name, v.event_count]),
                    [],
                    ["Volunteer Retention Rate", `${reportData.retentionRate}%`]
                  ]}
                  filename="volunteer_reports.csv"
                  className="no-underline"
                >
                  <Button variant="outline">Download CSV</Button>
                </CSVLink>
              )}
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminReports;
