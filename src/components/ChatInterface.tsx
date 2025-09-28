import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { InputArea } from "./InputArea";
import { ResultsDisplay } from "./ResultsDisplay";

export interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  results?: any;
  progress?: number;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onVoiceInput: () => void;
  isLoading: boolean;
  currentProgress?: number;
}

export function ChatInterface({ 
  messages, 
  onSendMessage, 
  onVoiceInput, 
  isLoading,
  currentProgress 
}: ChatInterfaceProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gradient-glow rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <div className="text-2xl">🤖</div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Welcome to Web Navigator AI
              </h3>
              <p className="text-foreground-muted max-w-md mx-auto">
                Tell me what you'd like to search for or navigate on the web. 
                I can help you find information, compare products, or explore websites.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="animate-fade-in">
                <MessageBubble message={message} />
                {message.results && (
                  <div className="mt-4">
                    <ResultsDisplay 
                      results={message.results} 
                      onDownload={(format) => {
                        // Handle download
                        console.log(`Downloading as ${format}`);
                      }}
                    />
                  </div>
                )}
              </div>
            ))
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="animate-fade-in">
              <MessageBubble 
                message={{
                  id: "loading",
                  type: "assistant",
                  content: "Processing your request...",
                  timestamp: new Date(),
                  isLoading: true,
                  progress: currentProgress
                }}
              />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border bg-background-secondary">
        <div className="max-w-4xl mx-auto p-6">
          <InputArea 
            onSend={onSendMessage}
            onVoiceInput={onVoiceInput}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}