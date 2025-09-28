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
    <div className="flex flex-col gap-6">
      {/* Title section for the search query */}
      <div className="bg-accent/30 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">
          Results for: {results.query}
        </h2>
        <p className="text-sm text-muted-foreground">
          Found {results.totalFound} relevant items to help you
        </p>
      </div>

      {/* Structured results */}
      <div className="space-y-6">
        {results.items.map((item, index) => (
          <Card key={item.id} className="overflow-hidden border-l-4 border-l-primary">
            <CardHeader className="pb-2 bg-muted/30">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full h-6 w-6 flex items-center justify-center p-0">
                  {index + 1}
                </Badge>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Overview section */}
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Overview</h3>
                {item.description ? (
                  <p className="text-sm text-foreground-muted">
                    {item.description}
                  </p>
                ) : (
                  <p className="text-sm text-foreground-muted italic">No overview available</p>
                )}
              </div>
              
              {/* Details section - only show if price or rating exists */}
              {(item.price || item.rating) && (
                <div className="mb-4 border-t pt-3">
                  <h3 className="text-sm font-medium mb-2">Details</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {item.price && (
                      <div>
                        <span className="text-xs text-foreground-muted block">Price:</span>
                        <Badge variant="secondary" className="mt-1">
                          {item.price}
                        </Badge>
                      </div>
                    )}
                    {item.rating && (
                      <div>
                        <span className="text-xs text-foreground-muted block">Rating:</span>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-amber-500">★</span>
                          <span className="text-sm">{item.rating}/5</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Additional information section - only show if metadata exists */}
              {item.metadata && Object.keys(item.metadata).length > 0 && (
                <div className="mb-4 border-t pt-3">
                  <h3 className="text-sm font-medium mb-2">Additional Information</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    {Object.entries(item.metadata).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-xs text-foreground-muted block capitalize">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action button */}
              {item.url && (
                <div className="mt-4 flex justify-end">
                  <Button size="sm" asChild>
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {/* Summary card */}
        <Card className="bg-muted/20">
          <CardContent className="pt-6 pb-6">
            <p className="text-sm text-center">
              These results have been organized to provide you with clear, structured information
              based on your search for <strong>"{results.query}"</strong>.
            </p>
          </CardContent>
        </Card>
      </div>
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