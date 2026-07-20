"use client";

import { useState, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { AnswerCard } from "./answer-card";
import { Spinner } from "@/components/shared/spinner";
import { useStreamQuery } from "@/hooks/use-stream-query";
import { useConversation } from "@/hooks/use-conversations";
import { Send, Menu } from "lucide-react";
import type { Turn } from "@/lib/types";

export function AskScreen() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get("conversation");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [question, setQuestion] = useState("");
  const [localTurns, setLocalTurns] = useState<Turn[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const stream = useStreamQuery();

  const { data: conversationData } = useConversation(conversationId);

  const serverTurns = conversationData?.turns as Turn[] | undefined;
  const hasServerTurns = !!serverTurns && serverTurns.length > 0;

  const turns = hasServerTurns ? serverTurns : localTurns;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question.trim() || stream.isStreaming) return;

    const q = question.trim();
    setQuestion("");

    const newTurn: Turn = {
      id: "",
      question: q,
      thinking: false,
      thinkingArtifacts: [],
      sql: "",
      confidence: undefined,
    };

    if (hasServerTurns) {
      setLocalTurns([...serverTurns, newTurn]);
    } else {
      setLocalTurns((prev) => [...prev, newTurn]);
    }

    const finalData = await stream.startStream(q, conversationId || undefined);

    setLocalTurns((prev) => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      if (lastIndex >= 0) {
        updated[lastIndex] = {
          ...updated[lastIndex],
          thinkingArtifacts: finalData.thinkingArtifacts,
          sql: finalData.sql,
          confidence: finalData.confidence as Turn["confidence"],
          executionError: finalData.error || undefined,
        };
      }
      return updated;
    });
  };

  const handleSelectConversation = (id: string) => {
    router.push(`/chat?conversation=${id}`);
  };

  const handleNewConversation = () => {
    router.push("/chat");
    setLocalTurns([]);
  };

  const allTurns = useMemo(() => {
    const base = hasServerTurns ? serverTurns : localTurns;
    if (stream.isStreaming && base.length > 0) {
      const merged = [...base];
      const lastIndex = merged.length - 1;
      merged[lastIndex] = {
        ...merged[lastIndex],
        thinking: stream.thinkingArtifacts.length > 0,
        thinkingArtifacts: stream.thinkingArtifacts,
        sql: stream.sql,
        confidence: stream.confidence as Turn["confidence"],
        executionError: stream.error || undefined,
      };
      return merged;
    }
    return base;
  }, [hasServerTurns, serverTurns, localTurns, stream]);

  const btnBase = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

  return (
    <div className="flex h-full">
      {sidebarOpen && (
        <Sidebar
          className="w-64 shrink-0 hidden md:flex"
          activeConversationId={conversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />
      )}

      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 p-2 border-b">
          <button
            className={cn(btnBase, "hover:bg-accent hover:text-accent-foreground h-9 w-9 md:hidden")}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-4 w-4" />
          </button>
          {!sidebarOpen && (
            <button
              className={cn(btnBase, "hover:bg-accent hover:text-accent-foreground h-9 w-9 hidden md:flex")}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="relative overflow-auto flex-1 p-4">
          {allTurns.length === 0 && !stream.isStreaming ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">
                  Ask your data in plain English
                </h2>
                <p className="text-muted-foreground">
                  Type a question about your database to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {allTurns.map((turn, i) => (
                <AnswerCard key={i} turn={turn} />
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto flex gap-2"
          >
            <input
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your data..."
              disabled={stream.isStreaming}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex-1"
            />
            <button
              type="submit"
              disabled={!question.trim() || stream.isStreaming}
              className={cn(btnBase, "bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2")}
            >
              {stream.isStreaming ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
