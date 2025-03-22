'use client';

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VolunteerLayout } from '@/components/layouts/VolunteerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const EventFeedback = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [overallRating, setOverallRating] = useState<number>(0);
  const [understandingRating, setUnderstandingRating] = useState<number>(0);
  const [recommendRating, setRecommendRating] = useState<number>(0);
  const [additionalFeedback, setAdditionalFeedback] = useState('');

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
                disabled={!overallRating || !understandingRating || !recommendRating}
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