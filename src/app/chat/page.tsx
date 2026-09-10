"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackButton } from "@/components/layout/back-button";
import { useGamificationStore } from "@/store/gamification-store";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const initialMessage: Message = {
  role: "assistant",
  content: "Assalamu'alaikum! Saya Zad Mentor. Siap mendampingi Anda mendalami Al-Qur'an, fikih, dan bekal ibadah harian. Ada yang ingin didiskusikan hari ini?"
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addXp, incrementChat } = useGamificationStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    incrementChat();
    addXp(5, "Tanya AI");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: messages.slice(-5) }),
      });

      const data = await response.json();
      const assistantMessage: Message = { 
        role: "assistant", 
        content: data.reply || "Maaf, terjadi kesalahan. Silakan coba lagi." 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = { 
        role: "assistant", 
        content: "Maaf, terjadi kesalahan koneksi. Pastikan API key sudah benar di .env.local" 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "Apa arti QS. Al-Fatihah ayat 1?",
    "Bagaimana tata cara wudhu?",
    "Doa apa yang dibaca saat sakit?",
    "Siapa saja para Nabi?",
    "Apa itu zakat?",
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <BackButton />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-primary to-teal rounded-xl">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold">Zad Mentor AI</h1>
        </div>
        <p className="text-muted-foreground">Tanya jawab seputar Al-Qur'an, fikih, doa, dan bekal ibadah harian</p>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden flex flex-col h-[calc(100dvh-220px)] min-h-[480px] max-h-[720px]">
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 mb-6 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`p-2 rounded-lg h-fit ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`flex-1 ${msg.role === "user" ? "text-right" : ""}`}>
                  <div className={`inline-block max-w-[85%] px-4 py-3 rounded-2xl ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          ul: ({ children }) => <ul className="my-2 ml-5 list-disc space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="my-2 ml-5 list-decimal space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="pl-1">{children}</li>,
                          code: ({ children }) => <code className="rounded bg-background/70 px-1 py-0.5 text-xs font-mono">{children}</code>,
                          blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/40 pl-3 italic text-muted-foreground">{children}</blockquote>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {isLoading && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
              <span className="text-sm">Sedang berpikir...</span>
            </div>
          </div>
        )}

        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
            <Input
              placeholder="Tanya tentang Islam, Al-Qur'an, doa..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-primary to-teal"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => setInput(question)}
                className="text-xs"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
