import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const AssignTasks = () => {
  const [taskData, setTaskData] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [assigning, setAssigning] = useState(false);

  // Task assignment function
  const handleAssignVolunteer = async (taskId, volunteerId) => {
    setAssigning(true);
    try {
      const { data, error } = await supabase.rpc('assign_volunteer_to_task', {
        p_task_id: taskId,
        p_volunteer_id: volunteerId
      });
      
      if (error) {
        console.error('Error from RPC function:', error);
        
        // Fallback to direct insertion if RPC fails
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('task_assignment')
          .insert({
            task_id: taskId,
            volunteer_id: volunteerId,
            status: 'pending',
            notification_status: 'pending',
            response_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
          })
          .select();
          
        if (assignmentError) {
          throw assignmentError;
        }
        
        // Send notification
        const { error: notificationError } = await supabase
          .from('notification')
          .insert({
            recipient_id: volunteerId,
            task_assignment_id: assignmentData[0].id,
            title: 'New Task Assignment',
            message: `You have been assigned a new task: ${taskData.find(t => t.id === taskId)?.title || 'Unknown task'}`,
            type: 'task_assignment'
          });
          
        if (notificationError) {
          console.error('Error creating notification:', notificationError);
        }
      }
      
      toast.success('Volunteer assigned successfully');
      fetchTaskAssignments(); // Refresh the assignments list
    } catch (error) {
      console.error('Error assigning volunteer:', error);
      toast.error('Failed to assign volunteer');
    } finally {
      setAssigning(false);
    }
  };
  
  // Fetch assigned volunteers for each task
  const fetchTaskAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('task_assignment')
        .select(`
          id,
          task_id,
          volunteer_id,
          status,
          volunteer:volunteer_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .in('task_id', taskData.map(t => t.id));
        
      if (error) throw error;
      
      // Group assignments by task
      const assignmentsByTask = {};
      data.forEach(assignment => {
        if (!assignmentsByTask[assignment.task_id]) {
          assignmentsByTask[assignment.task_id] = [];
        }
        assignmentsByTask[assignment.task_id].push({
          assignmentId: assignment.id,
          volunteerId: assignment.volunteer_id,
          status: assignment.status,
          volunteerName: `${assignment.volunteer?.first_name || ''} ${assignment.volunteer?.last_name || ''}`.trim(),
          volunteerEmail: assignment.volunteer?.email
        });
      });
      
      setAssignments(assignmentsByTask);
    } catch (error) {
      console.error('Error fetching task assignments:', error);
      toast.error('Failed to load assignments');
    }
  };

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default AssignTasks; 