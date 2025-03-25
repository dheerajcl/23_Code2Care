import braille from 'braille';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type TaskBrailleData = {
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  assignee?: {
    name: string;
  };
  event_name?: string;
};

type TaskTextContent = {
  braille: string;
  original: string;
};

// First, we need to ensure we have a font that supports braille
const BRAILLE_FONT_URL = 'https://cdn.jsdelivr.net/npm/braille-font@1.0.0/BrailleFont.ttf';

async function loadBrailleFont() {
  try {
    const response = await fetch(BRAILLE_FONT_URL);
    const fontData = await response.arrayBuffer();
    return fontData;
  } catch (error) {
    console.error('Error loading braille font:', error);
    return null;
  }
}

export function convertTaskToBraille(task: TaskBrailleData): TaskTextContent {
  try {
    // Create original text lines
    const originalLines = [
      `Event: ${task.event_name}`,
      `Task: ${task.title}`,
      `Description: ${task.description || 'No description'}`,
      `Status: ${task.status}`,
      `Priority: ${task.priority}`,
      `Assigned to: ${task.assignee ? task.assignee.name : 'Unassigned'}`
    ];

    // Create braille lines
    const brailleLines = originalLines.map(line => braille.toBraille(line));

    return {
      braille: brailleLines.join('\r\n\r\n'),
      original: originalLines.join('\r\n\r\n')
    };
  } catch (error) {
    console.error('Error converting to braille:', error);
    const errorMsg = 'Error converting to braille. Please try again.';
    return {
      braille: braille.toBraille(errorMsg),
      original: errorMsg
    };
  }
}

export async function downloadBraille(content: TaskTextContent, filename: string, type: 'pdf' | 'txt' = 'txt') {
  try {
    if (type === 'pdf') {
      // Create a temporary div to hold the content
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 800px;
        padding: 20px;
        font-family: Arial, sans-serif;
      `;
      
      // Add content to the div with styling
      tempDiv.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 20px;">Task Details</div>
        ${content.braille.split('\r\n\r\n').map(line => `
          <div style="font-size: 18px; margin-bottom: 30px; white-space: pre-wrap;">${line}</div>
        `).join('')}
      `;
      
      document.body.appendChild(tempDiv);

      try {
        // Convert the div to canvas
        const canvas = await html2canvas(tempDiv, {
          scale: 2, // Higher resolution
          useCORS: true,
          logging: false,
          width: 800,
          height: tempDiv.offsetHeight
        });

        // Convert canvas to PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [800, tempDiv.offsetHeight]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, 800, tempDiv.offsetHeight);
        pdf.save(`${filename}.pdf`);
      } finally {
        // Clean up
        document.body.removeChild(tempDiv);
      }
    } else {
      // Download as txt file containing Unicode braille characters
      const blob = new Blob([content.braille], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
} 