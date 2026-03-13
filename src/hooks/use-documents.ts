"use client";

import { useState, useEffect, useCallback } from "react";

interface Document {
  id: string;
  name: string;
  url: string;
  size: number;
  pageCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { documents, loading, refetch: fetchDocuments };
}
