"use client";

import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Undo2, PanelRight, Volume2, VolumeX } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { ActivityIndicator } from "./activity-indicator";
import { ChatMessage } from "@/hooks/use-chat";

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  activity: string;
  hasVersions: boolean;
  showPreviewButton: boolean;
  onSend: (message: string) => void;
  onStop: () => void;
  onUndo: () => void;
  onShowPreview: () => void;
  isListening: boolean;
  isPlaying: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
  ttsEnabled: boolean;
  onToggleTts: () => void;
  ttsRate: number;
  onSetTtsRate: (rate: number) => void;
}

export function ChatPanel({
  messages,
  isLoading,
  activity,
  hasVersions,
  showPreviewButton,
  onSend,
  onStop,
  onUndo,
  onShowPreview,
  isListening,
  isPlaying,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  ttsEnabled,
  onToggleTts,
  ttsRate,
  onSetTtsRate,
}: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activity]);

  // Spacebar = hold to talk; Escape = stop audio
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        if (e.repeat || isLoading || isListening) return;
        e.preventDefault();
        onStartListening();
      } else if (e.code === "Escape") {
        onStopSpeaking();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space" && isListening) {
        onStopListening();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [isLoading, isListening, onStartListening, onStopListening, onStopSpeaking]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-3 py-1.5 gap-4">
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleTts}
          className="text-xs text-muted-foreground shrink-0"
          title={ttsEnabled ? "Mute voice" : "Enable voice"}
        >
          {ttsEnabled ? (
            <Volume2 className="h-3.5 w-3.5 mr-1" />
          ) : (
            <VolumeX className="h-3.5 w-3.5 mr-1" />
          )}
          {ttsEnabled ? "Voice on" : "Voice off"}
        </Button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="shrink-0">Reading Speed</span>
          <input
            type="range"
            min={0.5}
            max={2.0}
            step={0.05}
            value={ttsRate}
            onChange={(e) => onSetTtsRate(parseFloat(e.target.value))}
            className="w-24 accent-primary"
          />
          <span className="w-6 shrink-0">{ttsRate.toFixed(1)}x</span>
        </div>
        {showPreviewButton && (
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-muted-foreground"
            onClick={onShowPreview}
          >
            <PanelRight className="h-3.5 w-3.5 mr-1" />
            Show preview
          </Button>
        )}
      </div>
      <ScrollArea className="min-h-0 flex-1 p-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome to KidCode!</h2>
              <p className="text-muted-foreground max-w-md">
                Tell me what you want to build! I can make games, websites,
                tools, and more. Just describe what you want and I&apos;ll build it
                for you.
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
          {isLoading && <ActivityIndicator activity={activity || "Thinking..."} />}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <div className="mx-auto max-w-2xl">
          <ChatInput
            onSend={onSend}
            onStop={onStop}
            isLoading={isLoading}
            hasMessages={messages.length > 0}
            isListening={isListening}
            isPlaying={isPlaying}
            onStartListening={onStartListening}
            onStopListening={onStopListening}
            onStopSpeaking={onStopSpeaking}
          />
          {/* TODO: re-enable undo button once we have a good UX for it
          {hasVersions && !isLoading && (
            <div className="mt-2 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={onUndo}
              >
                <Undo2 className="h-3 w-3 mr-1" />
                Undo last change
              </Button>
            </div>
          )}
          */}
        </div>
      </div>
    </div>
  );
}
