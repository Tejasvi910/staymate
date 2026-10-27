import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Loader2,
  RefreshCw,
  Building2,
  Clock,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const StudentAssistant = () => {
  const { user } = useAuth();

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.name || 'there'}! 👋 I am **StayMate AI**, your dedicated Campus Living Assistant.\n\nI can assist you with:\n- 🚪 **Hostel Gate Curfews & Late Pass Rules**\n- 🍽️ **Daily Mess Timings & Menus**\n- 🔧 **Filing or Tracking Maintenance Complaints**\n- 🧺 **Laundry & Campus Health Services**\n\nHow can I help you today?`,
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [contextDetails, setContextDetails] = useState(null);

  const defaultSuggestions = [
    'What are the hostel gate timings?',
    'What is for dinner tonight?',
    'How do I file a water leakage complaint?',
    'Where is the Warden Office located?',
    'What are the laundry room hours?',
  ];
  const [suggestions, setSuggestions] = useState(defaultSuggestions);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (overrideText) => {
    const text = overrideText || input;
    if (!text.trim() || isTyping) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await api.post('/assistant/chat', {
        message: text,
        history,
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.reply },
      ]);

      if (response.data.context) {
        setContextDetails(response.data.context);
      }

      if (response.data.suggestions && response.data.suggestions.length > 0) {
        setSuggestions(response.data.suggestions);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ I was unable to connect to the campus AI server. Please verify your connection or try again.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Chat session refreshed. How can I help you today, ${user?.name || 'Resident'}?`,
      },
    ]);
    setSuggestions(defaultSuggestions);
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl text-white shadow-lg shadow-indigo-600/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">StayMate Campus Assistant</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini 2.5 Active
              </span>
            </div>
            <p className="text-xs text-slate-400">Hostel Rules, Mess Timings & Grievance Guidance</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {contextDetails && (
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{contextDetails.room || 'Assigned Room'}</span>
            </div>
          )}

          <button
            onClick={resetChat}
            title="Reset conversation"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition border border-transparent hover:border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Suggested:
        </span>
        {suggestions.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(sug)}
            className="text-xs px-3.5 py-1 rounded-full bg-slate-800/90 hover:bg-indigo-600 hover:text-white text-slate-300 border border-slate-700/70 whitespace-nowrap transition shadow-sm"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Message History Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-indigo-700 to-violet-600 text-white border border-indigo-500/30'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-xl rounded-3xl px-5 py-3.5 text-sm leading-relaxed whitespace-pre-line shadow-lg ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-slate-800 text-indigo-400 flex items-center justify-center border border-slate-700 shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700/60 rounded-3xl rounded-tl-none px-5 py-3.5 text-xs text-slate-400 flex items-center gap-2 shadow-lg">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>StayMate AI is evaluating campus policies...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about curfews, today's dinner, room allocation, or laundry..."
            disabled={isTyping}
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentAssistant;
