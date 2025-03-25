import React from 'react';
import { useAuth } from '@/lib/authContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Bar, BarChart, ResponsiveContainer } from 'recharts';
import { VolunteerLayout } from '@/components/layouts/VolunteerLayout';
import AccessibilityMenu from '@/components/AccessibilityMenu';


// Mock data (you can replace this with real data from your API)
const activityData = [
  { name: 'Jun', hours: 0 },
  { name: 'Jul', hours: 5 },
  { name: 'Aug', hours: 0 },
  { name: 'Sep', hours: 0 },
  { name: 'Oct', hours: 0 },
  { name: 'Nov', hours: 0 },
];

const feedbackData = [
  {
    id: '1',
    eventTitle: 'Blind Cricket Workshop',
    date: 'Jul 25, 2023',
    comment: 'Great enthusiasm and very helpful with the participants. Good communication skills.',
    rating: 5,
  },
];

export const VolunteerProgress = () => {
  const { user } = useAuth();

  return (
    <VolunteerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Progress</h1>
          <p className="text-muted-foreground mt-2">
            Track your volunteer hours, skills development, and feedback from events.
          </p>
        </div>
        
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Hours</CardTitle>
                <CardDescription>
                  Your volunteering hours over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                      <Bar dataKey="hours" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills Development</CardTitle>
                <CardDescription>
                  Track your skill progression
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Teaching</div>
                      <div className="text-sm text-muted-foreground">Beginner</div>
                    </div>
                    <Progress value={30} max={100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Technology</div>
                      <div className="text-sm text-muted-foreground">Intermediate</div>
                    </div>
                    <Progress value={60} max={100} className="h-2" />
                  </div>
                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-2">Suggested Skill Development</h3>
                    <div className="space-y-2">
                      <div className="p-2 border rounded-md">
                        <div className="font-medium">Event Management</div>
                        <div className="text-sm text-muted-foreground">Participate in event organization to develop this skill</div>
                      </div>
                      <div className="p-2 border rounded-md">
                        <div className="font-medium">Sports Coaching</div>
                        <div className="text-sm text-muted-foreground">Assist in sports events to develop coaching skills</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Feedback & Recognition</CardTitle>
              <CardDescription>
                Feedback received from event organizers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feedbackData.length > 0 ? (
                <div className="space-y-4">
                  {feedbackData.map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{feedback.eventTitle}</h3>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i} 
                              className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {feedback.date}
                      </div>
                      <p className="text-sm">
                        "{feedback.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No feedback received yet. Feedback will appear here after completing volunteer activities.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <AccessibilityMenu/>
      </div>
    </VolunteerLayout>
  );
}; 