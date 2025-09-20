'use client';

import { cn } from '@/lib/utils';
import { UploadCloud, File as FileIcon, X, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';

type FileUploadProps = {
  bookingId: string;
  fileType: string; // z.B. 'idFront', 'idBack', 'paymentProof'
  uploadedFileUrl: string | null;
  onUploadComplete: (fileType: string, downloadUrl: string) => void;
  onUploadStart: () => void;
  onDelete: (fileType: string) => void;
};

export function FileUpload({
  bookingId,
  fileType,
  uploadedFileUrl,
  onUploadComplete,
  onUploadStart,
  onDelete,
}: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    onUploadStart();
    setIsUploading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `bookings/${bookingId}/${fileType}_${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        toast({ title: 'Upload fehlgeschlagen', description: 'Bitte versuchen Sie es erneut.', variant: 'destructive' });
        setIsUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          toast({ title: 'Datei erfolgreich hochgeladen!' });
          onUploadComplete(fileType, downloadURL);
          setIsUploading(false);
        });
      }
    );
  };
  
  const handleDelete = () => {
      if (uploadedFileUrl) {
        const fileRef = ref(storage, uploadedFileUrl);
        deleteObject(fileRef).then(() => {
            onDelete(fileType);
            toast({ title: 'Datei entfernt.'});
        }).catch((error) => {
            console.error("Error deleting file:", error);
            toast({ title: 'Fehler beim Löschen', description: 'Die Datei konnte nicht entfernt werden.', variant: 'destructive' });
        });
      } else {
        onDelete(fileType);
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

  if (uploadedFileUrl) {
     return (
      <div className="rounded-lg border border-dashed p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
             <CheckCircle2 className="h-8 w-8 flex-shrink-0 text-green-500" />
            <div className="overflow-hidden">
              <p className="font-medium truncate">Datei hochgeladen</p>
              <a href={uploadedFileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline">Vorschau</a>
            </div>
          </div>
           <Button variant="ghost" size="icon" onClick={handleDelete}>
             <X className="h-5 w-5" />
           </Button>
        </div>
      </div>
    );
  }
  
  if (isUploading) {
     return (
      <div className="rounded-lg border border-dashed p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
             <FileIcon className="h-8 w-8 flex-shrink-0 text-muted-foreground" />
             <p className="font-medium truncate">Wird hochgeladen...</p>
          </div>
        </div>
        <Progress value={uploadProgress} className="mt-2 h-2" />
        <p className="text-xs text-center mt-1 text-muted-foreground">{Math.round(uploadProgress)}%</p>
      </div>
    );
  }


  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => document.getElementById(`file-input-${fileType}`)?.click()}
      className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-primary"
    >
      <UploadCloud className="h-12 w-12 text-gray-400" />
      <p className="mt-4 font-semibold">Datei hierher ziehen oder klicken</p>
      <p className="text-sm text-muted-foreground">PDF, PNG oder JPG.</p>
      <input
        id={`file-input-${fileType}`}
        type="file"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
        accept="image/png, image/jpeg, application/pdf"
      />
    </div>
  );
}
