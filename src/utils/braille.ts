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
  event_name: string;
}

export function convertTaskToBraille(task: TaskBrailleData): string {
  try {
    // Function to format date in braille
    const formatDate = (date: string | null | undefined): string => {
      if (!date) return braille.toBraille('No due date');
      try {
        // Just convert the date string directly to braille
        return braille.toBraille(date);
      } catch (error) {
        console.error('Error formatting date:', error);
        return braille.toBraille('Invalid date');
      }
    };

    // Convert labels and content separately to ensure everything is in braille
    const labels = {
      task: braille.toBraille("Task"),
      description: braille.toBraille("Description"),
      status: braille.toBraille("Status"),
      priority: braille.toBraille("Priority"),
      dueDate: braille.toBraille("Due Date"),
      assignedTo: braille.toBraille("Assigned To")
    };

    const content = {
      title: braille.toBraille(task.title),
      description: braille.toBraille(task.description || 'No description'),
      status: braille.toBraille(task.status),
      priority: braille.toBraille(task.priority),
      dueDate: formatDate(task.due_date),
      assignedTo: braille.toBraille(task.assignee ? task.assignee.name : 'Unassigned')
    };

    // Create an array of lines and join with actual newlines
    const brailleLines = [
      braille.toBraille(`Event: ${task.event_name}`),
      braille.toBraille(`Task: ${task.title}`),
      braille.toBraille(`Description: ${task.description || 'No description'}`),
      braille.toBraille(`Status: ${task.status}`),
      braille.toBraille(`Priority: ${task.priority}`),
      braille.toBraille(`Assigned to: ${task.assignee ? task.assignee.name : 'Unassigned'}`)
    ];

    // Join with literal newlines and ensure proper line separation
    return brailleLines.join('\r\n\r\n');
  } catch (error) {
    console.error('Error converting task to braille:', error);
    return braille.toBraille('Error converting to braille. Please try again.');
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