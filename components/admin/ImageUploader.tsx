"use client";

import { useState } from "react";
import { UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      onChange([...images, ...newImages]);
      // TODO: Supabase Storage upload
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newImages = Array.from(e.dataTransfer.files).map(file => URL.createObjectURL(file));
      onChange([...images, ...newImages]);
      // TODO: Supabase Storage upload
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((img, index) => (
          <div key={index} className="relative aspect-square rounded-md overflow-hidden border group">
            <Image src={img} alt={`Product image ${index + 1}`} fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-background/80 hover:bg-destructive hover:text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity touch-target flex justify-center items-center"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <div
          className={cn(
            "relative aspect-square flex flex-col items-center justify-center rounded-md border-2 border-dashed bg-muted/50 transition-colors cursor-pointer touch-target",
            isDragging ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="text-xs text-muted-foreground text-center px-2">Képek feltöltése</span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />
        </div>
      </div>
      <p className="text-[0.8rem] text-muted-foreground">
        Húzza ide a képeket, vagy kattintson a feltöltéshez. PNG, JPG max. 5MB.
      </p>
    </div>
  );
}
