import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowLeft } from 'lucide-react';

interface FeedbackData {
  overallRating: number;
  organizationRating: number;
  tasksClear: {
    yes: number;
    no: number;
  };
  organizerSupport: {
    yes: number;
    no: number;
  };
  improvements: string[];
  impactfulMoments: string[];
}

interface EventFeedbackViewProps {
  eventName: string;
  feedbackData: FeedbackData;
}

const COLORS = ['#4CAF50', '#FF5252'];

const EventFeedbackView: React.FC<EventFeedbackViewProps> = ({ eventName, feedbackData }) => {
  const navigate = useNavigate();
  
  // Calculate percentages for pie charts
  const tasksClearTotal = feedbackData.tasksClear.yes + feedbackData.tasksClear.no;
  const organizerSupportTotal = feedbackData.organizerSupport.yes + feedbackData.organizerSupport.no;

  const tasksClearData = [
    { name: 'Yes', value: (feedbackData.tasksClear.yes / tasksClearTotal) * 100 },
    { name: 'No', value: (feedbackData.tasksClear.no / tasksClearTotal) * 100 }
  ];

  const organizerSupportData = [
    { name: 'Yes', value: (feedbackData.organizerSupport.yes / organizerSupportTotal) * 100 },
    { name: 'No', value: (feedbackData.organizerSupport.no / organizerSupportTotal) * 100 }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Feedback for Event: {eventName}</h1>
          <p className="text-muted-foreground mt-1">Feedback Analytics and Insights</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin/events')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Back to Events
        </Button>
      </div>

      {/* Average Ratings Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Experience</CardTitle>
            <CardDescription>Average rating from volunteers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={feedbackData.overallRating * 10} className="h-2" />
              <div className="flex justify-between text-sm">
                <span>{feedbackData.overallRating.toFixed(1)}/10.0</span>
                <span>{Math.round(feedbackData.overallRating * 10)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Organization</CardTitle>
            <CardDescription>How well was the event organized?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={feedbackData.organizationRating * 10} className="h-2" />
              <div className="flex justify-between text-sm">
                <span>{feedbackData.organizationRating.toFixed(1)}/10.0</span>
                <span>{Math.round(feedbackData.organizationRating * 10)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Clarity</CardTitle>
            <CardDescription>Were the tasks and instructions clear?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tasksClearData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {tasksClearData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#4CAF50] rounded-full mr-2"></div>
                <span>Yes: {Math.round(tasksClearData[0].value)}%</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#FF5252] rounded-full mr-2"></div>
                <span>No: {Math.round(tasksClearData[1].value)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support from Organizers</CardTitle>
            <CardDescription>Did volunteers feel supported?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={organizerSupportData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {organizerSupportData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#4CAF50] rounded-full mr-2"></div>
                <span>Yes: {Math.round(organizerSupportData[0].value)}%</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#FF5252] rounded-full mr-2"></div>
                <span>No: {Math.round(organizerSupportData[1].value)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comments Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Suggestions for Improvement</CardTitle>
            <CardDescription>What could be improved for future events?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedbackData.improvements.map((suggestion, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Impactful Moments</CardTitle>
            <CardDescription>What was the most impactful part of the event?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedbackData.impactfulMoments.map((moment, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">{moment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventFeedbackView; 