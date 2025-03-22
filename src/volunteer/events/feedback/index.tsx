'use client';

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VolunteerLayout } from '@/components/layouts/VolunteerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const EventFeedback = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [overallRating, setOverallRating] = useState<number>(0);
  const [organizationRating, setOrganizationRating] = useState<number>(0);
  const [tasksWereClear, setTasksWereClear] = useState<string>("");
  const [feltSupported, setFeltSupported] = useState<string>("");
  const [improvements, setImprovements] = useState("");
  const [volunteerAgainRating, setVolunteerAgainRating] = useState<number>(0);
  const [impactfulPart, setImpactfulPart] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Implement API call to submit feedback
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Thank you for your feedback!');
      navigate('/volunteer/events');
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  const RatingScale = ({ 
    value, 
    onChange, 
    leftLabel, 
    rightLabel 
  }: { 
    value: number; 
    onChange: (rating: number) => void; 
    leftLabel: string; 
    rightLabel: string; 
  }) => (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-muted-foreground px-2">
        <div className="w-8 text-center">{leftLabel}</div>
        <div className="w-8 text-center">{rightLabel}</div>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
              ${value === rating 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary hover:bg-secondary/80'}`}
          >
            {rating}
          </button>
        ))}
      </div>
    </div>
  );

  const YesNoRadio = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: string; 
    onChange: (value: string) => void;
    label: string;
  }) => (
    <RadioGroup value={value} onValueChange={onChange} className="flex gap-4">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="yes" id={`${label}-yes`} />
        <Label htmlFor={`${label}-yes`}>Yes</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="no" id={`${label}-no`} />
        <Label htmlFor={`${label}-no`}>No</Label>
      </div>
    </RadioGroup>
  );

  return (
    <VolunteerLayout>
      <div className="container max-w-2xl py-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Event Feedback</CardTitle>
            <CardDescription>
              Your feedback helps us improve future events and volunteer experiences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    How would you rate your overall experience? <span className="text-red-500">*</span>
                  </label>
                  <RatingScale
                    value={overallRating}
                    onChange={setOverallRating}
                    leftLabel="Poor"
                    rightLabel="Great"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    How well was the event organized? <span className="text-red-500">*</span>
                  </label>
                  <RatingScale
                    value={organizationRating}
                    onChange={setOrganizationRating}
                    leftLabel="Poor"
                    rightLabel="Great"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    How likely are you to volunteer again? <span className="text-red-500">*</span>
                  </label>
                  <RatingScale
                    value={volunteerAgainRating}
                    onChange={setVolunteerAgainRating}
                    leftLabel="Never"
                    rightLabel="Always"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Were the tasks and instructions clear? <span className="text-red-500">*</span>
                  </label>
                  <YesNoRadio
                    value={tasksWereClear}
                    onChange={setTasksWereClear}
                    label="tasks-clear"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Did you feel supported by the organizers? <span className="text-red-500">*</span>
                  </label>
                  <YesNoRadio
                    value={feltSupported}
                    onChange={setFeltSupported}
                    label="felt-supported"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      What could be improved for future events?
                    </label>
                    <Textarea
                      placeholder="E.g., More water stations and better signage"
                      value={improvements}
                      onChange={(e) => setImprovements(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      What was the most impactful part of the event?
                    </label>
                    <Textarea
                      placeholder="E.g., Interacting with the visually impaired players was inspiring"
                      value={impactfulPart}
                      onChange={(e) => setImpactfulPart(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={!overallRating || !organizationRating || !tasksWereClear || !feltSupported || !volunteerAgainRating}
              >
                Submit Feedback
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </VolunteerLayout>
  );
};

export default EventFeedback; 