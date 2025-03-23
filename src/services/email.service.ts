import emailjs from '@emailjs/browser';

// EmailJS configuration
// Sign up at https://www.emailjs.com/ and get your own service ID, template ID, and user ID
const SERVICE_ID = 'service_samarthanam';
const TEMPLATE_ID_TASK_ASSIGNMENT = 'template_task_assignment';
const USER_ID = 'your_emailjs_user_id'; // Replace with actual User ID

export interface EmailParams {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
  task_name?: string;
  event_name?: string;
  deadline?: string;
  accept_url?: string;
  reject_url?: string;
}

/**
 * Initializes EmailJS with the user ID
 */
export const initEmailJS = () => {
  emailjs.init(USER_ID);
};

/**
 * Sends a task assignment notification email
 * 
 * @param params Email parameters
 * @returns Promise with the email send result
 */
export const sendTaskAssignmentEmail = async (params: EmailParams): Promise<{ success: boolean; error?: any }> => {
  try {
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID_TASK_ASSIGNMENT, params);
    console.log('Email sent successfully:', result.text);
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};

/**
 * Sends a general notification email
 * 
 * @param params Email parameters
 * @returns Promise with the email send result
 */
export const sendNotificationEmail = async (params: EmailParams): Promise<{ success: boolean; error?: any }> => {
  try {
    // You can create additional templates in EmailJS for different types of notifications
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID_TASK_ASSIGNMENT, params);
    console.log('Notification email sent successfully:', result.text);
    return { success: true };
  } catch (error) {
    console.error('Failed to send notification email:', error);
    return { success: false, error };
  }
};

/**
 * Generate accept/reject URLs with encoded token for security
 * 
 * @param taskAssignmentId The task assignment ID
 * @param volunteerId The volunteer ID
 * @returns Object containing accept and reject URLs
 */
export const generateTaskResponseUrls = (taskAssignmentId: string, volunteerId: string) => {
  // Create a simple encoded token for verification
  const token = Buffer.from(`${taskAssignmentId}:${volunteerId}:${Date.now()}`).toString('base64');
  
  // Generate the full URLs including the token
  const baseUrl = window.location.origin;
  const acceptUrl = `${baseUrl}/volunteer/task-response?action=accept&id=${taskAssignmentId}&token=${token}`;
  const rejectUrl = `${baseUrl}/volunteer/task-response?action=reject&id=${taskAssignmentId}&token=${token}`;
  
  return { acceptUrl, rejectUrl };
};

export const emailService = {
  initEmailJS,
  sendTaskAssignmentEmail,
  sendNotificationEmail,
  generateTaskResponseUrls
}; 