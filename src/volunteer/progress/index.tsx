import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { VolunteerLayout } from '@/components/layouts/VolunteerLayout';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { getVolunteerHours, getVolunteerSkills, getVolunteerFeedback } from '@/services/database.service';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const VolunteerProgress = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState({
    hours: true,
    skills: true,
    feedback: true
  });
  const [error, setError] = useState({
    hours: '',
    skills: '',
    feedback: ''
  });
  
  // State for data
  const [hoursData, setHoursData] = useState({
    chartData: [],
    totalHours: 0
  });
  const [skillsData, setSkillsData] = useState({
    skills: [],
    suggestedSkills: []
  });
  const [feedbackData, setFeedbackData] = useState([]);

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      // Fetch hours data
      try {
        setLoading(prev => ({ ...prev, hours: true }));
        const { success, data, error } = await getVolunteerHours(user.id);
        if (success && data) {
          setHoursData({
            chartData: data.chartData,
            totalHours: data.totalHours
          });
        } else {
          setError(prev => ({ ...prev, hours: error || 'Failed to fetch hours data' }));
        }
      } catch (err) {
        setError(prev => ({ ...prev, hours: 'Error loading hours data' }));
      } finally {
        setLoading(prev => ({ ...prev, hours: false }));
      }
      
      // Fetch skills data
      try {
        setLoading(prev => ({ ...prev, skills: true }));
        const { success, data, error } = await getVolunteerSkills(user.id);
        if (success && data) {
          setSkillsData({
            skills: data.skills,
            suggestedSkills: data.suggestedSkills
          });
        } else {
          setError(prev => ({ ...prev, skills: error || 'Failed to fetch skills data' }));
        }
      } catch (err) {
        setError(prev => ({ ...prev, skills: 'Error loading skills data' }));
      } finally {
        setLoading(prev => ({ ...prev, skills: false }));
      }
      
      // Fetch feedback data
      try {
        setLoading(prev => ({ ...prev, feedback: true }));
        const { success, data, error } = await getVolunteerFeedback(user.id);
        if (success && data) {
          setFeedbackData(data);
        } else {
          setError(prev => ({ ...prev, feedback: error || 'Failed to fetch feedback data' }));
        }
      } catch (err) {
        setError(prev => ({ ...prev, feedback: 'Error loading feedback data' }));
      } finally {
        setLoading(prev => ({ ...prev, feedback: false }));
      }
    };

    fetchData();
  }, [user]);

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
            {/* Volunteer Hours Card */}
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Hours</CardTitle>
                <CardDescription>
                  Your volunteering hours over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading.hours ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : error.hours ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error.hours}</AlertDescription>
                  </Alert>
                ) : (
                  <div className="h-[300px]">
                    <div className="text-center mb-4">
                      <h3 className="text-3xl font-bold">{hoursData.totalHours}</h3>
                      <p className="text-sm text-muted-foreground">Total Hours</p>
                    </div>
                    <ResponsiveContainer width="100%" height="80%">
                      <BarChart data={hoursData.chartData}>
                        <XAxis dataKey="name" />
                        <Tooltip 
                          formatter={(value) => [`${value} hours`, 'Hours']}
                          labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Bar dataKey="hours" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills Development Card */}
            <Card>
              <CardHeader>
                <CardTitle>Skills Development</CardTitle>
                <CardDescription>
                  Track your skill progression
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading.skills ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : error.skills ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error.skills}</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {skillsData.skills.slice(0, 3).map((skill) => (
                      <div key={skill.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{skill.name}</div>
                          <div className="text-sm text-muted-foreground">{skill.level}</div>
                        </div>
                        <Progress value={skill.progress} max={100} className="h-2" />
                      </div>
                    ))}
                    
                    {skillsData.skills.length === 0 && (
                      <div className="text-center py-2 text-muted-foreground">
                        No skills tracked yet. Complete tasks to develop your skills!
                      </div>
                    )}
                    
                    <div className="pt-4">
                      <h3 className="text-sm font-medium mb-2">Suggested Skill Development</h3>
                      <div className="space-y-2">
                        {skillsData.suggestedSkills.slice(0, 2).map((skill) => (
                          <div key={skill} className="p-2 border rounded-md">
                            <div className="font-medium">{skill}</div>
                            <div className="text-sm text-muted-foreground">
                              Participate in related activities to develop this skill
                            </div>
                          </div>
                        ))}
                        
                        {skillsData.suggestedSkills.length === 0 && (
                          <div className="text-center py-2 text-muted-foreground">
                            Great job! You've already started developing all suggested skills.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Feedback Card */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback & Recognition</CardTitle>
              <CardDescription>
                Feedback received from event organizers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.feedback ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : error.feedback ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error.feedback}</AlertDescription>
                </Alert>
              ) : feedbackData.length > 0 ? (
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