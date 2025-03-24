import { supabase } from '@/lib/supabase';
import { emailService } from './email.service';
import { getCurrentUser } from './user.service';
import { toast } from '@/components/ui/use-toast';

class NotificationService {
  /**
   * Send notification to volunteer about task assignment
   * 
   * @param taskAssignmentId ID of task assignment
   * @param volunteerId ID of volunteer
   * @param taskId ID of task 
   * @param eventId ID of event
   */
  async notifyTaskAssignment(
    taskAssignmentId: string,
    volunteerId: string,
    taskId: string,
    eventId: string
  ) {
    try {
      console.log(`Sending task assignment notification: taskAssignment=${taskAssignmentId}, volunteer=${volunteerId}, task=${taskId}, event=${eventId}`);
      
      // Get task details
      const { data: taskData, error: taskError } = await supabase
        .from('task')
        .select(`
          *,
          event:event_id (*)
        `)
        .eq('id', taskId)
        .single();
      
      if (taskError) {
        console.error('Error fetching task details:', taskError);
        throw taskError;
      }
      
      console.log('Task data retrieved:', taskData);
      
      // Get volunteer details
      const { data: volunteerData, error: volunteerError } = await supabase
        .from('volunteer')
        .select('*')
        .eq('id', volunteerId)
        .single();
        
      if (volunteerError) {
        console.error('Error fetching volunteer details:', volunteerError);
        throw volunteerError;
      }
      
      console.log('Volunteer data retrieved:', volunteerData.email);
      
      // Create notification
      const now = new Date().toISOString();
      const { data: notificationData, error: notificationError } = await supabase
        .from('notification')
        .insert({
          recipient_id: volunteerId,
          task_assignment_id: taskAssignmentId,
          title: `New Task Assignment: ${taskData.title}`,
          message: `You have been assigned to task "${taskData.title}" for event "${taskData.event?.title || 'Unknown event'}"`,
          type: 'task_assignment',
          is_read: false,
          created_at: now
        })
        .select()
        .single();
        
      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        throw notificationError;
      }
      
      console.log('Notification created:', notificationData);
      
      // Update task assignment to record notification sent
      const { error: updateError } = await supabase
        .from('task_assignment')
        .update({
          notification_sent_at: now,
          notification_status: 'sent'
        })
        .eq('id', taskAssignmentId);
        
      if (updateError) {
        console.warn("Could not update task assignment with notification status:", updateError);
      }
      
      // Generate accept/reject URLs
      const { acceptUrl, rejectUrl } = emailService.generateTaskResponseUrls(taskAssignmentId, volunteerId);
      
      // Initialize EmailJS
      emailService.initEmailJS();
      
      // Prepare email parameters
      const emailParams = {
        to_email: volunteerData.email,
        to_name: `${volunteerData.first_name} ${volunteerData.last_name}`,
        subject: `New Task Assignment: ${taskData.title}`,
        message: `You have been assigned to task "${taskData.title}" for event "${taskData.event?.title || 'Unknown event'}". Please review the details below.`,
        task_name: taskData.title,
        event_name: taskData.event?.title || 'Event',
        task_description: taskData.description || 'No description provided',
        deadline: taskData.deadline ? new Date(taskData.deadline).toLocaleDateString() : 'Not specified',
        accept_url: acceptUrl,
        reject_url: rejectUrl,
        response_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString() // 24 hours from now
      };
      
      console.log("Sending task assignment email to:", volunteerData.email);
      
      const emailResult = await emailService.sendTaskAssignmentEmail(emailParams);
      if (!emailResult.success) {
        console.error("Failed to send email:", emailResult.error);
        // Still return success for now, but log the error
      } else {
        console.log("Email sent successfully");
      }
      
      return { success: true, notification: notificationData };
    } catch (error) {
      console.error('Error notifying task assignment:', error);
      return { success: false, error };
    }
  }

  /**
   * Get all notifications for a volunteer
   * 
   * @param volunteerId ID of the volunteer
   * @returns List of notifications
   */
  async getVolunteerNotifications(volunteerId: string) {
    try {
      // Use a simpler query without complex joins to avoid relationship errors
      const { data: notificationData, error: notificationError } = await supabase
        .from('notification')
        .select('*')
        .eq('recipient_id', volunteerId)
        .order('created_at', { ascending: false });
          
      if (notificationError) throw notificationError;
      
      // Manually fetch related task assignments if task_assignment_id exists
      const result = [];
      
      for (const notification of notificationData) {
        if (notification.task_assignment_id) {
          try {
            // Get the task assignment details
            const { data: assignmentData } = await supabase
              .from('task_assignment')
              .select(`
                task_id,
                volunteer_id,
                event_id,
                notification_status,
                status
              `)
              .eq('id', notification.task_assignment_id)
              .single();
              
            if (assignmentData) {
              // Get task details
              const { data: taskData } = await supabase
                .from('task')
                .select('id, title, description, deadline, status')
                .eq('id', assignmentData.task_id)
                .single();
                
              // Get event details
              const { data: eventData } = await supabase
                .from('event')
                .select('id, title')
                .eq('id', assignmentData.event_id)
                .single();
                
              // Add all data to the notification object
              result.push({
                ...notification,
                task_assignment: {
                  ...assignmentData,
                  task: taskData,
                  event: eventData
                }
              });
            } else {
              result.push(notification);
            }
          } catch (err) {
            console.error('Error fetching related data for notification:', err);
            result.push(notification);
          }
        } else {
          result.push(notification);
        }
      }
      
      return { data: result, error: null };
    } catch (error) {
      console.error('Error fetching volunteer notifications:', error);
      return { data: [], error };
    }
  }

  /**
   * Handle volunteer response to a task assignment (accept/reject)
   * 
   * @param taskAssignmentId ID of the task assignment
   * @param volunteerId ID of the volunteer
   * @param response 'accept' or 'reject'
   */
  async handleTaskResponse(
    taskAssignmentId: string,
    volunteerId: string,
    response: 'accept' | 'reject'
  ) {
    try {
      // Verify that the task assignment belongs to this volunteer
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('task_assignment')
        .select(`
          *,
          task:task_id(*),
          event:event_id(*),
          volunteer:volunteer_id(*)
        `)
        .eq('id', taskAssignmentId)
        .eq('volunteer_id', volunteerId)
        .single();
      
      if (assignmentError) throw assignmentError;
      
      // If already responded, prevent duplicate responses
      if (assignmentData.notification_status !== 'sent' && assignmentData.notification_status !== 'pending') {
        return { 
          success: false, 
          error: 'This task has already been responded to or has expired' 
        };
      }
      
      // Update the task assignment status
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('task_assignment')
        .update({
          status: response === 'accept' ? 'accepted' : 'rejected',
          notification_status: response,
          notification_responded_at: now
        })
        .eq('id', taskAssignmentId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Mark the notification as read
      await supabase
        .from('notification')
        .update({ is_read: true })
        .eq('task_assignment_id', taskAssignmentId);
      
      // Send a notification email to the admin
      try {
        // Initialize EmailJS
        emailService.initEmailJS();
        
        // Get admin email(s) - In a real app, you'd get this from your admin table
        // For now, we'll use the system email defined in your .env
        const { data: adminData, error: adminError } = await supabase
          .from('admin')
          .select('email, first_name, last_name')
          .order('created_at', { ascending: true })
          .limit(1);

        const adminEmail = adminData?.[0]?.email || process.env.ADMIN_FALLBACK_EMAIL;
        const adminName = adminData?.[0] 
          ? `${adminData[0].first_name} ${adminData[0].last_name}`
          : 'Administrator';
        
        // Prepare email params
        const statusClass = response === 'accept' ? 'accepted' : 'rejected';
        const emailParams = {
          to_email: adminEmail,
          to_name: adminName,
          subject: `Task Response: ${assignmentData.task.title}`,
          message: `A volunteer has responded to the task assignment.`,
          task_name: assignmentData.task.title,
          event_name: assignmentData.event.title,
          volunteer_name: `${assignmentData.volunteer.first_name} ${assignmentData.volunteer.last_name}`,
          status: response === 'accept' ? 'Accepted' : 'Rejected',
          status_class: statusClass,
          dashboard_url: `${window.location.origin}/admin/notifications`
        };
        
        await emailService.sendTaskResponseEmail(emailParams);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Implement retry logic or dead letter queue here
      }
      
      return { success: true, data };
    } catch (error) {
      console.error(`Error handling task ${response}:`, error);
      return { success: false, error };
    }
  }

  /**
   * Mark a notification as read
   * 
   * @param notificationId ID of the notification
   */
  async markNotificationAsRead(notificationId: string) {
    try {
      const { data, error } = await supabase
        .from('notification')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error };
    }
  }

  /**
   * Get task assignment status counts for admin dashboard
   * Shows pending, accepted, rejected, and expired counts
   */
  async getTaskAssignmentStatusCounts() {
    try {
      const { data, error } = await supabase
        .from('task_assignment')
        .select('notification_status')
        .not('notification_status', 'is', null);
      
      if (error) throw error;
      
      // Count the statuses
      const counts = {
        pending: 0,
        sent: 0,
        accept: 0,
        reject: 0,
        expired: 0
      };
      
      data.forEach((assignment) => {
        const status = assignment.notification_status;
        // Using Object.prototype.hasOwnProperty.call to avoid the linter warning
        if (Object.prototype.hasOwnProperty.call(counts, status)) {
          counts[status]++;
        }
      });
      
      return { data: counts, error: null };
    } catch (error) {
      console.error('Error getting task assignment status counts:', error);
      return { 
        data: { pending: 0, sent: 0, accept: 0, reject: 0, expired: 0 }, 
        error 
      };
    }
  }
  
  /**
   * Get all notifications for the current user
   */
  async getNotificationsForCurrentUser() {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      
      // Get all task assignments for the current volunteer where notification has been sent
      const { data, error } = await supabase
        .from('task_assignment')
        .select(`
          id,
          notification_status,
          notification_sent_at,
          notification_responded_at,
          task:task_id (
            id,
            title,
            description,
            due_date
          ),
          event:event_id (
            id,
            title
          )
        `)
        .eq('volunteer_id', user.id)
        .not('notification_status', 'eq', 'pending')
        .order('notification_sent_at', { ascending: false });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { 
        success: false,
        error: error.message || 'Failed to fetch notifications',
        data: []
      };
    }
  }
  
  /**
   * Get all notifications for admin view
   */
  async getAdminNotifications() {
    try {
      // Get all recent task assignments (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('task_assignment')
        .select(`
          id,
          notification_status,
          notification_sent_at,
          notification_responded_at,
          volunteer:volunteer_id (
            id,
            first_name,
            last_name,
            profile_image
          ),
          task:task_id (
            id,
            title
          ),
          event:event_id (
            id,
            title
          )
        `)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('notification_sent_at', { ascending: false });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      return { 
        success: false,
        error: error.message || 'Failed to fetch notifications',
        data: []
      };
    }
  }
}

export const notificationService = new NotificationService(); 