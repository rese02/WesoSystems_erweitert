'use client';

import { cn } from '@/lib/utils';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { storage } from '@/lib/firebase/client'; // Client-Instanz importieren
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';

type FileUploadProps = {
  bookingId: string;
  fileType: 'idFront' | 'idBack' | 'paymentProof';
  onUploadComplete: (fileType: 'idFront' | 'idBack' | 'paymentProof', downloadUrl: string) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
};


export function FileUpload({ bookingId, fileType, onUploadComplete, onUploadStart, onUploadEnd }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

   const resetState = () => {
      setFile(null);
      setUploadProgress(0);
  };


  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    onUploadStart();
    setFile(selectedFile);
    setUploadProgress(0);

    // Der Pfad in Firebase Storage, z.B. "bookings/aBcDeFg123/payment_proof.pdf"
    const storageRef = ref(storage, `bookings/${bookingId}/${fileType}_${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    // Überwache den Upload-Prozess
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        // Fehlerbehandlung
        console.error("Upload failed:", error);
        toast({ title: 'Upload fehlgeschlagen', description: 'Bitte versuchen Sie es erneut.', variant: 'destructive' });
        onUploadEnd();
        setFile(null);
      },
      () => {
        // Upload erfolgreich!
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          toast({ title: 'Datei erfolgreich hochgeladen!' });
          onUploadComplete(fileType, downloadURL); // Gibt die URL an die Eltern-Komponente weiter
          onUploadEnd();
        });
      }
    );
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
           {uploadProgress === 100 ? (
               <Button variant="ghost" size="icon" onClick={resetState}>
                 <X className="h-5 w-5" />
               </Button>
           ) : null }
        </div>
        {(uploadProgress > 0) && (
          <>
            <Progress value={uploadProgress} className="mt-2 h-2" />
            {uploadProgress < 100 && (
                <p className="text-xs text-center mt-1 text-muted-foreground">Wird hochgeladen...</p>
            )}
          </>
        )}
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
      <p className="mt-4 font-semibold">
        Datei hierher ziehen oder klicken
      </p>
      <p className="text-sm text-muted-foreground">
        PDF, PNG oder JPG.
      </p>
      <input
        id={`file-input-${fileType}`}
        type="file"
        className="hidden"
        onChange={(e) =>
          handleFileChange(e.target.files ? e.target.files[0] : null)
        }
      />
    </div>
  );
}
