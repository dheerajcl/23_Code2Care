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

// Check for expected environment variables
if (!SERVICE_ID || !TEMPLATE_ID_TASK_ASSIGNMENT || !USER_ID) {
  console.error('WARNING: Missing required EmailJS configuration. Email functionality will not work correctly.');
  console.error('Make sure these environment variables are set:');
  console.error('- VITE_EMAILJS_SERVICE_ID');
  console.error('- VITE_EMAILJS_TASK_TEMPLATE_ID');
  console.error('- VITE_EMAILJS_PUBLIC_KEY');
}

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
  has_message?: string | boolean;
  // Add any additional fields you need here
  [key: string]: string | undefined | boolean; // Index signature to allow any string keys
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
  
  if (!SERVICE_ID) {
    console.error('EmailJS initialization failed: SERVICE_ID is not set in environment variables');
    return false;
  }
  
  if (!TEMPLATE_ID_TASK_ASSIGNMENT) {
    console.error('EmailJS initialization failed: TEMPLATE_ID_TASK_ASSIGNMENT is not set in environment variables');
    return false;
  }
  
  if (!isInitialized) {
    try {
      emailjs.init(USER_ID);
      isInitialized = true;
      console.log('EmailJS initialized successfully with user ID:', USER_ID.substring(0, 5) + '...');
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
    const requiredFields = ['to_email', 'to_name', 'task_name', 'event_name', 'accept_url', 'reject_url'];
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
    const initialized = initEmailJS();
    if (!initialized) {
      console.error('EmailJS not properly initialized');
      return { success: false, error: 'EmailJS not properly initialized' };
    }
    
    // Validate service and template IDs
    if (!SERVICE_ID) {
      console.error('Missing EmailJS SERVICE_ID');
      return { success: false, error: 'Missing EmailJS SERVICE_ID' };
    }
    
    if (!TEMPLATE_ID_TASK_ASSIGNMENT) {
      console.error('Missing EmailJS TEMPLATE_ID_TASK_ASSIGNMENT');
      return { success: false, error: 'Missing EmailJS TEMPLATE_ID_TASK_ASSIGNMENT' };
    }
    
    // Send the email
    console.log('Sending task assignment email to:', params.to_email);
    console.log('Using template ID:', TEMPLATE_ID_TASK_ASSIGNMENT);
    console.log('Using service ID:', SERVICE_ID);
    
    // Prepare template parameters - ensure we're using the exact parameter names expected by EmailJS
    // NOTE: EmailJS requires specific fields for recipient depending on the template setup
    const templateParams = {
      // IMPORTANT: For EmailJS, sometimes it needs this specific field for recipient
      // This is a critical fix for the "recipients address is empty" error
      email: params.to_email,
      recipient: params.to_email,
      reply_to: params.to_email,
      to: params.to_email,
      to_email: params.to_email,
      to_name: params.to_name,
      from_name: "Samarthanam Trust",
      subject: params.subject || `New Task Assignment: ${params.task_name}`,
      task_name: params.task_name,
      event_name: params.event_name,
      task_description: params.task_description || '',
      deadline: params.deadline || 'Not specified',
      accept_url: params.accept_url,
      reject_url: params.reject_url,
      // Include any additional parameters from the original object
      ...params
    };
    
    console.log('Final template parameters:', JSON.stringify(templateParams));
    
    try {
      const response = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID_TASK_ASSIGNMENT,
        templateParams, // Use our enhanced template parameters
        USER_ID
      );
      
      if (response.status === 200) {
        console.log('Email sent successfully:', response);
        return { success: true };
      } else {
        console.error('Email sending failed with status:', response.status);
        return { success: false, error: response.text };
      }
    } catch (sendError) {
      // Analyze the error to provide more helpful information
      const errorMsg = sendError.message || 'Email sending failed';
      console.error('EmailJS send error:', sendError);
      
      // Special handling for recipient errors
      if (errorMsg.includes('recipient') || errorMsg.includes('address is empty')) {
        console.error('RECIPIENT ERROR: This usually means the template is expecting a specific field name for the email address.');
        console.error('Current fields we tried:', {
          email: templateParams.email,
          to_email: templateParams.to_email,
          recipient: templateParams.recipient,
          reply_to: templateParams.reply_to,
          to: templateParams.to
        });
        console.error('Check your EmailJS template and make sure it matches one of these parameter names.');
      }
      
      return { success: false, error: errorMsg };
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
    
    // Prepare template parameters - ensure we're using the exact parameter names expected by EmailJS
    const templateParams = {
      // Add multiple recipient field names for EmailJS
      email: params.to_email,
      recipient: params.to_email,
      reply_to: params.to_email,
      to: params.to_email,
      to_email: params.to_email,
      to_name: params.to_name,
      from_name: "Samarthanam Trust",
      subject: params.subject || "Task Response Notification",
      // Handle message conditional
      message: params.message || '',
      has_message: params.message ? 'true' : 'false',
      // Include all other parameters
      ...params
    };
    
    console.log('Task response email template parameters:', JSON.stringify(templateParams));
    
    try {
      const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID_TASK_RESPONSE, templateParams);
      console.log('Task response email sent successfully:', result.text);
      return { success: true };
    } catch (sendError) {
      // Analyze the error to provide more helpful information
      const errorMsg = sendError.message || 'Email sending failed';
      console.error('EmailJS send error:', sendError);
      
      // Special handling for recipient errors
      if (errorMsg.includes('recipient') || errorMsg.includes('address is empty')) {
        console.error('RECIPIENT ERROR: This usually means the template is expecting a specific field name for the email address.');
        console.error('Current fields we tried:', {
          email: templateParams.email,
          to_email: templateParams.to_email,
          recipient: templateParams.recipient,
          reply_to: templateParams.reply_to,
          to: templateParams.to
        });
        console.error('Check your EmailJS template and make sure it matches one of these parameter names.');
      }
      
      // Special handling for template variable errors
      if (errorMsg.includes('template') || errorMsg.includes('variables')) {
        console.error('TEMPLATE VARIABLE ERROR: Some of the dynamic variables in your template might be missing or corrupted.');
        console.error('Sent parameters:', templateParams);
        console.error('Suggested fix: Update your template to use simple {{ variable }} syntax and avoid complex conditionals.');
      }
      
      return { success: false, error: sendError };
    }
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

/**
 * Helper function to log template parameters to help debug email issues
 */
export const debugTemplate = async (templateId: string): Promise<void> => {
  if (!USER_ID || !SERVICE_ID) {
    console.error('Cannot debug template: Missing EmailJS configuration');
    return;
  }
  
  console.log(`Attempting to debug template: ${templateId}`);
  
  try {
    // Create a test email with all possible field combinations
    const testParams = {
      // Standard recipient fields - trying different variations
      to_email: 'test@example.com',
      email: 'test@example.com',
      recipient: 'test@example.com',
      reply_to: 'test@example.com',
      // Other common fields
      to_name: 'Test User',
      from_name: 'Samarthanam Test',
      subject: 'Test Email',
      message: 'This is a test message',
      // Task fields
      task_name: 'Test Task',
      event_name: 'Test Event',
      task_description: 'Test Description',
      deadline: 'Tomorrow',
      // URLs
      accept_url: 'http://localhost:8080/accept',
      reject_url: 'http://localhost:8080/reject',
      // Status info
      status: 'Pending',
      status_class: 'pending'
    };
    
    console.log('Sending test email with parameters:', testParams);
    
    // We're not actually sending, just logging
    console.log('EmailJS would send with:', {
      serviceId: SERVICE_ID,
      templateId: templateId,
      userId: USER_ID.substring(0, 5) + '...',
      params: testParams
    });
    
    // Log common issues
    console.log('Common EmailJS template issues to check:');
    console.log('1. Make sure your template uses {{email}} or {{to_email}} for recipient');
    console.log('2. Verify template ID matches what\'s in your EmailJS dashboard');
    console.log('3. Check service ID matches your EmailJS service');
    console.log('4. Ensure your EmailJS template is active/enabled');
    
  } catch (error) {
    console.error('Error while debugging template:', error);
  }
};

/**
 * Verifies the EmailJS configuration and provides detailed diagnostics
 * Use this when troubleshooting email sending issues
 */
export const verifyEmailJSConfiguration = (): boolean => {
  const issues = [];
  
  // Check the environment variables
  if (!SERVICE_ID) {
    issues.push('Missing VITE_EMAILJS_SERVICE_ID environment variable');
  }
  
  if (!TEMPLATE_ID_TASK_ASSIGNMENT) {
    issues.push('Missing VITE_EMAILJS_TASK_TEMPLATE_ID environment variable');
  }
  
  if (!USER_ID) {
    issues.push('Missing VITE_EMAILJS_PUBLIC_KEY environment variable');
  }
  
  const isValid = issues.length === 0;
  
  if (!isValid) {
    console.error('=============================================');
    console.error('EmailJS Configuration Issues Found:');
    issues.forEach(issue => console.error(`- ${issue}`));
    console.error('=============================================');
    console.error('Recommendations to fix:');
    console.error('1. Check your .env file contains all required variables');
    console.error('2. Verify the variable names match exactly what EmailJS expects');
    console.error('3. Restart your development server after making changes');
    console.error('4. Check your EmailJS dashboard for correct service and template IDs');
    console.error('=============================================');
  } else {
    console.log('EmailJS configuration valid!');
    console.log(`- Service ID: ${SERVICE_ID.substring(0, 5)}...`);
    console.log(`- Task Template ID: ${TEMPLATE_ID_TASK_ASSIGNMENT.substring(0, 5)}...`);
    console.log(`- Response Template ID: ${TEMPLATE_ID_TASK_RESPONSE?.substring(0, 5) || 'Not Set'}...`);
    console.log(`- User ID: ${USER_ID.substring(0, 5)}...`);
  }
  
  return isValid;
};

// Export the emailService object
export const emailService = {
  initEmailJS,
  sendTaskAssignmentEmail,
  sendTaskResponseEmail,
  generateTaskResponseUrls,
  debugTemplate,
  verifyEmailJSConfiguration
}; 