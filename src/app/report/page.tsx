"use client";

import { useState } from "react";
import { Camera as CameraPlugin, CameraResultType, CameraSource } from "@capacitor/camera";
import { Geolocation } from "@capacitor/geolocation";
import { Camera, MapPin, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  "Roads & Potholes",
  "Sanitation & Garbage",
  "Electricity & Streetlights",
  "Water & Drainage",
  "Public Facilities",
  "Other"
];

export default function ReportPage() {
  const router = useRouter();
  
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTakePhoto = async () => {
    try {
      const image = await CameraPlugin.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt, // Let user choose Camera or Gallery
      });

      if (image.dataUrl) {
        setPhoto(image.dataUrl);
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message !== "User cancelled photos app") {
        toast.error("Failed to access camera. Please check permissions.");
        console.error(error);
      }
    }
  };

  const handleGetLocation = async () => {
    setIsLocating(true);
    try {
      const position = await Geolocation.getCurrentPosition();
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      toast.success("Location acquired successfully!");
    } catch (error) {
      toast.error("Could not fetch location. Please ensure GPS is enabled.");
      console.error(error);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!photo) {
      toast.error("Please add a photo as proof.");
      return;
    }
    if (!location) {
      toast.error("Please attach your location.");
      return;
    }
    if (!category) {
      toast.error("Please select a category.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Upload photo to Supabase Storage (convert DataUrl to Blob first)
      const res = await fetch(photo);
      const blob = await res.blob();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('reports')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('reports')
        .getPublicUrl(fileName);
      
      const imageUrl = publicUrlData.publicUrl;

      // 2. Insert into database
      const { error: dbError } = await supabase
        .from('reports')
        .insert([
          { 
            category, 
            description, 
            latitude: location.lat, 
            longitude: location.lng,
            image_url: imageUrl,
            status: 'New'
          }
        ]);

      if (dbError) throw new Error("Failed to save report to database.");

      toast.success("Issue reported successfully!");
      router.push("/");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Report Issue</h1>
        <p className="text-muted-foreground mt-1">Help fix your city. Provide details below.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Photo Section */}
        <div className="flex flex-col gap-3">
          <Label className="text-base font-semibold">Photo Proof <span className="text-destructive">*</span></Label>
          
          {photo ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-primary shadow-sm group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="Issue proof" className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={handleTakePhoto}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="text-white font-medium flex items-center gap-2">
                  <Camera className="w-5 h-5" /> Retake Photo
                </span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleTakePhoto}
              className="w-full h-40 border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center gap-3 text-muted-foreground hover:bg-muted/50 hover:border-primary/50 transition-colors active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ImagePlus className="w-6 h-6" />
              </div>
              <span className="font-medium">Tap to capture photo</span>
            </button>
          )}
        </div>

        {/* Location Section */}
        <div className="flex flex-col gap-3">
          <Label className="text-base font-semibold flex items-center justify-between">
            <span>Location <span className="text-destructive">*</span></span>
          </Label>
          
          <Card className={`${location ? 'border-primary/50 bg-primary/5' : ''}`}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-2 rounded-full ${location ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-medium text-sm">
                    {location ? "GPS coordinates attached" : "No location added"}
                  </span>
                  {location && (
                    <span className="text-xs text-muted-foreground font-mono truncate">
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="shrink-0 text-sm font-medium text-primary hover:underline disabled:opacity-50 flex items-center"
              >
                {isLocating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                {location ? "Update" : "Get GPS"}
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Category Section */}
        <div className="flex flex-col gap-3">
          <Label className="text-base font-semibold">Category <span className="text-destructive">*</span></Label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`p-3 rounded-xl border text-sm text-left transition-all active:scale-95 ${
                  category === cat 
                    ? "border-primary bg-primary text-primary-foreground shadow-md" 
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Description Section */}
        <div className="flex flex-col gap-3">
          <Label className="text-base font-semibold">Description</Label>
          <Textarea 
            placeholder="Add details like landmarks, severity, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24 resize-none rounded-xl"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 mt-4 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            "Submit Report"
          )}
        </button>
        
      </form>
    </div>
  );
}
