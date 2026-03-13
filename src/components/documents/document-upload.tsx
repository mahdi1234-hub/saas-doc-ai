"use client";

import { useState, useCallback } from "react";
import { useEdgeStore } from "@/lib/edgestore-client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle2, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface DocumentUploadProps {
  onSuccess?: () => void;
}

export function DocumentUpload({ onSuccess }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const { edgestore } = useEdgeStore();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      setError("");
    } else {
      setError("Please upload a PDF file");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please upload a PDF file");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError("");

    try {
      // Upload to EdgeStore
      setProgress(10);
      const edgeStoreRes = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (p) => setProgress(Math.min(10 + p * 0.5, 60)),
      });

      setProgress(65);

      // Process document
      const formData = new FormData();
      formData.append("file", file);
      formData.append("url", edgeStoreRes.url);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      setProgress(90);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      setProgress(100);
      toast.success("Document uploaded and processing started!");
      onSuccess?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => document.getElementById("pdf-upload")?.click()}
      >
        <input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div className="text-left">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">Drag & drop a PDF here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">Up to 50MB</p>
          </>
        )}
      </div>

      {uploading && <Progress value={progress} className="h-2" />}

      <Button
        className="w-full gap-2"
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {progress < 60 ? "Uploading..." : progress < 90 ? "Processing..." : "Finishing..."}
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Upload & Process
          </>
        )}
      </Button>
    </div>
  );
}
