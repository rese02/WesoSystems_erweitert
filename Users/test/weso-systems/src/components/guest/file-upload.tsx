'use client';

import { cn } from '@/lib/utils';
import { UploadCloud, File as FileIcon, X, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import imageCompression from 'browser-image-compression';


const t = (lang: 'de' | 'en' | 'it', key: string): string => {
  const translations = {
    de: {
      uploading: 'Lädt hoch...',
      compressing: 'Komprimiere Bild...',
      compressingDesc: 'Dies kann einen Moment dauern.',
      compressionFailed: 'Bildkomprimierung fehlgeschlagen',
      compressionFailedDesc: 'Die Originaldatei wird hochgeladen.',
      uploadFailed: 'Upload fehlgeschlagen',
      uploadFailedDesc: 'Bitte versuchen Sie es erneut.',
      uploadSuccess: 'Datei erfolgreich hochgeladen!',
      fileRemoved: 'Datei entfernt.',
      deleteError: 'Fehler beim Löschen',
      deleteErrorDesc: 'Die Datei konnte nicht entfernt werden.',
      fileUploaded: 'Datei hochgeladen',
      preview: 'Vorschau',
      uploadingProgress: 'Wird hochgeladen...',
      dragOrClick: 'Datei hierher ziehen oder klicken',
      fileTypes: 'PDF, PNG oder JPG.',
    },
    en: {
      uploading: 'Uploading...',
      compressing: 'Compressing image...',
      compressingDesc: 'This may take a moment.',
      compressionFailed: 'Image compression failed',
      compressionFailedDesc: 'Uploading the original file.',
      uploadFailed: 'Upload failed',
      uploadFailedDesc: 'Please try again.',
      uploadSuccess: 'File uploaded successfully!',
      fileRemoved: 'File removed.',
      deleteError: 'Error deleting file',
      deleteErrorDesc: 'The file could not be removed.',
      fileUploaded: 'File uploaded',
      preview: 'Preview',
      uploadingProgress: 'Uploading...',
      dragOrClick: 'Drag and drop file here, or click to select',
      fileTypes: 'PDF, PNG, or JPG.',
    },
    it: {
      uploading: 'Caricamento...',
      compressing: 'Compressione immagine...',
      compressingDesc: 'Potrebbe richiedere un momento.',
      compressionFailed: 'Compressione immagine fallita',
      compressionFailedDesc: 'Il file originale verrà caricato.',
      uploadFailed: 'Caricamento fallito',
      uploadFailedDesc: 'Si prega di riprovare.',
      uploadSuccess: 'File caricato con successo!',
      fileRemoved: 'File rimosso.',
      deleteError: 'Errore durante l\'eliminazione',
      deleteErrorDesc: 'Impossibile rimuovere il file.',
      fileUploaded: 'File caricato',
      preview: 'Anteprima',
      uploadingProgress: 'Caricamento in corso...',
      dragOrClick: 'Trascina il file qui o fai clic per selezionare',
      fileTypes: 'PDF, PNG o JPG.',
    },
  };
  return translations[lang][key] || key;
};


type FileUploadProps = {
  bookingId: string;
  fileType: string; 
  uploadedFileUrl: string | null;
  onUploadComplete: (fileType: string, downloadUrl: string) => void;
  onUploadStart: () => void;
  onDelete: (fileType: string) => void;
  lang: 'de' | 'en' | 'it';
};

export function FileUpload({
  bookingId,
  fileType,
  uploadedFileUrl,
  onUploadComplete,
  onUploadStart,
  onDelete,
  lang = 'de',
}: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const T = (key: string) => t(lang, key);


  const handleFileChange = async (selectedFile: File | null) => {
    if (!selectedFile) return;

    onUploadStart();
    setIsUploading(true);
    setUploadProgress(0);

    let fileToUpload = selectedFile;

    if (selectedFile.type.startsWith('image/')) {
        try {
            const options = {
                maxSizeMB: 1, 
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                initialQuality: 0.7, 
            };
            
            toast({ title: T('compressing'), description: T('compressingDesc') });
            
            const compressedFile = await imageCompression(selectedFile, options);
            fileToUpload = compressedFile;

        } catch (error) {
            console.error('Image compression failed:', error);
            toast({ title: T('compressionFailed'), description: T('compressionFailedDesc'), variant: 'destructive' });
        }
    }


    const storageRef = ref(storage, `bookings/${bookingId}/${fileType}_${Date.now()}_${fileToUpload.name}`);
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        toast({ title: T('uploadFailed'), description: T('uploadFailedDesc'), variant: 'destructive' });
        setIsUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          toast({ title: T('uploadSuccess') });
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
            toast({ title: T('fileRemoved')});
        }).catch((error) => {
            console.error("Error deleting file:", error);
            toast({ title: T('deleteError'), description: T('deleteErrorDesc'), variant: 'destructive' });
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
              <p className="font-medium truncate">{T('fileUploaded')}</p>
              <a href={uploadedFileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline">{T('preview')}</a>
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
             <p className="font-medium truncate">{T('uploadingProgress')}</p>
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
      <p className="mt-4 font-semibold">{T('dragOrClick')}</p>
      <p className="text-sm text-muted-foreground">{T('fileTypes')}</p>
      <input
        id={`file-input-${fileType}`}
        type="file"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
        accept="image/png, image/jpeg, image/jpg, application/pdf"
      />
    </div>
  );
}
