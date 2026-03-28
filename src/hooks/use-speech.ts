"use client";

import { useState, useRef, useCallback, useEffect } from "react";

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "some code")
    .replace(/`[^`]+`/g, "code")
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim();
}

export function useSpeech(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [rate, setRateState] = useState(1.15);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    if (localStorage.getItem("kidcode-tts-enabled") === "true") setTtsEnabled(true);
    const saved = parseFloat(localStorage.getItem("kidcode-tts-rate") ?? "");
    if (!isNaN(saved)) setRateState(saved);
  }, []);

  const setRate = useCallback((r: number) => {
    localStorage.setItem("kidcode-tts-rate", String(r));
    setRateState(r);
  }, []);

  const toggleTts = useCallback(() => {
    setTtsEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("kidcode-tts-enabled", String(next));
      if (!next) window.speechSynthesis?.cancel();
      return next;
    });
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!ttsEnabled) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(stripMarkdown(text));
      utterance.rate = rate;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    },
    [ttsEnabled, rate]
  );

  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) return;

    window.speechSynthesis?.cancel();
    setIsPlaying(false);

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript.trim();
      recognition.stop();
      if (transcript) onTranscriptRef.current(transcript);
    };
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
  }, []);

  return { isListening, isPlaying, ttsEnabled, toggleTts, rate, setRate, speak, startListening, stopListening, stopSpeaking };
}
