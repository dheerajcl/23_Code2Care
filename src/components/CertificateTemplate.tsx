import React from 'react';
import SamarthanamLogo from '../assets/samarthanam_logo.png';

interface CertificateData {
  volunteerName: string;
  hoursCompleted: number;
  date: string;
  organizationName: string;
  eventName: string;
  eventDate: string;
}

interface CertificateTemplateProps {
  data: CertificateData;
  ref?: React.Ref<HTMLDivElement>;
}

export const CertificateTemplate = React.forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ data }, ref) => {
    return (
      <div 
        ref={ref} 
        className="w-[960px] h-[600px] bg-white border-2 border-gray-200 p-12 relative overflow-hidden bg-gradient-to-br from-red-50 to-white"
        id="certificate-template"
      >
        {/* Watermark */}
        <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
          <div className="text-[120px] font-bold text-gray-300 rotate-[-15deg] select-none">
            SAMARTHANAM
          </div>
        </div>
        
        {/* Certificate Border */}
        <div className="absolute inset-6 border-4 border-yellow-400 rounded-xl pointer-events-none"></div>
        
        {/* Header with Logo */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <img 
              src={SamarthanamLogo} 
              alt="Samarthanam Trust Logo" 
              className="w-20 h-20 mr-4 object-contain"
            />
            <div className="text-left">
              <h2 className="text-xl font-bold text-red-800">Samarthanam Trust</h2>
              <p className="text-sm text-red-800">For the disabled</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Certificate ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
            </p>
            <p className="text-sm font-medium text-gray-700">{data.eventName}</p>
            <p className="text-xs text-gray-500">{data.eventDate}</p>
          </div>
        </div>
        
        {/* Certificate Content */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 mt-4">
          <h1 className="text-4xl font-bold text-red-800">CERTIFICATE OF APPRECIATION</h1>
          <div className="w-32 h-1 bg-yellow-400"></div>
          <p className="text-lg text-gray-600">This certificate is awarded to</p>
          
          <h2 className="text-4xl font-bold text-red-700 py-2 px-8 border-b-4 border-yellow-400">
            {data.volunteerName}
          </h2>
          
          <p className="text-xl max-w-2xl leading-relaxed text-gray-800">
            In grateful recognition of your dedicated service of <span className="font-bold">{data.hoursCompleted} hours </span> 
            as a volunteer for <span className="font-bold">{data.eventName}</span>, demonstrating 
            outstanding commitment to our cause.
          </p>
          
          <p className="text-lg text-gray-700">
            Your contributions have made a meaningful difference in the lives of those we serve.
          </p>
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 px-12">
          <div className="flex justify-between items-end">
            <div className="text-left">
              <p className="font-bold text-gray-700">{data.date}</p>
              <p className="text-sm text-gray-500">Date of Issue</p>
            </div>
            <div className="text-center">
              <div className="h-20 w-48 mx-auto mb-2 flex items-end justify-center">
                <p className="text-xs text-gray-500 pb-1 ml-4">Authorized Signature</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-700">Samarthanam</p>
              <p className="text-sm text-gray-500">Organization</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';