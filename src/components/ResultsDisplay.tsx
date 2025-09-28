import { useState } from "react";
import { Download, Table, Code, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ResultItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  price?: string;
  rating?: number;
  image?: string;
  metadata?: Record<string, any>;
}

interface ResultsDisplayProps {
  results: {
    query: string;
    items: ResultItem[];
    totalFound: number;
    executionTime?: number;
  };
  onDownload: (format: "csv" | "json") => void;
}

export function ResultsDisplay({ results, onDownload }: ResultsDisplayProps) {
  const [viewMode, setViewMode] = useState<"cards" | "table" | "json">("cards");

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.items.map((item) => (
        <Card key={item.id} className="group hover:shadow-design-md transition-shadow">
          {item.image && (
            <div className="relative h-32 overflow-hidden rounded-t-lg">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          )}
          <CardHeader className="pb-2">
            <CardTitle className="text-sm line-clamp-2">{item.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {item.description && (
              <p className="text-xs text-foreground-muted line-clamp-3 mb-3">
                {item.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                {item.price && (
                  <Badge variant="secondary" className="text-xs w-fit">
                    {item.price}
                  </Badge>
                )}
                {item.rating && (
                  <div className="flex items-center gap-1 text-xs text-foreground-muted">
                    <span>★</span>
                    <span>{item.rating}/5</span>
                  </div>
                )}
              </div>
              {item.url && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-3 text-sm font-medium text-foreground">Title</th>
            <th className="text-left p-3 text-sm font-medium text-foreground">Description</th>
            <th className="text-left p-3 text-sm font-medium text-foreground">Price</th>
            <th className="text-left p-3 text-sm font-medium text-foreground">Rating</th>
            <th className="text-left p-3 text-sm font-medium text-foreground">Action</th>
          </tr>
        </thead>
        <tbody>
          {results.items.map((item) => (
            <tr key={item.id} className="border-b border-border hover:bg-accent/50">
              <td className="p-3 text-sm">{item.title}</td>
              <td className="p-3 text-sm text-foreground-muted">
                {item.description ? (
                  <span className="line-clamp-2">{item.description}</span>
                ) : (
                  "-"
                )}
              </td>
              <td className="p-3 text-sm">{item.price || "-"}</td>
              <td className="p-3 text-sm">{item.rating ? `★ ${item.rating}/5` : "-"}</td>
              <td className="p-3">
                {item.url && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderJsonView = () => (
    <div className="bg-muted rounded-lg p-4 overflow-x-auto">
      <pre className="text-xs text-foreground-muted">
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Search Results</CardTitle>
            <p className="text-sm text-foreground-muted mt-1">
              Found {results.totalFound} results for "{results.query}"
              {results.executionTime && ` in ${results.executionTime}ms`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggles */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <Button
                variant={viewMode === "cards" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("cards")}
                className="rounded-none"
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="rounded-none"
              >
                <Table className="h-3 w-3" />
              </Button>
              <Button
                variant={viewMode === "json" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("json")}
                className="rounded-none"
              >
                <Code className="h-3 w-3" />
              </Button>
            </div>

            {/* Download Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-3 w-3 mr-2" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDownload("csv")}>
                  Download as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload("json")}>
                  Download as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "cards" && renderCardView()}
        {viewMode === "table" && renderTableView()}
        {viewMode === "json" && renderJsonView()}
      </CardContent>
    </Card>
  );
}