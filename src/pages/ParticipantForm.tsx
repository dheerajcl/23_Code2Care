import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from  "@/components/ui/card";
import Header from '../components/Header';
import Footer from '../components/Footer';

const ParticipantForm = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const eventName = queryParams.get("event") || "";

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    disabilityStatus: "",
    specialCare: "",
    event: eventName,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
    // Add API call or database integration here
  };

  return (
    <div>
    <Card className="max-w-lg mx-auto mt-10 p-6 shadow-lg">
      <Header/>
      <CardHeader>
        <CardTitle>Register as Participant</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Input id="gender" name="gender" value={formData.gender} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="disabilityStatus">Disability Status</Label>
            <Input id="disabilityStatus" name="disabilityStatus" value={formData.disabilityStatus} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="specialCare">Special Care Instructions</Label>
            <Input id="specialCare" name="specialCare" value={formData.specialCare} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="event">Event</Label>
            <Input id="event" name="event" value={formData.event} disabled />
          </div>
          <Button type="submit" className="w-full">Submit</Button>
        </form>
      </CardContent>
    </Card>
    <Footer/>
    </div>
  );
};

export default ParticipantForm;