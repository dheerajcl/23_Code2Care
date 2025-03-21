import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, MenuIcon, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Mock Data
const topEvents = [
  { name: 'Community Clean-Up', participants: 120 },
  { name: 'Health Camp', participants: 95 },
  { name: 'Education Workshop', participants: 80 },
];

const frequentVolunteers = [
  { name: 'Priya Sharma', events: 15 },
  { name: 'Arjun Mehta', events: 12 },
  { name: 'Kavita Reddy', events: 10 },
];

const retentionRate = 78; // percentage

const skillData = [
  { skill: 'Teaching', available: 40, demand: 50 },
  { skill: 'Technology', available: 35, demand: 60 },
  { skill: 'Event Coordination', available: 20, demand: 30 },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

const AdminReports: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Volunteer & Event Reports', 14, 20);

    // Top Events
    autoTable(doc, {
      startY: 30,
      head: [['Event', 'Participants']],
      body: topEvents.map(e => [e.name, e.participants]),
      theme: 'striped',
    });

    const firstTableY = doc.lastAutoTable.finalY;

    // Frequent Volunteers
    autoTable(doc, {
      startY: firstTableY + 10,
      head: [['Volunteer', 'Events Participated']],
      body: frequentVolunteers.map(v => [v.name, v.events]),
      theme: 'striped',
    });

    const secondTableY = doc.lastAutoTable.finalY;

    doc.setFontSize(14);
    doc.text(`Volunteer Retention Rate: ${retentionRate}%`, 14, secondTableY + 20);

    doc.save('Volunteer_Report.pdf');
  };

  const csvData = [
    ['Event', 'Participants'],
    ...topEvents.map(e => [e.name, e.participants]),
    [],
    ['Volunteer', 'Events Participated'],
    ...frequentVolunteers.map(v => [v.name, v.events]),
    [],
    ['Volunteer Retention Rate', `${retentionRate}%`],
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <header className="border-b">
        <div className="flex h-16 items-center px-4 sm:px-6">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 sm:max-w-none">
              <nav className="flex flex-col gap-6 mt-6">
                <a href="/admin/dashboard" className="flex items-center gap-2 font-semibold text-lg">
                  <Award className="h-5 w-5" />
                  <span>Admin Dashboard</span>
                </a>
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-medium uppercase text-muted-foreground">Navigation</div>
                  <Button variant="ghost" className="justify-start" onClick={() => { setIsMobileMenuOpen(false); navigate('/admin/dashboard'); }}>Dashboard</Button>
                  <Button variant="ghost" className="justify-start" onClick={() => { setIsMobileMenuOpen(false); navigate('/admin/volunteers'); }}>Volunteers</Button>
                  <Button variant="ghost" className="justify-start" onClick={() => { setIsMobileMenuOpen(false); navigate('/admin/events'); }}>Events</Button>
                  <Button variant="ghost" className="justify-start" onClick={() => setIsMobileMenuOpen(false)}>Reports</Button>
                  <Button variant="ghost" className="justify-start">Settings</Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 font-semibold text-lg md:ml-0 ml-2">
            <Award className="h-6 w-6 text-primary" />
            <span>Samarth Connect</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 font-normal">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt={user?.firstName} />
                    <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline-block">{user?.firstName} {user?.lastName}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-row">
        {/* Sidebar for Desktop */}
        <aside className="hidden border-r bg-muted/40 md:block w-64">
          <div className="flex flex-col gap-2 p-4 pt-6">
            <div className="flex flex-col gap-1 py-2">
              <div className="text-xs font-medium uppercase text-muted-foreground pl-4">Navigation</div>
              <Button variant="ghost" className="justify-start" onClick={() => navigate('/admin/dashboard')}>Dashboard</Button>
              <Button variant="ghost" className="justify-start" onClick={() => navigate('/admin/volunteers')}>Volunteers</Button>
              <Button variant="ghost" className="justify-start" onClick={() => navigate('/admin/events')}>Events</Button>
              <Button variant="ghost" className="justify-start">Reports</Button>
              <Button variant="ghost" className="justify-start">Settings</Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pt-6 overflow-y-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Advanced Insights & Reports</h1>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Top 3 Events by Participation</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topEvents}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="participants" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Most Frequent Volunteers</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={frequentVolunteers} dataKey="events" nameKey="name" outerRadius={100}>
                      {frequentVolunteers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Retention & Skills */}
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <Card>
              <CardHeader><CardTitle>Volunteer Retention Rate</CardTitle></CardHeader>
              <CardContent>
                <p className="text-2xl">{retentionRate}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Skill Gap Analysis</CardTitle></CardHeader>
              <CardContent>
                {skillData.map(skill => (
                  <div key={skill.skill} className="mb-2">
                    <p><strong>{skill.skill}</strong></p>
                    <p>Available: {skill.available} | Demand: {skill.demand}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Download Section */}
          <Card className="mt-6">
            <CardHeader><CardTitle>Download Reports</CardTitle></CardHeader>
            <CardFooter className="flex gap-4">
              <Button onClick={generatePDF}>Download PDF</Button>
              <CSVLink data={csvData}><Button variant="outline">Download CSV</Button></CSVLink>
            </CardFooter>
          </Card>
        </main>
      </div>

      <AccessibilityMenu />
    </div>
  );
};

export default AdminReports;
