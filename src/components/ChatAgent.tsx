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
  theme?: 'dark' | 'light';
}

const QUICK_PROMPTS = [
  {
    label: "Suggest what to watch next",
    prompt: "Analyze my followed shows list (genres, ratings, services) and recommend 3-5 real, exciting TV shows. Tell me where to stream them and why they match my taste!"
  },
  {
    label: "Rate my taste",
    prompt: "Take a look at my followed TV shows list, my scores, and progress. Give me a fun, friendly 'taste analysis' or rating, pointing out any trends or hidden gems in my list."
  }
];

export const ChatAgent: React.FC<ChatAgentProps> = ({ shows, preferences, onClose, currentUser, theme = 'dark' }) => {
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
    <div className={`flex flex-col h-full md:h-[680px] lg:h-[750px] max-h-full border rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative ${
      theme === 'dark' ? 'bg-[#161920] border-white/10 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Agent Top Header */}
      <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
        theme === 'dark' ? 'bg-[#181B22] border-white/10' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`p-2.5 rounded-2xl flex items-center justify-center border shadow-sm ${
              theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              <Bot className="w-5 h-5" />
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ${
              theme === 'dark' ? 'ring-[#181B22]' : 'ring-slate-50'
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-base sm:text-lg font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Spudz AI</h3>
              <span className={`px-2 py-0.5 text-[9px] font-extrabold border rounded-md tracking-wider uppercase ${
                theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>Agent</span>
            </div>
            <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Synced with your active watchlist</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className={`p-2 sm:p-1.5 rounded-xl transition cursor-pointer border ${
              theme === 'dark' ? 'bg-[#252932] hover:bg-[#313642] text-slate-300 hover:text-white border-white/5' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
            }`}
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 sm:p-1.5 rounded-xl transition cursor-pointer border ${
                theme === 'dark' ? 'bg-[#252932] hover:bg-[#313642] text-slate-300 hover:text-white border-white/5' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
              }`}
              title="Close Panel"
              aria-label="Close Panel"
            >
              <X className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Panel */}
      <div className={`flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-3 ${
        theme === 'dark' ? 'bg-[#111319]' : 'bg-slate-50/70'
      }`}>
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={`${msg.id}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`rounded-2xl px-4 py-3 text-xs leading-relaxed border ${
                  msg.role === 'user'
                    ? 'max-w-[85%] bg-emerald-600 text-white border-transparent font-medium shadow-md shadow-emerald-950/15'
                    : theme === 'dark'
                      ? 'w-full bg-[#1A1D25] text-slate-200 border-white/10 shadow-sm'
                      : 'w-full bg-white text-slate-900 border-slate-200 shadow-sm'
                }`}
              >
                {msg.role === 'model' ? (
                  <div className={`markdown-body space-y-2 ${theme === 'light' ? 'light text-slate-800' : 'text-slate-200'}`}>
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
            className={`flex justify-start items-center gap-2 p-2.5 rounded-xl border ${
              theme === 'dark' ? 'bg-[#1A1D25]/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className={`p-1.5 rounded-lg border ${
              theme === 'dark' ? 'bg-[#252932] text-emerald-400 border-white/5' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              <Bot className="w-3.5 h-3.5 animate-bounce" />
            </div>
            <div className="flex gap-1">
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce delay-100 ${theme === 'dark' ? 'bg-slate-500' : 'bg-slate-400'}`} />
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce delay-200 ${theme === 'dark' ? 'bg-slate-500' : 'bg-slate-400'}`} />
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce delay-300 ${theme === 'dark' ? 'bg-slate-500' : 'bg-slate-400'}`} />
            </div>
          </motion.div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-2xl bg-rose-950/30 text-rose-300 border border-rose-800/40 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Suggested Quick Prompts Panel */}
        {messages.length === 1 && (
          <div className="space-y-2 pt-2">
            <span className={`text-[10px] font-extrabold uppercase tracking-widest block mb-1 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}>Recommended Topics</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(qp.prompt)}
                  className={`text-left px-3.5 py-3 rounded-xl border text-xs font-semibold transition leading-tight flex items-center min-h-[44px] cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-[#1A1D25] border-white/10 text-slate-300 hover:text-white hover:bg-[#222632] hover:border-emerald-500/40'
                      : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 hover:border-emerald-500/50 shadow-sm'
                  }`}
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
        className={`p-3 sm:p-4 border-t ${
          theme === 'dark' ? 'border-white/10 bg-[#14171F]' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask Spudz..."
            className={`w-full pl-4 pr-12 py-3 rounded-2xl border text-xs focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-[#1C202B] text-slate-100 border-white/10 placeholder-slate-400'
                : 'bg-white text-slate-900 border-slate-200 placeholder-slate-400 shadow-sm'
            }`}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
            aria-label="Send Message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
