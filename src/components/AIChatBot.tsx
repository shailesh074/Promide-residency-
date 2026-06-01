/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { MessageSquare, Sparkles, X, Send, Trash2, ShieldAlert } from 'lucide-react';

export const AIChatBot: React.FC = () => {
  const { chatHistory, sendConciergeChat, clearChat } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    'How much is the Luxury Suite?',
    'What features are in Room 101?',
    'Tell me about plantation tours.',
    'Where is the resort located?'
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;
    setInputText('');
    setIsSending(true);
    try {
      await sendConciergeChat(textToSend);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 select-none">
      
      {/* TRIGGER LAUNCHER ORB */}
      {!isOpen && (
        <button
          id="concierge-orb"
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full bg-navy-950 border border-gold/40 text-gold flex items-center justify-center hover:border-gold hover:text-white shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer active:scale-95"
          title="Consult Sovereign, our AI Grand Concierge"
        >
          {/* Subtle slow spinning golden outer dust indicator */}
          <span className="absolute animate-spin rounded-full border border-dashed border-gold/45 w-14 h-14 opacity-20 pointer-events-none"></span>
          <Sparkles className="w-5 h-5 animate-pulse" />
        </button>
      )}

      {/* CHAT CONCEPTS BOX */}
      {isOpen && (
        <div
          id="concierge-box"
          className="w-[325px] sm:w-[380px] h-[480px] rounded-2xl bg-navy-950/95 backdrop-blur-md border border-gold/20 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform scale-100 origin-bottom-left"
        >
          
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-navy-900 to-navy-950 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center bg-gold/5">
                  <Sparkles className="w-4 h-4 text-gold" />
                </div>
                {/* Glowing green online node */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-navy-950 rounded-full animate-pulse"></span>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white tracking-wider uppercase font-sans">Sovereign Concierge</h3>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest leading-none">Resort AI Active</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={clearChat}
                title="Flush communication logs"
                className="p-1.5 rounded-full hover:bg-white/5 text-white/40 hover:text-gold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrolling message logs */}
          <div
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-white/10"
          >
            {chatHistory.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      isAssistant
                        ? 'bg-white/5 text-white/90 border border-white/5 font-normal'
                        : 'bg-gold text-black font-medium rounded-tr-none'
                    }`}
                  >
                    <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                    <span
                      className={`text-[8px] mt-1 block text-right font-mono ${
                        isAssistant ? 'text-white/30' : 'text-black/40'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex justify-start">
                <div className="bg-white/5 text-white/50 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
          </div>

          {/* Quick recommendations pills */}
          <div className="px-3 py-2 bg-navy-950/50 border-t border-white/5">
            <p className="text-[8.5px] font-mono text-white/30 uppercase tracking-widest mb-1.5">Concierge Quick Inquiries</p>
            <div className="flex flex-wrap gap-1">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(qp)}
                  className="text-[10px] text-gold/80 hover:text-white bg-gold/5 border border-gold/10 hover:border-gold/30 px-2 py-1 rounded-md transition duration-200 uppercase tracking-wide truncate max-w-[170px]"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Input control block */}
          <div className="p-3 bg-navy-900 border-t border-white/5 flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend(inputText);
              }}
              placeholder="Inquire about luxury services..."
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/40 placeholder-white/30"
            />
            <button
              onClick={() => handleSend(inputText)}
              disabled={!inputText.trim() || isSending}
              className="p-2 bg-gold disabled:bg-gold/30 hover:bg-white text-black rounded-lg transition-colors duration-200"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
