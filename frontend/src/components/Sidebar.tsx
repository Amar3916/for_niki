import { useState } from "react";
import { Clock, Search, Download, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatHistoryItem {
  id: string;
  query: string;
  timestamp: string;
}

interface SidebarProps {
  taskHistory: ChatHistoryItem[];
  selectedTask: string | null;
  onTaskSelect: (taskId: string) => void;
  onClearHistory: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ 
  taskHistory, 
  selectedTask, 
  onTaskSelect, 
  onClearHistory,
  collapsed,
  onToggleCollapse 
}: SidebarProps) {
  return (
    <div
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-80"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <h2 className="text-sm font-semibold text-sidebar-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Chat History
          </h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0 hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Task History */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {taskHistory.map((task) => (
            <div
              key={task.id}
              onClick={() => onTaskSelect(task.id)}
              className={cn(
                "group relative rounded-lg border border-transparent p-3 cursor-pointer transition-colors hover:bg-sidebar-accent",
                selectedTask === task.id && "bg-sidebar-accent border-sidebar-ring",
                collapsed && "p-2"
              )}
            >
              {collapsed ? (
                <div className="flex justify-center">
                  <Search className="h-4 w-4 text-sidebar-foreground" />
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-sidebar-foreground truncate">
                        {task.query}
                      </p>
                      <p className="text-xs text-sidebar-foreground/60 mt-1">
                        {new Date(task.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      {!collapsed && taskHistory.length > 0 && (
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        </div>
      )}
    </div>
  );
}