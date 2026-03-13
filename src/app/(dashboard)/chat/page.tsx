"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ConversationList } from "@/components/chat/conversation-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useDocuments } from "@/hooks/use-documents";

export default function ChatPage() {
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { documents } = useDocuments();

  const handleConversationCreated = (id: string) => {
    setActiveConversation(id);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex h-[calc(100vh-7.5rem)]">
      {/* Sidebar - Conversations */}
      <div className="w-72 border-r flex flex-col shrink-0">
        <ConversationList
          activeId={activeConversation}
          onSelect={setActiveConversation}
          refreshTrigger={refreshTrigger}
        />
        {documents.length > 0 && (
          <div className="p-3 border-t">
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Active Document
            </Label>
            <Select
              value={selectedDocument || "all"}
              onValueChange={(v) => setSelectedDocument(v === "all" ? null : v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All documents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All documents</SelectItem>
                {documents.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Separator orientation="vertical" />

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          conversationId={activeConversation}
          onConversationCreated={handleConversationCreated}
          selectedDocumentId={selectedDocument}
        />
      </div>
    </div>
  );
}
