'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VolunteerLayout } from '@/components/layouts/VolunteerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/authContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const EventFeedback = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [overallRating, setOverallRating] = useState<number>(0);
  const [organizationRating, setOrganizationRating] = useState<number>(0);
  const [tasksWereClear, setTasksWereClear] = useState<string>("");
  const [feltSupported, setFeltSupported] = useState<string>("");
  const [improvements, setImprovements] = useState("");
  const [volunteerAgainRating, setVolunteerAgainRating] = useState<number>(0);
  const [impactfulPart, setImpactfulPart] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedbackExists, setFeedbackExists] = useState<boolean>(false);

  useEffect(() => {
    // Check if feedback already exists for this volunteer and event
    const checkExistingFeedback = async () => {
      if (!user || !eventId) return;

      try {
        const volunteerId = user.id;
        
        const { data, error } = await supabase
          .from('feedback')
          .select('*')
          .eq('volunteer_id', volunteerId)
          .eq('event_id', eventId)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          // PGRST116 is the error code for "No rows returned"
          console.error('Error checking feedback:', error);
          toast.error('Failed to check existing feedback.');
        }
        
        if (data) {
          // Feedback already exists
          setFeedbackExists(true);
          // Pre-fill form with existing data
          setOverallRating(data.event_experience || 0);
          setOrganizationRating(data.event_organization || 0);
          setVolunteerAgainRating(data.volunteer_again || 0);
          setTasksWereClear(data.tasks_clear ? 'yes' : 'no');
          setFeltSupported(data.organizer_support ? 'yes' : 'no');
          setImprovements(data.improvement_suggestions || '');
          setImpactfulPart(data.impactful_moment || '');
        }
      } catch (error) {
        console.error('Error checking feedback:', error);
        toast.error('Failed to check existing feedback.');
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingFeedback();
  }, [user, eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !eventId) {
      toast.error('Missing user or event information.');
      return;
    }

    setIsLoading(true);
    const volunteerId = user.id;
    
    try {
      if (feedbackExists) {
        toast.info('You have already submitted feedback for this event.');
        navigate('/volunteer/events');
        return;
      }
      
      // Insert new feedback record
      const { error } = await supabase
        .from('feedback')
        .insert({
          volunteer_id: volunteerId,
          event_id: eventId,
          event_experience: overallRating,
          event_organization: organizationRating,
          volunteer_again: volunteerAgainRating,
          tasks_clear: tasksWereClear === 'yes',
          organizer_support: feltSupported === 'yes',
          improvement_suggestions: improvements,
          impactful_moment: impactfulPart,
          created_at: new Date().toISOString(),
        });
      
      if (error) {
        throw error;
      }
      
      toast.success('Thank you for your feedback!');
      navigate('/volunteer/events');
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      
      // Check for unique constraint violation
      if (error.code === '23505') {
        toast.error('You have already submitted feedback for this event.');
      } else {
        toast.error('Failed to submit feedback. Please try again.');
      }
    } finally {
      setIsLoading(false);
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
      <div className="flex justify-between text-sm text-muted-foreground">
        <div>{leftLabel}</div>
        <div>{rightLabel}</div>
      </div>
      <div className="flex justify-between">
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

  if (isLoading) {
    return (
      <VolunteerLayout>
        <div className="container max-w-2xl py-6 flex justify-center items-center">
          <LoadingSpinner size="large" text="Loading feedback form..." color="primary" />
        </div>
      </VolunteerLayout>
    );
  }

  if (feedbackExists) {
    return (
      <VolunteerLayout>
        <div className="container max-w-2xl py-6">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Feedback Already Submitted</CardTitle>
              <CardDescription>
                You have already provided feedback for this event.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/volunteer/events')}
                className="w-full"
              >
                Back to Events
              </Button>
            </CardContent>
          </Card>
        </div>
      </VolunteerLayout>
    );
  }

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
                disabled={!overallRating || !organizationRating || !tasksWereClear || !feltSupported || !volunteerAgainRating || isLoading}
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