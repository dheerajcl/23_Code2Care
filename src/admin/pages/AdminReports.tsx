import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";


// Mock Data
const topEvents = [
  { name: "Community Clean-Up", participants: 120 },
  { name: "Health Camp", participants: 95 },
  { name: "Education Workshop", participants: 80 },
];

const frequentVolunteers = [
  { name: "Priya Sharma", events: 15 },
  { name: "Arjun Mehta", events: 12 },
  { name: "Kavita Reddy", events: 10 },
];

const retentionRate = 78; // percentage

const skillData = [
  { skill: "Teaching", available: 40, demand: 50 },
  { skill: "Technology", available: 35, demand: 60 },
  { skill: "Event Coordination", available: 20, demand: 30 },
  
];

const eventTasks = [
  { event: "Community Clean-Up", completed: 40, pending: 5, overdue: 2 },
  { event: "Health Camp", completed: 30, pending: 10, overdue: 1 },
  { event: "Education Workshop", completed: 25, pending: 3, overdue: 0 },
];

const volunteerEngagement = [
  { 
    name: "Priya Sharma", 
    frequency: 15,  // number of events participated
    variety: 4,     // different types of events participated
    timelyCompletion: 95, // percentage of timely task completion
    feedbackRating: 4.8,  // average feedback rating (out of 5)
  },
  { 
    name: "Arjun Mehta", 
    frequency: 12,  
    variety: 3,     
    timelyCompletion: 88, 
    feedbackRating: 4.5,  
  },
  { 
    name: "Kavita Reddy", 
    frequency: 10,  
    variety: 3,     
    timelyCompletion: 90, 
    feedbackRating: 4.2,  
  },
];

const locationData = [
  { location: "Bengaluru", volunteers: 45, events: 10 },
  { location: "Chennai", volunteers: 30, events: 8 },
  { location: "Hyderabad", volunteers: 25, events: 6 },
  { location: "Mumbai", volunteers: 20, events: 4 },
  { location: "Delhi", volunteers: 35, events: 7 },
];




const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

