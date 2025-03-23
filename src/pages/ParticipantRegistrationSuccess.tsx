// ParticipantRegistrationSuccess.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react'; // Success icon
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';

const ParticipantRegistrationSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col mt-12">
      <LandingHeader />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" /> {/* Success icon */}
          <h1 className="text-2xl font-bold mb-2">Registration Successful!</h1>
          <p className="text-muted-foreground mb-6">
            You've been registered for the event. Check your email for confirmation.
          </p>
          <Button onClick={() => navigate('/events')}>
            View More Events
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ParticipantRegistrationSuccess;