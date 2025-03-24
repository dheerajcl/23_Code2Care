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

const AdminReports = () => {
  const { user, logout } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [donationData, setDonationData] = useState<DonationReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("volunteer");
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
        setDonationData(donationResponse.data);
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
    if (!reportData || !donationData) return;
    
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Volunteer Management & Donation System - Reports', 14, 22);
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
    const finalY1 = (doc as any).lastAutoTable.finalY || 120;
    doc.text('Most Frequent Volunteers', 14, finalY1 + 10);
    const frequentVolunteersData = reportData.frequentVolunteers.map(vol => [vol.volunteer_name, vol.event_count.toString()]);
    
    autoTable(doc, {
      startY: finalY1 + 15,
      head: [['Volunteer Name', 'Number of Events']],
      body: frequentVolunteersData
    });
    
    // Donation Summary
    const finalY2 = (doc as any).lastAutoTable.finalY || 220;
    doc.text('Donation Summary', 14, finalY2 + 10);
    const donationSummaryData = [
      ['Total Donations', `$${donationData.totalDonationAmount.toLocaleString()}`],
      ['Number of Donations', donationData.totalDonationCount.toString()],
      ['Average Donation', `$${donationData.averageDonationAmount.toLocaleString()}`],
      ['Recurring Donors', donationData.recurringDonorCount.toString()]
    ];
    
    autoTable(doc, {
      startY: finalY2 + 15,
      head: [['Metric', 'Value']],
      body: donationSummaryData
    });
    
    // Top Donors
    const finalY3 = (doc as any).lastAutoTable.finalY || 280;
    doc.text('Top Donors', 14, finalY3 + 10);
    const topDonorsData = donationData.topDonors.map(donor => [
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
            <TabsList>
              <TabsTrigger value="volunteer">Volunteer Reports</TabsTrigger>
              <TabsTrigger value="donation">Donation Reports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="volunteer">
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
            </TabsContent>
            
            <TabsContent value="donation">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Donation Analytics</h2>
                <Select value={donationTimeframe} onValueChange={setDonationTimeframe}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Select Timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
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
                          ₹{donationData?.totalDonationAmount.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-500">
                        From {donationData?.totalDonationCount} donations
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg">Average Donation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                          ₹{donationData?.averageDonationAmount.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-500">
                        {donationData?.donationGrowthRate > 0 ? '↑' : '↓'} 
                        {Math.abs(donationData?.donationGrowthRate || 0).toFixed(1)}% from previous period
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg">Recurring Donors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {donationData?.recurringDonorCount}
                      </div>
                      <p className="text-sm text-gray-500">
                        {((donationData?.recurringDonorCount / donationData?.totalDonorCount) * 100).toFixed(1)}% of total donors
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg">Successful Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {donationData?.successfulPaymentRate}%
                      </div>
                      <p className="text-sm text-gray-500">
                        {donationData?.pendingPaymentCount} pending payments
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
                    {donationData?.donationTrends && donationData.donationTrends.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={donationData.donationTrends}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                          <Tooltip />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="total_amount" name="Amount ($)" stroke="#8884d8" activeDot={{ r: 8 }} />
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
                    {donationData?.donationByPurpose && donationData.donationByPurpose.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donationData.donationByPurpose}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="amount"
                            nameKey="purpose"
                          >
                            {donationData.donationByPurpose.map((entry, index) => (
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
                    {donationData?.donationByPaymentMethod && donationData.donationByPaymentMethod.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={donationData.donationByPaymentMethod}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="payment_method" />
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
                  {donationData?.topDonors && donationData.topDonors.length > 0 ? (
                    <div className="space-y-4">
                      {donationData.topDonors.slice(0, 5).map((donor, index) => (
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
                    {donationData?.recentDonations && donationData.recentDonations.length > 0 ? (
                      <div className="space-y-4">
                        {donationData.recentDonations.map((donation, index) => (
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
              {reportData && donationData && (
                <CSVLink 
                  data={[
                    ["Report Type", activeTab === "volunteer" ? "Volunteer Data" : "Donation Data"],
                    ["Generated On", new Date().toLocaleString()],
                    [],
                    ...(activeTab === "volunteer" ? [
                      ["Top Events by Participation"],
                      ["Event", "Participants"],
                      ...reportData.topEvents.map(e => [e.title, e.participant_count]),
                      [],
                      ["Most Frequent Volunteers"],
                      ["Volunteer", "Events Participated"],
                      ...reportData.frequentVolunteers.map(v => [v.volunteer_name, v.event_count]),
                      [],
                      ["Volunteer Retention Rate", `${reportData.retentionRate}%`]
                    ] : [
                      ["Donation Summary"],
                      ["Total Donations", `₹${donationData.totalDonationAmount.toLocaleString()}`],
                      ["Number of Donations", donationData.totalDonationCount],
                      ["Average Donation", `₹${donationData.averageDonationAmount.toLocaleString()}`],
                      ["Successful Payment Rate", `${donationData.successfulPaymentRate}%`],
                      [],
                      ["Top Donors"],
                      ["Donor Name", "Total Amount", "Donation Count", "First Donation Date"],
                      ...donationData.topDonors.map(d => [
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
    </div>
  );
};

export default AdminReports;