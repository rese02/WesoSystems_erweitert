'use client';

import { cn } from '@/lib/utils';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      // Simulate upload
      setIsUploading(true);
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (file) {
    return (
      <div className="rounded-lg border border-dashed p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileIcon className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        {isUploading && (
          <Progress value={uploadProgress} className="mt-2 h-2" />
        )}
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-primary"
    >
      <UploadCloud className="h-12 w-12 text-gray-400" />
      <p className="mt-4 font-semibold">
        Datei hierher ziehen oder klicken, um hochzuladen
      </p>
      <p className="text-sm text-muted-foreground">
        Zahlungsbeleg als PDF, PNG oder JPG.
      </p>
      <input
        type="file"
        className="hidden"
        onChange={(e) =>
          handleFileChange(e.target.files ? e.target.files[0] : null)
        }
      />
    </div>
  );
}
