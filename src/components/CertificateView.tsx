import React, { useRef } from 'react';
import { CertificateTemplate } from './CertificateTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from './ui/button';

interface CertificateViewProps {
  volunteerData: {
    name: string;
    hours: number;
    eventName?: string;
  };
}

export const CertificateView: React.FC<CertificateViewProps> = ({ volunteerData }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  
  const certificateData = {
    volunteerName: volunteerData.name,
    hoursCompleted: volunteerData.hours,
    date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    organizationName: 'Samarthanam Trust',
    eventName: volunteerData.eventName || 'Community Support Program',
    eventDate: `January 15-20, ${new Date().getFullYear()}`
  };

  const handleDownloadPdf = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 1000,
        height: 700,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'pt', [1000, 700]);
      
      pdf.addImage(imgData, 'PNG', 0, 0, 1000, 700);
      pdf.save(`${certificateData.volunteerName}_Certificate.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Volunteer Certificate</h1>
        <Button
          onClick={handleDownloadPdf}
          className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 mr-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
          Download as PDF
        </Button>
      </div>
      
      <div>
        <CertificateTemplate 
          ref={certificateRef} 
          data={certificateData} 
        />
      </div>
    </div>
  );
};