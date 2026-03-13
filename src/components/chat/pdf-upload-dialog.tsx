"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useEdgeStore } from "@/lib/edgestore-client";

interface PdfUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PdfUploadDialog({ open, onOpenChange }: PdfUploadDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "done" | "error">("idle");
  const [fileName, setFileName] = useState("");
  const { edgestore } = useEdgeStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setFileName(file.name);
      setUploading(true);
      setStatus("uploading");
      setProgress(0);

      try {
        // Upload to EdgeStore
        const res = await edgestore.publicFiles.upload({
          file,
          onProgressChange: (prog) => setProgress(prog),
        });

        setStatus("processing");
        setProgress(100);

        // Save document record and trigger processing
        const docRes = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            url: res.url,
            size: file.size,
          }),
        });

        if (!docRes.ok) throw new Error("Failed to create document");

        setStatus("done");
        setTimeout(() => {
          onOpenChange(false);
          setStatus("idle");
          setProgress(0);
        }, 2000);
      } catch (error) {
        console.error("Upload error:", error);
        setStatus("error");
      } finally {
        setUploading(false);
      }
    },
    [edgestore, onOpenChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload PDF Document</DialogTitle>
          <DialogDescription>
            Upload a PDF to analyze with AI. Max file size: 10MB.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            } ${uploading ? "pointer-events-none opacity-50" : ""}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-sm font-medium">Drop your PDF here</p>
            ) : (
              <>
                <p className="text-sm font-medium">
                  Drag & drop a PDF here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF files up to 10MB
                </p>
              </>
            )}
          </div>

          {status !== "idle" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate flex-1">{fileName}</span>
                <Badge variant={status === "error" ? "destructive" : "secondary"}>
                  {status === "uploading" && "Uploading"}
                  {status === "processing" && "Processing"}
                  {status === "done" && "Complete"}
                  {status === "error" && "Error"}
                </Badge>
              </div>
              {(status === "uploading" || status === "processing") && (
                <Progress value={progress} />
              )}
              {status === "processing" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner className="h-3 w-3" />
                  <span>Embedding document for AI analysis...</span>
                </div>
              )}
              {status === "done" && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Document uploaded and ready for analysis!</span>
                </div>
              )}
              {status === "error" && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>Upload failed. Please try again.</span>
                </div>
              )}
            </div>
          )}

          {status === "error" && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setStatus("idle");
                setProgress(0);
              }}
            >
              Try Again
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
