'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VolunteerLayout } from '@/components/layouts/VolunteerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/authContext';

const EventFeedback = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [overallRating, setOverallRating] = useState<number>(0);
  const [understandingRating, setUnderstandingRating] = useState<number>(0);
  const [recommendRating, setRecommendRating] = useState<number>(0);
  const [additionalFeedback, setAdditionalFeedback] = useState('');
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
          setOverallRating(data.event_experience);
          setUnderstandingRating(data.task_understanding);
          setRecommendRating(data.recommendation);
          setAdditionalFeedback(data.comments || '');
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
          task_understanding: understandingRating,
          recommendation: recommendRating,
          comments: additionalFeedback,
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
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
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

  if (isLoading) {
    return (
      <VolunteerLayout>
        <div className="container max-w-2xl py-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-center items-center h-40">
                <p>Loading...</p>
              </div>
            </CardContent>
          </Card>
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
              <CardTitle className="text-2xl">Thank you for your response</CardTitle>
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
                    Please rate your overall event experience <span className="text-red-500">*</span>
                  </label>
                  <RatingScale
                    value={overallRating}
                    onChange={setOverallRating}
                    leftLabel="Poor"
                    rightLabel="Awesome"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    How easy was it to understand the tasks? <span className="text-red-500">*</span>
                  </label>
                  <RatingScale
                    value={understandingRating}
                    onChange={setUnderstandingRating}
                    leftLabel="Very confusing"
                    rightLabel="Easy"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Would you recommend volunteering with us to a friend? <span className="text-red-500">*</span>
                  </label>
                  <RatingScale
                    value={recommendRating}
                    onChange={setRecommendRating}
                    leftLabel="Very unlikely"
                    rightLabel="Of course!"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Is there something that you'd like to tell us?
                  </label>
                  <Textarea
                    placeholder="Please enter a few words..."
                    value={additionalFeedback}
                    onChange={(e) => setAdditionalFeedback(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={!overallRating || !understandingRating || !recommendRating || isLoading}
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