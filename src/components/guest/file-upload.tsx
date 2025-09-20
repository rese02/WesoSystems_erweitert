'use client';

import { cn } from '@/lib/utils';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

type FileUploadProps = {
  onFileSelect: (file: File | null) => void;
  isUploading?: boolean;
};

export function FileUpload({ onFileSelect, isUploading = false }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const resetState = useCallback(() => {
      setFile(null);
      setUploadProgress(0);
      onFileSelect(null);
  }, [onFileSelect]);

  React.useEffect(() => {
    if (isUploading) {
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90; // Stop at 90 to indicate processing
                }
                return prev + 10;
            });
        }, 100);
        return () => clearInterval(interval);
    } else if (file) {
        setUploadProgress(100);
    }
  }, [isUploading, file]);


  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      onFileSelect(selectedFile);
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
          <div className="flex items-center gap-3 overflow-hidden">
            <FileIcon className="h-8 w-8 flex-shrink-0 text-muted-foreground" />
            <div className="overflow-hidden">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
           {uploadProgress < 100 && !isUploading ? (
               <Button variant="ghost" size="icon" onClick={resetState}>
                 <X className="h-5 w-5" />
               </Button>
           ) : null }
        </div>
        {(isUploading || uploadProgress > 0) && (
          <Progress value={uploadProgress} className="mt-2 h-2" />
        )}
      </div>
    );
  }

  return (
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById('file-input')?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-primary"
    >
      <UploadCloud className="h-12 w-12 text-gray-400" />
      <p className="mt-4 font-semibold">
        Datei hierher ziehen oder klicken
      </p>
      <p className="text-sm text-muted-foreground">
        PDF, PNG oder JPG.
      </p>
      <input
        id="file-input"
        type="file"
        className="hidden"
        onChange={(e) =>
          handleFileChange(e.target.files ? e.target.files[0] : null)
        }
      />
    </div>
  );
}