const AdminReports: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const calculateEngagementScore = (volunteer: any) => {
    const freqScore = Math.min(volunteer.frequency * 3, 30); // Max 30 points
    const varietyScore = Math.min(volunteer.variety * 10, 20); // Max 20 points
    const completionScore = (volunteer.timelyCompletion / 100) * 25; // Max 25 points
    const feedbackScore = (volunteer.feedbackRating / 5) * 25; // Max 25 points
  
    return Math.round(freqScore + varietyScore + completionScore + feedbackScore);
  };

  

  const generatePDF = () => {
    const doc = new jsPDF() as jsPDF & { lastAutoTable: { finalY: number } };
    doc.setFontSize(18);
    doc.text("Volunteer & Event Reports", 14, 20);

    // Top Events
    autoTable(doc, {
      startY: 30,
      head: [["Event", "Participants"]],
      body: topEvents.map((e) => [e.name, e.participants]),
      theme: "striped",
    });

    const firstTableY = doc.lastAutoTable.finalY;

    // Frequent Volunteers
    autoTable(doc, {
      startY: firstTableY + 10,
      head: [["Volunteer", "Events Participated"]],
      body: frequentVolunteers.map((v) => [v.name, v.events]),
      theme: "striped",
    });

    const secondTableY = doc.lastAutoTable.finalY;


    autoTable(doc, {
      startY: secondTableY + 10,
      head: [["Event", "Completed", "Pending", "Overdue"]],
      body: eventTasks.map((t) => [t.event, t.completed, t.pending, t.overdue]),
      theme: "striped",
    });

    const thirdTableY = doc.lastAutoTable.finalY;

    const fourthTableY = doc.lastAutoTable.finalY;

    autoTable(doc, {
      startY: fourthTableY + 10,
      head: [["Volunteer", "Frequency", "Variety", "Timely Completion (%)", "Feedback Rating", "Engagement Score"]],
      body: volunteerEngagement.map((v) => [
        v.name,
        v.frequency,
        v.variety,
        v.timelyCompletion + "%",
        v.feedbackRating,
        calculateEngagementScore(v)]),
        theme: "striped",
      });

    const fifthTableY = doc.lastAutoTable.finalY;

    autoTable(doc, {
      startY: fifthTableY + 10,
      head: [["Location", "Volunteers", "Events"]],
      body: locationData.map((l) => [l.location, l.volunteers, l.events]),
      theme: "striped",
    });



    doc.setFontSize(14);
    doc.text(`Volunteer Retention Rate: ${retentionRate}%`, 14, fifthTableY + 20);

    doc.save("Volunteer_Report.pdf");

    
  };

  const csvData = [
    ["Event", "Participants"],
    ...topEvents.map((e) => [e.name, e.participants]),
    [],
    ["Volunteer", "Events Participated"],
    ...frequentVolunteers.map((v) => [v.name, v.events]),
    [],
    ["Volunteer Retention Rate", `${retentionRate}%`],
    [], 
    ["Event Task Completion Report"],
    ["Event", "Completed", "Pending", "Overdue"],
    ...eventTasks.map((t) => [t.event, t.completed, t.pending, t.overdue]),
    [], 
    ["Volunteer Engagement Score"],
    ["Volunteer", "Frequency", "Variety", "Timely Completion (%)", "Feedback Rating", "Engagement Score"],
    ...volunteerEngagement.map((v) => [
      v.name, 
      v.frequency, 
      v.variety, 
      v.timelyCompletion + "%",
      v.feedbackRating,
      calculateEngagementScore(v)]),

      [],
      ["Location-Wise Volunteer & Event Report"],
      ["Location", "Volunteers", "Events"],
      ...locationData.map((l) => [l.location, l.volunteers, l.events]),
      

  ];

  

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <AdminHeader user={user} handleLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-8">
          <h1 className="text-3xl font-bold mb-6">Advanced Insights & Reports</h1>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top 3 Events by Participation</CardTitle>
              </CardHeader>
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
              <CardHeader>
                <CardTitle>Most Frequent Volunteers</CardTitle>
              </CardHeader>
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

            <Card className="mt-6">
            <CardHeader>
              <CardTitle>Event Task Completion Report</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventTasks}>
                  <XAxis dataKey="event" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#4ade80" name="Completed" />
                  <Bar dataKey="pending" stackId="a" fill="#facc15" name="Pending" />
                  <Bar dataKey="overdue" stackId="a" fill="#f87171" name="Overdue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Location-Wise Volunteer & Event Report</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={locationData}>
                  <XAxis dataKey="location" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="volunteers" fill="#60a5fa" name="Volunteers" />
                  <Bar dataKey="events" fill="#34d399" name="Events" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          </div>

          {/* Retention & Skills */}
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Retention Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl">{retentionRate}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skill Gap Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {skillData.map((skill) => (
                  <div key={skill.skill} className="mb-2">
                    <p>
                      <strong>{skill.skill}</strong>
                    </p>
                    <p>
                      Available: {skill.available} | Demand: {skill.demand}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Volunteer Engagement Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="font-medium p-3">Volunteer</th>
                    <th className="font-medium p-3">Frequency</th>
                    <th className="font-medium p-3">Variety</th>
                    <th className="font-medium p-3">Timely Completion (%)</th>
                    <th className="font-medium p-3">Feedback Rating</th>
                    <th className="font-medium p-3">Engagement Score</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteerEngagement.map((v) => (
                    <tr key={v.name} className="border-b">
                      <td className="p-3">{v.name}</td>
                      <td className="p-3">{v.frequency}</td>
                      <td className="p-3">{v.variety}</td>
                      <td className="p-3">{v.timelyCompletion}%</td>
                      <td className="p-3">{v.feedbackRating}</td>
                      <td className="p-3 font-bold">{calculateEngagementScore(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>


          {/* Download Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Download Reports</CardTitle>
            </CardHeader>
            <CardFooter className="flex gap-4">
              <Button onClick={generatePDF}>Download PDF</Button>
              <CSVLink data={csvData} filename="Volunteer_Report.csv">
                <Button variant="outline">Download CSV</Button>
              </CSVLink>
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminReports;
