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
import { supabase } from '@/lib/supabase';

const getVolunteerPointsHistogram = async (volunteerId: string) => {
  try {
    const { data, error } = await supabase
      .from('points')
      .select('points, created_at')
      .eq('volunteer_id', volunteerId);

    if (error) {
      console.error('Error fetching volunteer points:', error);
      throw error;
    }

    const pointsData = data?.map((record) => ({
      date: new Date(record.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      points: record.points || 0,
    })) || [];

    const aggregatedData = pointsData.reduce((acc, curr) => {
      const existing = acc.find((item) => item.date === curr.date);
      if (existing) {
        existing.points += curr.points;
      } else {
        acc.push({ date: curr.date, points: curr.points });
      }
      return acc;
    }, []);

    return { success: true, data: aggregatedData };
  } catch (error) {
    console.error('Error in getVolunteerPointsHistogram:', error);
    return { success: false, error: 'Failed to fetch points data' };
  }
};

const getTaskHistory = async (volunteerId: string) => {
  try {
    const { data, error } = await supabase
      .from('task_assignment')
      .select(`
        task_id,
        status,
        created_at,
        task (
          title,
          description
        )
      `)
      .eq('volunteer_id', volunteerId).order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching task history:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in getTaskHistory:', error);
    return { success: false, error: 'Failed to fetch task history' };
  }
};

export const VolunteerProgress = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState({
    points: true,
    tasks: true,
    feedback: true,
  });
  const [error, setError] = useState({
    points: '',
    tasks: '',
    feedback: '',
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
  const [pointsData, setPointsData] = useState({
    chartData: [],
    totalPoints: 0,
  });
  const [taskHistory, setTaskHistory] = useState([]);

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      // Fetch points data
      try {
        setLoading((prev) => ({ ...prev, points: true })); // Reuse hours loading state for points
        const { success, data, error } = await getVolunteerPointsHistogram(user.id);
        if (success && data) {
          const totalPoints = data.reduce((sum, record) => sum + record.points, 0);
          setPointsData({
            chartData: data,
            totalPoints,
          });
        } else {
          setError((prev) => ({ ...prev, points: error || 'Failed to fetch points data' }));
        }
      } catch (err) {
        setError((prev) => ({ ...prev, points: 'Error loading points data' }));
      } finally {
        setLoading((prev) => ({ ...prev, points: false }));
      }
      
      // Fetch task history
      try {
        setLoading((prev) => ({ ...prev, tasks: true }));
        const { success, data, error } = await getTaskHistory(user.id);
        if (success && data) {
          setTaskHistory(data);
        } else {
          setError((prev) => ({ ...prev, tasks: error || 'Failed to fetch task history' }));
        }
      } catch (err) {
        setError((prev) => ({ ...prev, tasks: 'Error loading task history' }));
      } finally {
        setLoading((prev) => ({ ...prev, tasks: false }));
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
            Track your volunteer points, task history, and feedback from events.
          </p>
        </div>
        
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Volunteer Points Card */}
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Points</CardTitle>
                <CardDescription>
                  Your points earned over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading.points ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : error.points ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error.points}</AlertDescription>
                  </Alert>
                ) : (
                  <div className="h-[300px]">
                    <div className="text-center mb-4">
                      <h3 className="text-3xl font-bold">{pointsData.totalPoints}</h3>
                      <p className="text-sm text-muted-foreground">Total Points</p>
                    </div>
                    <ResponsiveContainer width="100%" height="80%">
                      <BarChart data={pointsData.chartData}>
                        <XAxis dataKey="date" />
                        <Tooltip
                          formatter={(value) => [`${value} points`, 'Points']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Bar dataKey="points" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Task History Card */}
            <Card>
              <CardHeader>
                <CardTitle>Task History</CardTitle>
                <CardDescription>
                  View your assigned tasks and their statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading.tasks ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : error.tasks ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error.tasks}</AlertDescription>
                  </Alert>
                ) : taskHistory.length > 0 ? (
                  <div className="space-y-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Task Title</th>
                          <th className="text-left py-2">Description</th>
                          <th className="text-left py-2">Status</th>
                          <th className="text-left py-2">Created Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taskHistory.map((task, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{task.task?.title || 'N/A'}</td>
                            <td className="py-2">{task.task?.description || 'N/A'}</td>
                            <td className="py-2">{task.status}</td>
                            <td className="py-2">
                              {task.created_at
                                ? new Date(task.created_at).toLocaleDateString()
                                : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-2 text-muted-foreground">
                    No tasks assigned yet. Tasks will appear here once assigned.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Feedback Card */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
              <CardDescription>
                Feedback History
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
                              className={`w-4 h-4 ${i < (feedback.rating/2) ? 'text-yellow-400' : 'text-gray-300'}`} 
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