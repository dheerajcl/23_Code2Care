import * as React from "react"
import { Mic } from "lucide-react"
import { cn } from "@/lib/utils"

// Helper function to combine refs
function useCombinedRefs<T>(...refs: (React.Ref<T> | null)[]) {
  const targetRef = React.useRef<T>(null);

  React.useEffect(() => {
    refs.forEach(ref => {
      if (!ref) return;
      
      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        (ref as React.MutableRefObject<T | null>).current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
}

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const inputId = props.id || React.useId();
    const inputRef = React.useRef<HTMLInputElement>(null);
    const combinedRef = useCombinedRefs(ref, inputRef);
    const [isVoiceEnabled, setIsVoiceEnabled] = React.useState(false);
    
    // Check if voice input is enabled
    React.useEffect(() => {
      const checkVoiceEnabled = () => {
        const voiceEnabled = localStorage.getItem('voice-input') === 'true';
        setIsVoiceEnabled(voiceEnabled);
      };
      
      // Check initially
      checkVoiceEnabled();
      
      // Listen for changes to the voice input setting
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'voice-input') {
          checkVoiceEnabled();
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      // Custom event for when the toggle happens in the same window
      const handleVoiceToggle = () => {
        checkVoiceEnabled();
      };
      
      document.addEventListener('voiceInputToggled', handleVoiceToggle);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        document.removeEventListener('voiceInputToggled', handleVoiceToggle);
      };
    }, []);
    
    const handleVoiceClick = (e: React.MouseEvent) => {
      e.preventDefault();
      // Trigger custom event that AccessibilityMenu will listen for
      const event = new CustomEvent('voiceInputRequested', {
        bubbles: true,
        detail: { targetId: inputId }
      });
      document.dispatchEvent(event);
    };

    return (
      <div className="relative w-full">
        <input
          id={inputId}
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm custom-input",
            isVoiceEnabled && "pr-10",
            className
          )}
          ref={combinedRef}
          {...props}
        />
        {isVoiceEnabled && (
          <button 
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground" 
            onClick={handleVoiceClick}
            aria-label="Voice input"
          >
            <Mic size={16} />
          </button>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }