import { cn } from "@/lib/utils";
import { User, Bot, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Message } from "./ChatInterface";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.type === "user";
  const isSystem = message.type === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-muted rounded-lg px-4 py-2 text-sm text-muted-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-design-glow">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
      )}
      
      <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-lg px-4 py-3 max-w-2xl shadow-design-sm transition-all",
            isUser
              ? "bg-gradient-primary text-primary-foreground"
              : "bg-card border border-border text-card-foreground"
          )}
        >
          {message.isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{message.content}</span>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}
          
          {message.progress !== undefined && (
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{Math.round(message.progress)}%</span>
              </div>
              <Progress value={message.progress} className="h-1" />
            </div>
          )}
        </div>
        
        <div className="text-xs text-foreground-subtle mt-1">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <User className="h-4 w-4 text-accent-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}