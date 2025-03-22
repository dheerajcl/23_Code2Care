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

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

const AdminReports: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
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

    doc.setFontSize(14);
    doc.text(`Volunteer Retention Rate: ${retentionRate}%`, 14, secondTableY + 20);

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
