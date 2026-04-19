"use client";

import { useState, useTransition } from "react";
import { Loader2, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadProductImage } from "@/app/admin/products/actions";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

export function ImageUploader({ images, onChange, onUploadingChange }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const MAX_SIZE = 5 * 1024 * 1024;

  const uploadFiles = (files: File[]) => {
    setSizeError(null);

    const oversized = files.find(f => f.size > MAX_SIZE);
    if (oversized) {
      setSizeError(`A fájl mérete meghaladja a megengedett 5 MB-ot.`);
      return;
    }

    onUploadingChange?.(true);

    startTransition(async () => {
      try {
        const uploadedUrls: string[] = [];

        for (const file of files) {
          const fd = new FormData();
          fd.append('file', file);
          const result = await uploadProductImage(fd);
          uploadedUrls.push(result.url);
        }

        onChange([...images, ...uploadedUrls]);
      } catch {
        toast.error('Képfeltöltés sikertelen');
      } finally {
        onUploadingChange?.(false);
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(Array.from(e.dataTransfer.files));
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
            <Image src={img} alt={`Termékkép ${index + 1}`} fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-background/80 hover:bg-destructive hover:text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity touch-target flex justify-center items-center"
              aria-label={`${index + 1}. kép eltávolítása`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {isPending && (
          <div className="relative aspect-square flex flex-col items-center justify-center rounded-md border-2 bg-muted/50 border-border">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            <span className="text-xs text-muted-foreground mt-2">Feltöltés...</span>
          </div>
        )}

        <div
          className={cn(
            "relative aspect-square flex flex-col items-center justify-center rounded-md border-2 border-dashed bg-muted/50 transition-colors cursor-pointer touch-target",
            isDragging ? "border-primary bg-primary/10" : "border-border hover:bg-muted",
            isPending && "opacity-50 pointer-events-none"
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
            disabled={isPending}
            aria-label="Képfájlok kiválasztása"
          />
        </div>
      </div>

      {sizeError && (
        <p className="text-[0.8rem] text-destructive">{sizeError}</p>
      )}

      <p className="text-[0.8rem] text-muted-foreground">
        Húzza ide a képeket, vagy kattintson a feltöltéshez. PNG, JPG max. 5MB.
      </p>
    </div>
  );
}
