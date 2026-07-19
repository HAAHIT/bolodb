"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
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

  const btnBase = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

  return (
    <div className={cn("flex flex-col h-full border-r bg-muted/10", className)}>
      <div className="p-3 border-b">
        <button
          className={cn(btnBase, "bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 rounded-md px-3 text-xs w-full")}
          onClick={onNewConversation}
        >
          <Plus className="h-4 w-4 mr-2" />
          New conversation
        </button>
      </div>

      <div className="relative overflow-auto flex-1">
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
                  <button
                    className={cn(btnBase, "hover:bg-accent hover:text-accent-foreground h-6 w-6")}
                    onClick={() => handleRenameConfirm(conv._id)}
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    className={cn(btnBase, "hover:bg-accent hover:text-accent-foreground h-6 w-6")}
                    onClick={() => setEditingId(null)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 truncate">{conv.title || "Untitled"}</span>
                  <div className="hidden group-hover:flex items-center gap-0.5">
                    <button
                      className={cn(btnBase, "hover:bg-accent hover:text-accent-foreground h-6 w-6")}
                      onClick={(e) => handleRenameStart(conv, e)}
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      className={cn(btnBase, "hover:bg-accent hover:text-accent-foreground h-6 w-6 text-destructive")}
                      onClick={(e) => handleDelete(conv._id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 border-t space-y-1">
        <button className={cn(btnBase, "hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs w-full justify-start")}>
          <Database className="h-4 w-4 mr-2" />
          Schema
        </button>
        <button className={cn(btnBase, "hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs w-full justify-start")}>
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Dashboard
        </button>
        <button className={cn(btnBase, "hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs w-full justify-start")}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </button>
      </div>
    </div>
  );
}
