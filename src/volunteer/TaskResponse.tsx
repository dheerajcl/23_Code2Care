import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { notificationService } from '@/services/notification.service';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import { VolunteerLayout } from '@/components/layouts/VolunteerLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const TaskResponse = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState('');
  const [taskDetails, setTaskDetails] = useState(null);
  
  // Get action and id from URL parameters
  const action = searchParams.get('action');
  const assignmentId = searchParams.get('id');
  const volunteerId = searchParams.get('volunteerId');
  
  useEffect(() => {
    // Function to handle direct responses from email links
    const handleEmailResponse = async () => {
      // Must have action, assignment ID, and volunteer ID to proceed
      if (!action || !assignmentId || !volunteerId) {
        setError('Invalid URL parameters. Missing required information.');
        return;
      }
      
      if (action !== 'accept' && action !== 'reject') {
        setError('Invalid action. Must be "accept" or "reject".');
        return;
      }
      
      try {
        setIsProcessing(true);
        
        // Fetch task assignment details first for display
        const { data: taskAssignment, error: taskError } = await supabase
          .from('task_assignment')
          .select(`
            id, 
            task_id,
            task:task_id(title, description, deadline),
            event:event_id(title)
          `)
          .eq('id', assignmentId)
          .single();
          
        if (taskError) {
          console.error('Error fetching task assignment:', taskError);
          setError('Could not find the task assignment.');
          setIsProcessing(false);
          return;
        }
        
        setTaskDetails(taskAssignment);
        
        // Check if the current user matches the volunteer ID in the URL
        // If not logged in or different user, we'll show a message asking to log in
        const canProceedImmediately = user && user.id === volunteerId;
        
        if (canProceedImmediately) {
          // User is authenticated and matches the volunteer ID, proceed with response
          const { success, error: responseError } = await notificationService.handleTaskResponse(
            assignmentId,
            volunteerId,
            action
          );
          
          if (!success) {
            setError(responseError.message || 'Failed to process your response.');
          } else {
            setIsComplete(true);
            toast.success(`Task ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`);
            
            // Redirect after a short delay
            setTimeout(() => {
              navigate('/volunteer/tasks');
            }, 2000);
          }
        }
      } catch (err) {
        console.error('Error processing task response:', err);
        setError('An unexpected error occurred while processing your response.');
      } finally {
        setIsProcessing(false);
      }
    };
    
    // Only process if we have the right parameters and after auth check is complete
    if (!authLoading && (action && assignmentId && volunteerId)) {
      handleEmailResponse();
    }
  }, [action, assignmentId, volunteerId, user, authLoading, navigate]);
  
  // Handle manual response when user is logged in but not matching the volunteer ID
  const handleManualResponse = async (responseAction) => {
    try {
      setIsProcessing(true);
      
      if (!user) {
        toast.error('You must be logged in to respond to tasks.');
        navigate('/login');
        return;
      }
      
      // User is logged in but not matching the volunteer ID from the URL
      // Use the current user's ID instead
      const { success, error: responseError } = await notificationService.handleTaskResponse(
        assignmentId,
        user.id,
        responseAction
      );
      
      if (!success) {
        setError(responseError.message || 'Failed to process your response.');
      } else {
        setIsComplete(true);
        toast.success(`Task ${responseAction === 'accept' ? 'accepted' : 'rejected'} successfully!`);
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/volunteer/tasks');
        }, 2000);
      }
    } catch (err) {
      console.error('Error processing task response:', err);
      setError('An unexpected error occurred while processing your response.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Loading state when auth is still being checked
  if (authLoading) {
    return (
      <VolunteerLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" text="Checking authentication..." color="primary" />
        </div>
      </VolunteerLayout>
    );
  }
  
  // When user needs to log in first (volunteer ID in URL doesn't match logged in user)
  if (user && volunteerId && user.id !== volunteerId) {
    return (
      <VolunteerLayout>
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Different Account Detected</CardTitle>
            <CardDescription>
              This task response link was sent to a different volunteer account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-amber-600 flex items-center gap-2">
                <AlertTriangle size={18} />
                The link you clicked was intended for a different volunteer account.
              </p>
              
              {taskDetails && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold">{taskDetails.task.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Event: {taskDetails.event.title}</p>
                </div>
              )}
              
              <p>You are currently logged in as {user.firstName} {user.lastName}.</p>
              <p>Do you still want to respond to this task with your current account?</p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => navigate('/volunteer/tasks')}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleManualResponse('accept')}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              Accept Task
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleManualResponse('reject')}
              disabled={isProcessing}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Decline Task
            </Button>
          </CardFooter>
        </Card>
      </VolunteerLayout>
    );
  }
  
  // Not logged in but has task response parameters
  if (!user && (action && assignmentId && volunteerId)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              Please log in to {action === 'accept' ? 'accept' : 'decline'} this task.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You need to log in to your volunteer account to respond to this task assignment.
              After logging in, you'll be able to view and respond to all your task assignments.
            </p>
            {taskDetails && (
              <div className="border rounded-lg p-4 bg-gray-50 mb-4">
                <h3 className="font-semibold">{taskDetails.task.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">Event: {taskDetails.event.title}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/login')} className="w-full">
              Log In Now
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Successfully processed or is processing
  return (
    <VolunteerLayout>
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Task Response</CardTitle>
          <CardDescription>
            Your response to the task assignment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-8">
              <LoadingSpinner size="large" text="Processing your response..." color="primary" />
            </div>
          ) : error ? (
            <div className="text-red-600 flex items-center gap-2 p-4 border border-red-200 bg-red-50 rounded-lg">
              <XCircle size={20} />
              <span>{error}</span>
            </div>
          ) : isComplete ? (
            <div className="text-green-600 flex items-center gap-2 p-4 border border-green-200 bg-green-50 rounded-lg">
              <CheckCircle size={20} />
              <span>
                Task {action === 'accept' ? 'accepted' : 'rejected'} successfully! 
                Redirecting to your tasks...
              </span>
            </div>
          ) : (
            <p>Invalid or expired task response link.</p>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button 
            variant="outline" 
            onClick={() => navigate('/volunteer/tasks')}
            disabled={isProcessing}
          >
            View All Tasks
          </Button>
        </CardFooter>
      </Card>
    </VolunteerLayout>
  );
};

export default TaskResponse; 