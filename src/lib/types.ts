export type ReportStatus = "New" | "Acknowledged" | "In_Progress" | "Resolved" | "Rejected";

export interface Report {
  id: string; // UUID
  title?: string;
  category: string;
  description?: string;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  upvotes: number;
  image_url?: string;
  created_at: string;
}
