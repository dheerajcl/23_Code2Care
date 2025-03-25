import braille from 'braille';

export interface TaskBrailleData {
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  assignee?: {
    name: string;
  };
}

export function convertTaskToBraille(task: TaskBrailleData): string {
  try {
    const taskDetails = `
Task: ${task.title}
Description: ${task.description || 'No description'}
Status: ${task.status}
Priority: ${task.priority}
Due Date: ${task.due_date || 'No due date'}
${task.assignee ? `Assigned to: ${task.assignee.name}` : 'Unassigned'}
    `.trim();

    return braille.toBraille(taskDetails);
  } catch (error) {
    console.error('Error converting task to braille:', error);
    return 'Error converting to braille. Please try again.';
  }
}

export function downloadBraille(text: string, filename: string): void {
  try {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading braille file:', error);
    alert('Failed to download braille file. Please try again.');
  }
} 