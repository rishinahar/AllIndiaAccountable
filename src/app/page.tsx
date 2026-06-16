"use client";

import { useEffect, useState } from "react";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, ThumbsUp, MessageSquare, Loader2, AlertTriangle } from "lucide-react";

import { supabase } from "@/lib/supabase";
import type { Report } from "@/lib/types";

const CATEGORIES = ["All", "Roads & Potholes", "Sanitation & Garbage", "Electricity & Streetlights", "Water & Drainage", "Public Facilities", "Other"];

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function Home() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      try {
        let query = supabase
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false });

        if (activeCategory !== "All") {
          query = query.eq("category", activeCategory);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching reports:", error);
          return;
        }

        setReports(data || []);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [activeCategory]);

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      <div className="flex items-center justify-between py-2">
        <h1 className="text-2xl font-bold tracking-tight">Local Feed</h1>
        <Badge variant="secondary" className="px-3 py-1">India</Badge>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
        {CATEGORIES.map((cat) => (
          <Badge 
            key={cat} 
            variant={activeCategory === cat ? "default" : "outline"}
            className="snap-start whitespace-nowrap px-4 py-1.5 text-sm cursor-pointer shrink-0"
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">Loading reports...</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <AlertTriangle className="w-10 h-10 opacity-40" />
          <span className="font-medium">No reports found</span>
          <span className="text-sm text-center">Be the first to report an issue in your area.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map((issue) => (
            <Card key={issue.id} className="overflow-hidden border-border/50 shadow-sm transition-all hover:shadow-md">
              {issue.image_url && (
                <div className="h-48 w-full bg-muted relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={issue.image_url} 
                    alt={issue.category}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={
                      issue.status === "New" ? "destructive" : 
                      issue.status === "Acknowledged" ? "secondary" : "default"
                    } className="shadow-sm backdrop-blur-md bg-background/90">
                      {issue.status}
                    </Badge>
                  </div>
                </div>
              )}
              
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg leading-tight">
                    {issue.description || issue.category}
                  </CardTitle>
                </div>
                <div className="flex items-center text-xs text-muted-foreground gap-1 mt-1.5">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">
                    {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
                  </span>
                  <span className="mx-1">•</span>
                  <Clock className="w-3 h-3" />
                  <span>{timeAgo(issue.created_at)}</span>
                </div>
                <Badge variant="outline" className="mt-2 w-fit text-xs">
                  {issue.category}
                </Badge>
              </CardHeader>
              
              <CardFooter className="p-4 pt-2 flex justify-between items-center border-t border-border/30 mt-2 bg-muted/20">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="font-medium">{issue.upvotes ?? 0}</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium">Reply</span>
                  </button>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                  {issue.id.slice(0, 8).toUpperCase()}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
