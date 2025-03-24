import React, { useState, useRef } from 'react';
import { Mic, MicOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WriteByVoiceProps {
  onTranscriptChange: (transcript: string) => void;
  targetElementId?: string;
}

const WriteByVoice: React.FC<WriteByVoiceProps> = ({ 
  onTranscriptChange,
  targetElementId 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [status, setStatus] = useState('');
  const recognitionRef = useRef<any>(null);

  // Check if speech recognition is supported
  const checkSupportAndInitialize = () => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setIsSupported(false);
      return false;
    }
    
    // Initialize speech recognition if not already
    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
      
      // Set up event handlers
      recognitionRef.current.onstart = () => {
        setStatus('listening, please speak...');
      };
      
      recognitionRef.current.onspeechend = () => {
        setStatus('stopped listening, hope you are done...');
        stopListening();
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setStatus(`Error: ${event.error}`);
        stopListening();
      };
      
      recognitionRef.current.onresult = (event: any) => {
        const transcriptText = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        setTranscript(transcriptText);
        onTranscriptChange(transcriptText);
        
        // Update target element if specified
        if (targetElementId) {
          const targetElement = document.getElementById(targetElementId) as HTMLInputElement | HTMLTextAreaElement;
          if (targetElement) {
            targetElement.value = transcriptText;
            
            // Dispatch input event to trigger any listeners
            const inputEvent = new Event('input', { bubbles: true });
            targetElement.dispatchEvent(inputEvent);
          }
        }
      };
    }
    
    return true;
  };

  const startListening = () => {
    if (!checkSupportAndInitialize()) return;
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setStatus('Failed to start. Try again.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    setIsListening(false);
  };

  const clearTranscript = () => {
    setTranscript('');
    onTranscriptChange('');
    
    if (targetElementId) {
      const targetElement = document.getElementById(targetElementId) as HTMLInputElement | HTMLTextAreaElement;
      if (targetElement) {
        targetElement.value = '';
        
        // Dispatch input event
        const event = new Event('input', { bubbles: true });
        targetElement.dispatchEvent(event);
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="text-destructive text-sm">
        Voice recognition is not supported in your browser.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Button
          onClick={isListening ? stopListening : startListening}
          variant={isListening ? "destructive" : "default"}
          size="sm"
          className={isListening ? "bg-red-600 hover:bg-red-700 w-full" : "w-full"}
          aria-label={isListening ? "Stop voice input" : "Start voice input"}
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4 mr-1" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-1" />
              <span>Start</span>
            </>
          )}
        </Button>
        
        {transcript && (
          <Button
            onClick={clearTranscript}
            variant="outline"
            size="sm"
            aria-label="Clear transcript"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {isListening && (
        <div className="mt-2 p-3 bg-secondary rounded-md text-sm max-w-md">
          <p className="font-medium text-xs mb-1" id="status">{status}</p>
          <p className={transcript ? "text-foreground" : "text-muted-foreground italic"}>
            {transcript || "Speak now..."}
          </p>
        </div>
      )}
    </div>
  );
};

export default WriteByVoice;

// Add these type definitions to support the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}