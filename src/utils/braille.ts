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
    // Format date properly before converting to braille
    const formatDate = (date: string | null | undefined): string => {
      if (!date) return braille.toBraille('No due date');
      try {
        const d = new Date(date);
        // Get month in short format and convert to braille
        const month = braille.toBraille(d.toLocaleString('en-US', { month: 'short' }).toLowerCase());
        
        // Convert numbers directly using braille number patterns
        const brailleNumbers = {
          '0': '⠚', '1': '⠁', '2': '⠃', '3': '⠉', '4': '⠙',
          '5': '⠑', '6': '⠋', '7': '⠛', '8': '⠓', '9': '⠊'
        };
        
        // Convert day and year to braille numbers
        const dayStr = d.getDate().toString().padStart(2, '0');
        const yearStr = d.getFullYear().toString();
        
        // Convert numbers to braille with number signs for both day and year
        const day = '⠼' + dayStr.split('').map(d => brailleNumbers[d]).join('');
        const year = '⠼' + yearStr.split('').map(d => brailleNumbers[d]).join('');
        
        // Combine with proper spacing and punctuation
        return `${month}⠀${day}⠂⠀${year}`;
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

    // Convert each section separately and combine with proper braille spacing
    const brailleContent = [
      `${labels.task}⠒⠀${content.title}`,
      `${labels.description}⠒⠀${content.description}`,
      `${labels.status}⠒⠀${content.status}`,
      `${labels.priority}⠒⠀${content.priority}`,
      `${labels.dueDate}⠒⠀${content.dueDate}`,
      `${labels.assignedTo}⠒⠀${content.assignedTo}`
    ].join('\n\n');

    return brailleContent;
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