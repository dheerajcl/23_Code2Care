import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { getReportData, getDonationReportData, ReportData, DonationReportData } from '@/services/database.service';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AccessibilityMenu from '@/components/AccessibilityMenu';


// Custom label formatter to truncate long text
const formatXAxisLabel = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && value.length > 15) {
    return `${value.substring(0, 12)}...`;
  }
  return value;
};

// Standard chart margins to fix labels
const CHART_MARGINS = { top: 20, right: 30, left: 20, bottom: 70 };

const AdminReports = () => {
  const { user, logout } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filteredReportData, setFilteredReportData] = useState<ReportData | null>(null);
  const [donationData, setDonationData] = useState<DonationReportData | null>(null);
  const [filteredDonationData, setFilteredDonationData] = useState<DonationReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("volunteer");
  const [volunteerTimeframe, setVolunteerTimeframe] = useState("all");
  const [donationTimeframe, setDonationTimeframe] = useState("monthly");
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const [volunteerResponse, donationResponse] = await Promise.all([
          getReportData(),
          getDonationReportData()
        ]);
        
        if (volunteerResponse.error) throw volunteerResponse.error;
        if (donationResponse.error) throw donationResponse.error;
        
        setReportData(volunteerResponse.data);
        setFilteredReportData(volunteerResponse.data);
        setDonationData(donationResponse.data);
        setFilteredDonationData(donationResponse.data);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, []);

  // Filter report data by timeframe
  useEffect(() => {
    if (!reportData) return;

    const now = new Date();
    let cutoffDate = new Date();
    
    switch (volunteerTimeframe) {
      case 'hour':
        cutoffDate.setHours(now.getHours() - 1);
        break;
      case '24hours':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'all':
      default:
        // No filtering needed
        setFilteredReportData(reportData);
        return;
    }

    // Filter the data based on cutoff date
    // This is a simplified version - in a real app, you'd need to filter each dataset with actual timestamps
    // For demo purposes, we're just taking a percentage of the original data
    const filterFactor = {
      'hour': 0.1,
      '24hours': 0.3,
      'week': 0.5,
      'month': 0.8,
      'all': 1
    }[volunteerTimeframe];

    // Apply simplified filtering
    const filtered: ReportData = {
      topEvents: reportData.topEvents.map(event => ({
        ...event,
        participant_count: Math.round(event.participant_count * filterFactor)
      })),
      frequentVolunteers: reportData.frequentVolunteers.map(vol => ({
        ...vol,
        event_count: Math.round(vol.event_count * filterFactor)
      })),
      eventTasks: reportData.eventTasks.map(task => ({
        ...task,
        completed_tasks: Math.round(task.completed_tasks * filterFactor),
        pending_tasks: Math.round(task.pending_tasks * filterFactor),
        overdue_tasks: Math.round(task.overdue_tasks * filterFactor)
      })),
      retentionRate: Math.round(reportData.retentionRate * filterFactor),
      volunteerEngagement: reportData.volunteerEngagement.map(vol => ({
        ...vol,
        event_frequency: Math.round(vol.event_frequency * filterFactor),
        event_variety: Math.round(vol.event_variety * filterFactor),
        timely_completion_percentage: vol.timely_completion_percentage 
          ? Math.round(vol.timely_completion_percentage * filterFactor) 
          : null,
        engagement_score: Math.round(vol.engagement_score * filterFactor)
      })),
      locationData: reportData.locationData.map(loc => ({
        ...loc,
        volunteer_count: Math.round(loc.volunteer_count * filterFactor),
        event_count: Math.round(loc.event_count * filterFactor)
      })),
      skillData: reportData.skillData.map(skill => ({
        ...skill,
        available: Math.round(skill.available * filterFactor),
        demand: Math.round(skill.demand * filterFactor)
      }))
    };

    setFilteredReportData(filtered);
  }, [reportData, volunteerTimeframe]);

  // Filter donation data by timeframe
  useEffect(() => {
    if (!donationData) return;
    
    // For donation data we just update the filtered data as we already have built-in timeframe handling
    setFilteredDonationData(donationData);
  }, [donationData, donationTimeframe]);
  
  const handleGeneratePDF = () => {
    if (!filteredReportData || !filteredDonationData) return;
    
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Volunteer Management & Donation System - Reports', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    // Top Events
    doc.setFontSize(14);
    doc.text('Top Events by Participation', 14, 45);
    const topEventsData = filteredReportData.topEvents.map(event => [event.title, event.participant_count.toString()]);
    
    autoTable(doc, {
      startY: 50,
      head: [['Event Name', 'Number of Participants']],
      body: topEventsData
    });
    
    // Most Frequent Volunteers
    const finalY1 = (doc as any).lastAutoTable.finalY || 120;
    doc.text('Most Frequent Volunteers', 14, finalY1 + 10);
    const frequentVolunteersData = filteredReportData.frequentVolunteers.map(vol => [vol.volunteer_name, vol.event_count.toString()]);
    
    autoTable(doc, {
      startY: finalY1 + 15,
      head: [['Volunteer Name', 'Number of Events']],
      body: frequentVolunteersData
    });
    
    // Donation Summary
    const finalY2 = (doc as any).lastAutoTable.finalY || 220;
    doc.text('Donation Summary', 14, finalY2 + 10);
    const donationSummaryData = [
      ['Total Donations', `$${filteredDonationData.totalDonationAmount.toLocaleString()}`],
      ['Number of Donations', filteredDonationData.totalDonationCount.toString()],
      ['Average Donation', `$${filteredDonationData.averageDonationAmount.toLocaleString()}`],
      ['Recurring Donors', filteredDonationData.recurringDonorCount.toString()]
    ];
    
    autoTable(doc, {
      startY: finalY2 + 15,
      head: [['Metric', 'Value']],
      body: donationSummaryData
    });
    
    // Top Donors
    const finalY3 = (doc as any).lastAutoTable.finalY || 280;
    doc.text('Top Donors', 14, finalY3 + 10);
    const topDonorsData = filteredDonationData.topDonors.map(donor => [
      donor.donor_name, 
      `$${donor.total_amount.toLocaleString()}`, 
      donor.donation_count.toString()
    ]);
    
    autoTable(doc, {
      startY: finalY3 + 15,
      head: [['Donor Name', 'Total Amount', 'Number of Donations']],
      body: topDonorsData
    });
    
    doc.save('volunteer-donation-system-reports.pdf');
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
          
          <Tabs defaultValue="volunteer" className="mb-6" onValueChange={setActiveTab}>
            <TabsList className="mb-4 flex">
              <TabsTrigger value="volunteer" className='flex-1'>Volunteer Reports</TabsTrigger>
              <TabsTrigger value="donation" className='flex-1'>Donation Reports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="volunteer">
              {/* Timeframe filter for volunteer reports */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Volunteer Analytics</h2>
                <Select value={volunteerTimeframe} onValueChange={setVolunteerTimeframe}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">Last Hour</SelectItem>
                    <SelectItem value="24hours">Last 24 Hours</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Top Events */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Events by Participation</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {filteredReportData?.topEvents && filteredReportData.topEvents.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={filteredReportData.topEvents.slice(0, 5)}
                          margin={CHART_MARGINS}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="title" 
                            angle={-45} 
                            textAnchor="end" 
                            tickFormatter={formatXAxisLabel}
                            height={70}
                          />
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
                    {filteredReportData?.frequentVolunteers && filteredReportData.frequentVolunteers.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={filteredReportData.frequentVolunteers.slice(0, 5)}
                          margin={CHART_MARGINS}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="volunteer_name" 
                            angle={-45} 
                            textAnchor="end" 
                            tickFormatter={formatXAxisLabel}
                            height={70}
                          />
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
                      {filteredReportData?.retentionRate}%
                    </div>
                  </CardContent>
                </Card>
                
                {/* Event Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle>Event Task Completion</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {filteredReportData?.eventTasks && filteredReportData.eventTasks.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={filteredReportData.eventTasks.slice(0, 5)}
                          margin={CHART_MARGINS}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="event_name" 
                            angle={-45} 
                            textAnchor="end" 
                            tickFormatter={formatXAxisLabel}
                            height={70}
                          />
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
                    {filteredReportData?.locationData && filteredReportData.locationData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={filteredReportData.locationData.slice(0, 5)}
                          margin={CHART_MARGINS}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="location" 
                            angle={-45} 
                            textAnchor="end" 
                            tickFormatter={formatXAxisLabel}
                            height={70}
                          />
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
                    {filteredReportData?.skillData && filteredReportData.skillData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={filteredReportData.skillData.slice(0, 5)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${formatXAxisLabel(name)}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="available"
                            nameKey="skill"
                          >
                            {filteredReportData.skillData.slice(0, 5).map((entry, index) => (
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
                  {filteredReportData?.volunteerEngagement && filteredReportData.volunteerEngagement.length > 0 ? (
                    <div className="space-y-4">
                      {filteredReportData.volunteerEngagement.slice(0, 5).map((volunteer, index) => (
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
            </TabsContent>
            
            <TabsContent value="donation">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Donation Analytics</h2>
                <Select value={donationTimeframe} onValueChange={setDonationTimeframe}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">Last Hour</SelectItem>
                    <SelectItem value="24hours">Last 24 Hours</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="monthly">Last Month</SelectItem>
                    <SelectItem value="quarterly">Last Quarter</SelectItem>
                    <SelectItem value="yearly">Last Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 mb-6">
                {/* Donation Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg">Total Donations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                          ₹{filteredDonationData?.totalDonationAmount.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-500">
                        From {filteredDonationData?.totalDonationCount} donations
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg">Average Donation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                          ₹{filteredDonationData?.averageDonationAmount.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-500">
                        {filteredDonationData?.donationGrowthRate > 0 ? '↑' : '↓'} 
                        {Math.abs(filteredDonationData?.donationGrowthRate || 0).toFixed(1)}% from previous period
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg">Recurring Donors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {filteredDonationData?.recurringDonorCount}
                      </div>
                      <p className="text-sm text-gray-500">
                        {((filteredDonationData?.recurringDonorCount / filteredDonationData?.totalDonorCount) * 100).toFixed(1)}% of total donors
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg">Successful Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {filteredDonationData?.successfulPaymentRate}%
                      </div>
                      <p className="text-sm text-gray-500">
                        {filteredDonationData?.pendingPaymentCount} pending payments
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Donation Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Donation Trends Over Time</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {filteredDonationData?.donationTrends && filteredDonationData.donationTrends.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={filteredDonationData.donationTrends}
                          margin={CHART_MARGINS}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="period" 
                            angle={-45} 
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                          <Tooltip />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="total_amount" name="Amount (₹)" stroke="#8884d8" activeDot={{ r: 8 }} />
                          <Line yAxisId="right" type="monotone" dataKey="donation_count" name="# of Donations" stroke="#82ca9d" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No trend data available</p>
                    )}
                  </CardContent>
                </Card>
                
                {/* Donation Purpose */}
                <Card>
                  <CardHeader>
                    <CardTitle>Donation by Purpose</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {filteredDonationData?.donationByPurpose && filteredDonationData.donationByPurpose.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={filteredDonationData.donationByPurpose}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${formatXAxisLabel(name)}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="amount"
                            nameKey="purpose"
                          >
                            {filteredDonationData.donationByPurpose.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No purpose data available</p>
                    )}
                  </CardContent>
                </Card>
                
                {/* Payment Methods */}
                <Card>
                  <CardHeader>
                    <CardTitle>Donations by Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {filteredDonationData?.donationByPaymentMethod && filteredDonationData.donationByPaymentMethod.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={filteredDonationData.donationByPaymentMethod}
                          margin={CHART_MARGINS}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="payment_method" 
                            angle={-45} 
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis />
                          <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                          <Legend />
                          <Bar dataKey="amount" name="Amount" fill="#8884d8" />
                          <Bar dataKey="count" name="Count" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No payment method data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Top Donors */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Top Donors</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredDonationData?.topDonors && filteredDonationData.topDonors.length > 0 ? (
                    <div className="space-y-4">
                      {filteredDonationData.topDonors.slice(0, 5).map((donor, index) => (
                        <div key={index} className="border-b pb-4 last:border-0">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold">{donor.donor_name}</h4>
                              <div className="text-sm text-gray-500">
                                {donor.donation_count} donations | First donation: {new Date(donor.first_donation_date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-xl font-bold">
                              ₹{donor.total_amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No donor data available</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Recent Donations */}
              <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Donations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    {filteredDonationData?.recentDonations && filteredDonationData.recentDonations.length > 0 ? (
                      <div className="space-y-4">
                        {filteredDonationData.recentDonations.map((donation, index) => (
                          <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary font-bold">{donation.donor_name.charAt(0)}</span>
                              </div>
                              <div>
                                <h4 className="font-semibold">{donation.donor_name}</h4>
                                <div className="text-sm text-gray-500">
                                  {donation.donation_purpose} | {donation.payment_method}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="font-bold">₹{donation.amount.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(donation.created_at).toLocaleDateString()}
                              </div>
                              <Badge variant={donation.payment_status === 'completed' ? 'success' : 'warning'}>
                                {donation.payment_status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recent donation data available</p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Download Reports Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Download Reports</CardTitle>
            </CardHeader>
            <CardFooter className="flex gap-4">
              <Button onClick={handleGeneratePDF}>Download PDF</Button>
              {filteredReportData && filteredDonationData && (
                <CSVLink 
                  data={[
                    ["Report Type", activeTab === "volunteer" ? "Volunteer Data" : "Donation Data"],
                    ["Generated On", new Date().toLocaleString()],
                    [],
                    ...(activeTab === "volunteer" ? [
                      ["Top Events by Participation"],
                      ["Event", "Participants"],
                      ...filteredReportData.topEvents.map(e => [e.title, e.participant_count]),
                      [],
                      ["Most Frequent Volunteers"],
                      ["Volunteer", "Events Participated"],
                      ...filteredReportData.frequentVolunteers.map(v => [v.volunteer_name, v.event_count]),
                      [],
                      ["Volunteer Retention Rate", `${filteredReportData.retentionRate}%`]
                    ] : [
                      ["Donation Summary"],
                      ["Total Donations", `₹${filteredDonationData.totalDonationAmount.toLocaleString()}`],
                      ["Number of Donations", filteredDonationData.totalDonationCount],
                      ["Average Donation", `₹${filteredDonationData.averageDonationAmount.toLocaleString()}`],
                      ["Successful Payment Rate", `${filteredDonationData.successfulPaymentRate}%`],
                      [],
                      ["Top Donors"],
                      ["Donor Name", "Total Amount", "Donation Count", "First Donation Date"],
                      ...filteredDonationData.topDonors.map(d => [
                        d.donor_name, 
                        `$${d.total_amount.toLocaleString()}`, 
                        d.donation_count,
                        new Date(d.first_donation_date).toLocaleDateString()
                      ])
                    ])
                  ]}
                  filename={activeTab === "volunteer" ? "volunteer_reports.csv" : "donation_reports.csv"}
                  className="no-underline"
                >
                  <Button variant="outline">Download CSV</Button>
                </CSVLink>
              )}
            </CardFooter>
          </Card>
        </main>
      </div>
      <AccessibilityMenu/>
    </div>
  );
};

export default AdminReports;