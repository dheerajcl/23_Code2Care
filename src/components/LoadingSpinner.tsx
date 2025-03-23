import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = 'primary',
  text = 'Loading...',
  fullPage = false
}) => {
  // Size mapping
  const sizeMap = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };
  
  // Color mapping
  const colorMap = {
    primary: 'text-blue-600',
    secondary: 'text-purple-600',
    white: 'text-white'
  };
  
  const spinnerSize = sizeMap[size];
  const spinnerColor = colorMap[color];
  
  // Default container - simple centered flex
  let Container: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col items-center justify-center py-4">
      {children}
    </div>
  );
  
  // Full page container - covers entire page
  if (fullPage) {
    Container = ({ children }) => (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-50">
        {children}
      </div>
    );
  }
  
  return (
    <Container>
      <div className="flex flex-col items-center">
        <div className={`${spinnerSize} ${spinnerColor} animate-spin`}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        {text && <p className={`mt-3 font-medium ${spinnerColor}`}>{text}</p>}
      </div>
    </Container>
  );
};

export default LoadingSpinner; 