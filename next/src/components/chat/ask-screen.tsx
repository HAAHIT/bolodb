"use client";

import { useState, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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

    await stream.startStream(q, conversationId || undefined);
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
    if (stream.isStreaming) {
      return [
        ...base,
        {
          id: "",
          question: "",
          thinking: stream.thinkingArtifacts.length > 0,
          thinkingArtifacts: stream.thinkingArtifacts,
          sql: stream.sql,
          confidence: undefined,
          executionError: stream.error || undefined,
        } as Turn,
      ];
    }
    return base;
  }, [hasServerTurns, serverTurns, localTurns, stream]);

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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="hidden md:flex"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1 p-4">
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
        </ScrollArea>

        <div className="border-t p-4">
          <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto flex gap-2"
          >
            <Input
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your data..."
              disabled={stream.isStreaming}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!question.trim() || stream.isStreaming}
            >
              {stream.isStreaming ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
