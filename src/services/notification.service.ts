import { supabase } from '@/lib/supabase';
import { emailService, EmailParams } from './email.service';
import { getCurrentUser } from './user.service';
import { toast } from '@/components/ui/use-toast';

class NotificationService {
  /**
   * Creates a notification and sends an email for a new task assignment
   * 
   * @param taskAssignmentId ID of the task assignment
   * @param volunteerId ID of the volunteer
   * @param taskId ID of the task
   * @param eventId ID of the event
   */
  async notifyTaskAssignment(
    taskAssignmentId: string,
    volunteerId: string,
    taskId: string,
    eventId: string
  ) {
    try {
      // 1. Get volunteer details
      const { data: volunteerData, error: volunteerError } = await supabase
        .from('volunteer')
        .select('*')
        .eq('id', volunteerId)
        .single();
      
      if (volunteerError) throw volunteerError;
      
      // 2. Get task details
      const { data: taskData, error: taskError } = await supabase
        .from('task')
        .select('*')
        .eq('id', taskId)
        .single();
      
      if (taskError) throw taskError;
      
      // 3. Get event details
      const { data: eventData, error: eventError } = await supabase
        .from('event')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (eventError) throw eventError;
      
      // 4. Create a notification in the database
      const { data: notificationData, error: notificationError } = await supabase
        .from('notification')
        .insert({
          recipient_id: volunteerId,
          task_assignment_id: taskAssignmentId,
          title: `New Task Assignment: ${taskData.title}`,
          message: `You have been assigned a new task "${taskData.title}" for the event "${eventData.title}".`,
          type: 'task_assignment'
        })
        .select()
        .single();
      
      if (notificationError) throw notificationError;
      
      // 5. Update the task_assignment with notification details
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from('task_assignment')
        .update({
          notification_status: 'sent',
          notification_sent_at: now,
        })
        .eq('id', taskAssignmentId);
      
      if (updateError) throw updateError;

      // 6. Generate accept/reject URLs
      const { acceptUrl, rejectUrl } = emailService.generateTaskResponseUrls(taskAssignmentId, volunteerId);
      
      // 7. Send email notification
      const responseDeadline = new Date();
      responseDeadline.setHours(responseDeadline.getHours() + 24);
      
      const emailParams: EmailParams = {
        to_email: volunteerData.email,
        to_name: `${volunteerData.first_name} ${volunteerData.last_name}`,
        subject: `New Task Assignment: ${taskData.title}`,
        message: `You have been assigned a new task "${taskData.title}" for the event "${eventData.title}". Please respond within 24 hours.`,
        task_name: taskData.title,
        event_name: eventData.title,
        deadline: responseDeadline.toLocaleString(),
        accept_url: acceptUrl,
        reject_url: rejectUrl
      };
      
      await emailService.sendTaskAssignmentEmail(emailParams);
      
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
      const { data, error } = await supabase
        .from('notification')
        .select(`
          *,
          task_assignment:task_assignment_id (
            *,
            task:task_id (
              *
            ),
            event:event_id (
              *
            )
          )
        `)
        .eq('recipient_id', volunteerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { data, error: null };
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
        .select('*')
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
        if (counts.hasOwnProperty(status)) {
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