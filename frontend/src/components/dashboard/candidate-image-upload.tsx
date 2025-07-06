"use client";

import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useUploadThing } from "@/lib/uploadthing";

type CandidateImageUploadProps = {
  candidateId: string;
  candidateName: string;
  imageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  disabled?: boolean;
};

export function CandidateImageUpload({
  candidateId,
  candidateName,
  imageUrl,
  onImageUploaded,
  disabled = false,
}: CandidateImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("candidateImage", {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        onImageUploaded(res[0].ufsUrl);
        toast.success("Image uploaded successfully!");
      }
      setIsUploading(false);
    },
    onUploadError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
      setIsUploading(false);
    },
  });

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!disabled && !isUploading) {
      console.log("Avatar clicked, opening file picker");
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (4MB)
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image size must be less than 4MB");
      return;
    }

    setIsUploading(true);
    toast.loading("Uploading image...");

    try {
      await startUpload([file]);
    } catch (error) {
      toast.error("Failed to upload image");
      setIsUploading(false);
    }

    // Clear the input so the same file can be selected again
    event.target.value = "";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative h-16 w-16 cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${isUploading ? "opacity-60" : ""}`}
        onClick={handleImageClick}
      >
        <Avatar className="h-16 w-16 border-2 border-dashed border-gray-300 transition-all hover:border-primary">
          {imageUrl && !isUploading ? (
            <AvatarImage src={imageUrl} alt={candidateName} />
          ) : (
            <AvatarFallback className="bg-muted">
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : imageUrl ? (
                getInitials(candidateName)
              ) : (
                <Camera className="h-6 w-6 text-muted-foreground" />
              )}
            </AvatarFallback>
          )}
        </Avatar>

        {!isUploading && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
            <Camera className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
}
