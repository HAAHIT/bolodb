"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  MessageSquare,
  Trash2,
  Pencil,
  Check,
  X,
  Database,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { useConversations, useCreateConversation, useDeleteConversation, useRenameConversation } from "@/hooks/use-conversations";
import type { Conversation } from "@/lib/types";



interface SidebarProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  className?: string;
}

export function Sidebar({
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  className,
}: SidebarProps) {
  const { data: conversations } = useConversations();
  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();
  const renameConversation = useRenameConversation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleNew = () => {
    createConversation.mutate(
      { title: "New conversation" },
      {
        onSuccess: (data: any) => {
          onSelectConversation(data.id);
        },
      }
    );
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this conversation?")) {
      deleteConversation.mutate(id);
      if (activeConversationId === id) {
        onNewConversation();
      }
    }
  };

  const handleRenameStart = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv._id);
    setEditTitle(conv.title);
  };

  const handleRenameConfirm = (id: string) => {
    if (editTitle.trim()) {
      renameConversation.mutate({ id, title: editTitle.trim() });
    }
    setEditingId(null);
  };

  return (
    <div className={cn("flex flex-col h-full border-r bg-muted/10", className)}>
      <div className="p-3 border-b">
        <Button className="w-full" size="sm" onClick={onNewConversation}>
          <Plus className="h-4 w-4 mr-2" />
          New conversation
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations?.map((conv: Conversation) => (
            <div
              key={conv._id}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer group",
                activeConversationId === conv._id
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )}
              onClick={() => onSelectConversation(conv._id)}
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
              {editingId === conv._id ? (
                <div className="flex items-center gap-1 flex-1">
                  <input
                    className="flex-1 bg-background border rounded px-1 py-0.5 text-sm"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameConfirm(conv._id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRenameConfirm(conv._id)}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setEditingId(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="flex-1 truncate">{conv.title || "Untitled"}</span>
                  <div className="hidden group-hover:flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => handleRenameStart(conv, e)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={(e) => handleDelete(conv._id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t space-y-1">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Database className="h-4 w-4 mr-2" />
          Schema
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
}
