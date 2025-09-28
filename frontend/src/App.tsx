import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [history, setHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/chats")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.text().then(text => {
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error("JSON Parse Error:", e, "Response text:", text);
            return [];
          }
        });
      })
      .then((data) => setHistory(data?.chats || []))
      .catch(error => {
        console.error("Fetch error:", error);
        setHistory([]);
      });
  }, []);

  const handleSelectChat = (chatId: string) => {
    fetch(`http://localhost:8000/api/chats/${chatId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.text().then(text => {
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error("JSON Parse Error:", e, "Response text:", text);
            return null;
          }
        });
      })
      .then((data) => setSelectedChat(data))
      .catch(error => {
        console.error("Fetch error:", error);
        setSelectedChat(null);
      });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route
              path="/"
              element={
                <Index
                  history={history}
                  onSelectChat={handleSelectChat}
                  selectedChat={selectedChat}
                />
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
