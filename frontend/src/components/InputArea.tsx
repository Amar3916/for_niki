import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface InputAreaProps {
  onSend: (message: string) => void;
  onVoiceInput: () => void;
  disabled?: boolean;
}

export function InputArea({ onSend, onVoiceInput, disabled }: InputAreaProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window))) {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setMessage(transcript);
        
        // Auto-resize textarea
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current?.start();
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        if (isListening) {
          recognitionRef.current.stop();
        }
      }
    };
  }, [isListening]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    const newIsListening = !isListening;
    setIsListening(newIsListening);
    
    if (recognitionRef.current) {
      if (newIsListening) {
        recognitionRef.current.start();
      } else {
        recognitionRef.current.stop();
      }
    }
    
    onVoiceInput();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  return (
    <div className="space-y-4">
      {/* Input Row */}
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder="Ask me to search, navigate, or find information on the web..."
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            className={cn(
              "min-h-[52px] max-h-[120px] resize-none",
              "bg-card border-input-border focus:border-ring",
              "pr-12 py-4",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          
          {/* Voice Input Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleVoiceToggle}
            disabled={disabled}
            className={cn(
              "absolute right-2 top-2 h-8 w-8 p-0 hover:bg-accent",
              isListening && "bg-primary text-primary-foreground animate-pulse-glow"
            )}
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className={cn(
            "h-[52px] px-6 bg-gradient-primary hover:opacity-90 transition-opacity",
            "shadow-design-md hover:shadow-design-glow",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
      </div>
      
      {/* Example prompts */}
      <div className="flex flex-wrap gap-2">
        {[
          "Search for laptops under ₹50k",
          "Find top 5 smartphones with best cameras",
          "Compare prices for iPhone 15",
          "Search for JavaScript tutorials"
        ].map((prompt) => (
          <Button
            key={prompt}
            variant="ghost"
            size="sm"
            onClick={() => setMessage(prompt)}
            disabled={disabled}
            className="text-xs bg-muted hover:bg-accent text-foreground-muted hover:text-foreground transition-colors"
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
}