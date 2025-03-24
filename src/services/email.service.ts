import emailjs from '@emailjs/browser';

// EmailJS configuration
// Using environment variables for EmailJS credentials
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID_TASK_ASSIGNMENT = import.meta.env.VITE_EMAILJS_TASK_TEMPLATE_ID;
const TEMPLATE_ID_TASK_RESPONSE = import.meta.env.VITE_EMAILJS_RESPONSE_TEMPLATE_ID;
const USER_ID = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Log EmailJS configuration at module initialization
console.log('EmailJS Configuration:', {
  SERVICE_ID: SERVICE_ID || 'Not set',
  TEMPLATE_ID_TASK_ASSIGNMENT: TEMPLATE_ID_TASK_ASSIGNMENT || 'Not set',
  TEMPLATE_ID_TASK_RESPONSE: TEMPLATE_ID_TASK_RESPONSE || 'Not set',
  USER_ID: USER_ID ? 'Set' : 'Not set'
});

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
  volunteer_name?: string;
  status?: string;
  status_class?: string;
  dashboard_url?: string;
  // Add any additional fields you need here
  [key: string]: string | undefined; // Index signature to allow any string keys
}

// Track initialization state
let isInitialized = false;

/**
 * Initializes EmailJS with the user ID
 */
export const initEmailJS = () => {
  if (!USER_ID) {
    console.error('EmailJS initialization failed: USER_ID (public key) is not set in environment variables');
    return false;
  }
  
  if (!isInitialized) {
    try {
      emailjs.init(USER_ID);
      isInitialized = true;
      console.log('EmailJS initialized successfully');
      return true;
    } catch (error) {
      console.error('EmailJS initialization failed:', error);
      return false;
    }
  }
  
  return true; // Already initialized
};

/**
 * Sends a task assignment notification email
 * 
 * @param params Email parameters
 * @returns Promise with the email send result
 */
export const sendTaskAssignmentEmail = async (params: EmailParams): Promise<{ success: boolean; error?: unknown }> => {
  try {
    // Validate required parameters
    const requiredFields = ['to_email', 'to_name', 'task_name', 'event_name'];
    for (const field of requiredFields) {
      if (!params[field]) {
        console.error(`Missing required email parameter: ${field}`);
        return { success: false, error: `Missing required field: ${field}` };
      }
    }
    
    // Validate email format
    if (!params.to_email.includes('@')) {
      console.error('Invalid email format:', params.to_email);
      return { success: false, error: 'Invalid email format' };
    }
    
    // Initialize EmailJS if not already
    initEmailJS();
    
    // Send the email
    console.log('Sending task assignment email to:', params.to_email);
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID_TASK_ASSIGNMENT,
      params,
      USER_ID
    );
    
    if (response.status === 200) {
      console.log('Email sent successfully:', response);
      return { success: true };
    } else {
      console.error('Email sending failed with status:', response.status);
      return { success: false, error: response.text };
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sends a task response notification email to admin
 * 
 * @param params Email parameters
 * @returns Promise with the email send result
 */
export const sendTaskResponseEmail = async (params: EmailParams): Promise<{ success: boolean; error?: unknown }> => {
  try {
    if (!initEmailJS()) {
      return { 
        success: false, 
        error: new Error('EmailJS not properly initialized. Check environment variables.') 
      };
    }
    
    if (!SERVICE_ID || !TEMPLATE_ID_TASK_RESPONSE) {
      console.error('Missing EmailJS configuration:', { 
        SERVICE_ID: SERVICE_ID || 'Missing', 
        TEMPLATE_ID_TASK_RESPONSE: TEMPLATE_ID_TASK_RESPONSE || 'Missing' 
      });
      return { 
        success: false, 
        error: new Error('Missing EmailJS service ID or template ID') 
      };
    }
    
    console.log('Sending task response email to:', params.to_email);
    
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID_TASK_RESPONSE, params);
    console.log('Task response email sent successfully:', result.text);
    return { success: true };
  } catch (error) {
    console.error('Failed to send task response email:', error);
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
  
  console.log('Generated response URLs:', { acceptUrl, rejectUrl });
  
  return { acceptUrl, rejectUrl };
};

export const emailService = {
  initEmailJS,
  sendTaskAssignmentEmail,
  sendTaskResponseEmail,
  generateTaskResponseUrls
}; 