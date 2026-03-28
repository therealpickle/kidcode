"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Brain, Mic, MicOff, VolumeX } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
  hasMessages: boolean;
  isListening: boolean;
  isPlaying: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
}

// Brain icon with a diagonal slash across it
function BrainSlash({ className }: { className?: string }) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <Brain className="h-4 w-4" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-5 h-0.5 bg-current rotate-45 rounded-full" />
      </div>
    </div>
  );
}

export function ChatInput({
  onSend,
  onStop,
  isLoading,
  hasMessages,
  isListening,
  isPlaying,
  onStartListening,
  onStopListening,
  onStopSpeaking,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (value.trim() && !isLoading) {
      onSend(value.trim());
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [value]);

  // Mic button: 4 states
  // recording=no, playing=no  → mic icon, default    → hold to record
  // recording=yes, playing=no → mic-off, red+pulse   → release to stop
  // recording=no, playing=yes → volume-x, red        → tap to stop playback
  // recording=yes, playing=yes → volume-x, red (prevented by clearing isPlaying on startListening)
  const micIcon = isPlaying && !isListening
    ? <VolumeX className="h-4 w-4" />
    : isListening
    ? <MicOff className="h-4 w-4" />
    : <Mic className="h-4 w-4" />;

  const micActive = isListening || isPlaying;

  const handleMicPointerDown = () => {
    if (!isListening && !isPlaying) onStartListening();
  };
  const handleMicPointerUp = () => {
    if (isListening) onStopListening();
    else if (isPlaying) onStopSpeaking();
  };

  return (
    <div className="flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isListening ? "Listening..." : hasMessages ? "Reply..." : "Tell me what to build..."}
        className="flex-1 resize-none rounded-xl border bg-background px-4 py-3.5 text-sm leading-5 outline-none focus:ring-2 focus:ring-ring min-h-[48px] max-h-[200px]"
        rows={1}
        disabled={isLoading}
      />

      {/* Mic button — always visible */}
      <Button
        size="icon"
        variant={micActive ? "destructive" : "outline"}
        onPointerDown={handleMicPointerDown}
        onPointerUp={handleMicPointerUp}
        onPointerLeave={() => { if (isListening) onStopListening(); }}
        className={`h-12 w-12 rounded-xl shrink-0 select-none${isListening ? " animate-pulse" : ""}`}
      >
        {micIcon}
      </Button>

      {/* Send/stop button — always visible */}
      <Button
        size="icon"
        variant={isLoading ? "destructive" : "default"}
        onClick={isLoading ? onStop : handleSubmit}
        disabled={!isLoading && !value.trim()}
        className="h-12 w-12 rounded-xl shrink-0"
      >
        {isLoading ? <BrainSlash /> : <SendHorizontal className="h-4 w-4" />}
      </Button>
    </div>
  );
}
