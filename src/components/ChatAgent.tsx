/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { TvShow, ChatMessage, User, UserPreferences } from '../types';
import { Send, Sparkles, Tv, RefreshCw, MessageSquare, Bot, AlertCircle, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

interface ChatAgentProps {
  shows: TvShow[];
  preferences?: UserPreferences;
  onClose?: () => void;
  currentUser?: User | null;
}

const QUICK_PROMPTS = [
  {
    label: "🍿 Suggest what to watch next",
    prompt: "Analyze my followed shows list (genres, ratings, services) and recommend 3-5 real, exciting TV shows. Tell me where to stream them and why they match my taste!"
  },
  {
    label: "🍳 Recap Season 3 of The Bear",
    prompt: "Can you give me a quick, spoiler-friendly recap of what happened in Season 3 of The Bear? Focus on the main character arcs and what the season finale set up."
  },
  {
    label: "🎨 Lets chat about animation as art",
    prompt: "Let's chat about animation as a profound art form. Look at my list, highlight the animated shows, and let's discuss why animation is such an incredible medium!"
  },
  {
    label: "⭐️ Rate my taste",
    prompt: "Take a look at my followed TV shows list, my scores, and progress. Give me a fun, friendly 'taste analysis' or rating, pointing out any trends or hidden gems in my list."
  }
];

export const ChatAgent: React.FC<ChatAgentProps> = ({ shows, preferences, onClose, currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Dude, I’m all over your watchlist. Instead of scrolling endlessly until your grub gets cold, you can ask me to:\n\n- **Find your next jam**: I'll judge your current taste and tell you what to watch next (so you can stop scrolling looking for crap).\n- **Do a memory jog**: Need a quick recap because you definitely fell asleep three episodes ago? I got you.\n- **Spill the tea**: Let's nerd out over cast trivia, unhinged fan theories, and creator secrets.\n\nSo, what are we turning our brains off to today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Customize welcome greeting if the user is named Rafael and is opening the agent for the first time
  useEffect(() => {
    if (currentUser && currentUser.name.trim().toLowerCase() === 'rafael') {
      const storageKey = `seen_rafael_welcome_${currentUser.id}`;
      const hasSeen = localStorage.getItem(storageKey) === 'true';
      if (!hasSeen) {
        setMessages(prev => {
          if (prev.length > 0 && prev[0].id === 'welcome') {
            const updated = [...prev];
            updated[0] = {
              ...updated[0],
              content: "Coño, chico... Rafael, eh? I've heard about you. I'm turning on the guardrails before we go any further..."
            };
            return updated;
          }
          return prev;
        });
        localStorage.setItem(storageKey, 'true');
      }
    }
  }, [currentUser]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto focus input field when opened
  useEffect(() => {
    // Small timeout to guarantee element is rendered and interactive
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const payloadMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          shows: shows,
          preferences: preferences
        }),
      });

      if (!response.ok) {
        throw new Error("Spudz Agent encountered a transmission glitch. Let's try again.");
      }

      const data = await response.json();
      
      const botMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'model',
        content: data.content,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to reach Spudz.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm("Reset conversation history?")) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          content: "👋 Conversational blackboard cleared! What TV show or streaming recommendation should we scout out next?",
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full md:h-[680px] lg:h-[750px] max-h-full bg-[#1A1D23] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Agent Top Header */}
      <div className="p-4 border-b border-white/5 bg-[#0F1115]/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="p-2.5 bg-[#262A33] text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg border border-white/5">
              <Bot className="w-5 h-5" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#1A1D23]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-tight">Spudz</h3>
              <span className="px-1.5 py-0.5 text-[8px] font-extrabold bg-[#262A33] text-slate-400 border border-white/5 rounded tracking-widest uppercase">Agent</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Synced with your active watchlist</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-[#262A33] transition"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-[#262A33] transition"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Panel */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-3 bg-gradient-to-b from-[#1A1D23] to-[#0F1115]">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`rounded-2xl px-4 py-3 text-xs leading-relaxed border ${
                  msg.role === 'user'
                    ? 'max-w-[85%] bg-emerald-600 text-white border-transparent font-medium shadow-md shadow-emerald-950/15'
                    : 'w-full bg-[#262A33] text-slate-200 border-white/5 shadow-sm'
                }`}
              >
                {msg.role === 'model' ? (
                  <div className="markdown-body space-y-2">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex justify-start items-center gap-2 p-2 bg-[#0F1115]/20 rounded-xl"
          >
            <div className="p-1.5 bg-[#262A33] text-slate-400 border border-white/5 rounded-lg">
              <Bot className="w-3.5 h-3.5 animate-bounce" />
            </div>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce delay-200" />
              <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce delay-300" />
            </div>
          </motion.div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-2xl bg-rose-950/20 text-rose-300 border border-rose-900/30 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Suggested Quick Prompts Panel */}
        {messages.length === 1 && (
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block mb-0.5">Recommended Topics</span>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(qp.prompt)}
                  className="text-left px-3 py-2.5 rounded-xl bg-[#262A33]/50 border border-white/5 text-slate-400 hover:text-white hover:bg-[#262A33] text-xs font-semibold transition leading-tight flex items-center min-h-[44px]"
                >
                  <span>{qp.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input Form Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="px-4 py-3 border-t border-white/5 bg-[#0F1115]/40"
      >
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask Spudz..."
            className="w-full bg-[#1e222b] text-slate-100 pl-4 pr-12 py-3 rounded-2xl border-2 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.2)] focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 placeholder-slate-400 text-xs transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none transition"
            aria-label="Send Message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
