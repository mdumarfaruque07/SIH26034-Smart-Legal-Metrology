import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, BookOpen, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';
import { askLMCopilot } from '../services/api';

export default function LMCopilotModal({ isOpen, onClose, currentInspectionId }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Namaste Officer! I am LM-Copilot, your Legal Metrology Act 2009 & Packaged Commodities Rules AI assistant. Ask me anything regarding mandatory declarations, penalties, or compliance clauses.",
      suggestedActions: [
        "Is Unit Sale Price mandatory for 250g packaged food?",
        "What is the penalty under Section 39 of LM Act?",
        "What are the rules for imported commodities country of origin?"
      ]
    }
  ]);

  if (!isOpen) return null;

  const handleSend = async (textToSend) => {
    const q = textToSend || query;
    if (!q.trim() || isLoading) return;

    const userMsg = { sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await askLMCopilot(q, currentInspectionId);
      const botMsg = {
        sender: 'bot',
        text: res.answer,
        rules: res.relevant_rules,
        suggestedActions: res.suggested_actions
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: "Sorry Officer, I encountered an error connecting to the Legal Metrology AI database." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm p-4 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-900/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Bot className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                LM-Copilot AI Legal Assistant
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  SIH26034
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Legal Metrology Act 2009 & PC Rules 2011/2021</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none shadow'
                }`}
              >
                {m.sender === 'bot' && (
                  <div className="flex items-center gap-1.5 font-bold text-indigo-400 mb-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" /> LM Statutory Assistant
                  </div>
                )}
                <p>{m.text}</p>

                {/* Relevant Rules Badge */}
                {m.rules && m.rules.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex flex-wrap gap-1">
                    {m.rules.map((r, rIdx) => (
                      <span
                        key={rIdx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900/80 text-amber-300 border border-amber-500/30 flex items-center gap-1"
                      >
                        <BookOpen className="w-2.5 h-2.5" /> {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggested Follow-up Actions */}
              {m.suggestedActions && (
                <div className="mt-2.5 space-y-1.5 w-full">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Suggested Queries:</p>
                  <div className="flex flex-col gap-1">
                    {m.suggestedActions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSend(action)}
                        className="text-left text-xs px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-indigo-300 hover:bg-slate-800 hover:border-indigo-500 transition flex items-center justify-between group"
                      >
                        <span>{action}</span>
                        <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-indigo-400 bg-slate-800/50 p-3 rounded-xl border border-slate-700/40 w-fit animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin" /> Analyzing Legal Metrology Act database...
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI Legal Copilot (e.g. Penalty under Section 39)..."
            className="flex-1 bg-slate-900 border border-slate-700/70 text-white placeholder-slate-500 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !query.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
