import { useState, useCallback, useEffect } from "react";
import { Brain, Sparkles } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ChatInterface, Message } from "@/components/ChatInterface";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const Index = ({ history, onSelectChat, selectedChat }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedChat) {
      const transformedResults = {
        query: selectedChat.query,
        items: selectedChat.results.map((item: any) => ({
          id: item.id.toString(),
          title: item.text,
          description: "",
          url: "",
          price: "",
          rating: 0,
          image: "",
          metadata: {}
        })),
        totalFound: selectedChat.results.length,
        executionTime: 0
      };
      const assistantMessage: Message = {
        id: selectedChat.id,
        type: "assistant",
        content: `I found ${selectedChat.results.length} results for your query. Here's what I discovered:`,
        timestamp: new Date(selectedChat.timestamp),
        results: transformedResults
      };
      setMessages([
        {
          id: `user-${selectedChat.id}`,
          type: "user",
          content: selectedChat.query,
          timestamp: new Date(selectedChat.timestamp)
        },
        assistantMessage
      ]);
    }
  }, [selectedChat]);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/executeTask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content })
      });

      if (!response.ok) {
        console.error("Network error:", response.status, await response.text());
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: "I encountered a network error. Please check the server and try again.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        toast({
          title: "Network Error",
          description: `Server returned status ${response.status}.`,
          variant: "destructive",
        });
        return;
      }

      const text = await response.text();
      let data;
      try {
        // Check if the response starts with '<' which indicates HTML instead of JSON
        if (text.trim().startsWith('<')) {
          console.error("Received HTML instead of JSON", text);
          toast({
            title: "Response Error",
            description: `Server returned HTML instead of JSON. Check server logs.`,
            variant: "destructive",
          });
          return;
        }
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON", e, text);
        toast({
          title: "JSON Error",
          description: `Failed to parse JSON response from server.`,
          variant: "destructive",
        });
        return;
      }
      const rawResults = data?.results || [];
      const transformedResults = {
        query: content,
        items: rawResults.map((item: any) => ({
          id: item.id.toString(),
          title: item.text,
          description: "",
          url: "",
          price: "",
          rating: 0,
          image: "",
          metadata: {}
        })),
        totalFound: rawResults.length,
        executionTime: 0
      };

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I found some results for you:",
        timestamp: new Date(),
        results: transformedResults
      };

      setMessages(prev => [...prev, assistantMessage]);

      toast({
        title: "Task Completed",
        description: `Found ${rawResults.length} results successfully.`,
      });

    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I encountered an error while processing your request. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCurrentProgress(0);
    }
  }, [toast]);

  const handleVoiceInput = useCallback(() => {
    toast({
      title: "Voice Input",
      description: "Voice input feature coming soon!",
    });
  }, [toast]);

  const handleClearHistory = useCallback(() => {
    // This should be handled by a backend call to delete history
    toast({
      title: "History Cleared",
      description: "All task history has been removed.",
    });
  }, [toast]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar
        taskHistory={history}
        selectedTask={selectedChat ? selectedChat.id : null}
        onTaskSelect={onSelectChat}
        onClearHistory={handleClearHistory}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">Web Navigator AI Agent</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm">
              <Sparkles className="s-cent4 mr-2" />
              Upgrade Plan
            </Button>
          </div>
        </header>
        <ChatInterface
          messages={messages}
          isLoading={isLoading}
          currentProgress={currentProgress}
          onSendMessage={handleSendMessage}
          onVoiceInput={handleVoiceInput}
        />
      </div>
    </div>
  );
};

export default Index;
