import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage, ChatSession, QuickAction } from '../../types';
import { TRANSLATIONS, QUICK_ACTIONS } from '../../i18n';
import { getCareerAssistantResponse } from '../../services/gemini';

interface CareerAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  session: ChatSession;
  onSessionUpdate: (session: ChatSession) => void;
  careerContext?: string;
  weakAreas?: string[];
}

const CareerAssistant: React.FC<CareerAssistantProps> = ({
  isOpen,
  onToggle,
  session,
  onSessionUpdate,
  careerContext,
  weakAreas,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (isOpen) {
      setHasUnread(false);
    }
  }, [isOpen]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    setInput('');
    setIsLoading(true);

    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const updatedMessages = [...session.messages, userMessage];
    onSessionUpdate({
      ...session,
      messages: updatedMessages,
      lastUpdated: Date.now(),
    });

    try {
      const response = await getCareerAssistantResponse(text, session.messages, {
        careerPath: careerContext,
        weakAreas,
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      onSessionUpdate({
        ...session,
        messages: [...updatedMessages, assistantMessage],
        lastUpdated: Date.now(),
      });

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      let errorContent = TRANSLATIONS.chat.error;
      const errorStr = String(error).toLowerCase();
      
      // Provide more specific error messages
      if (errorStr.includes('quota exceeded') || errorStr.includes('429')) {
        errorContent = TRANSLATIONS.chat.apiQuotaExceeded || "Shërbimi AI është i mbingarkuar. Provo përsëri më vonë.";
      } else if (errorStr.includes('api key') || errorStr.includes('not configured')) {
        errorContent = "Shërbimi AI nuk është konfiguruar. Kontakto përgjegjësin.";
      }
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: errorContent,
        timestamp: Date.now(),
      };
      onSessionUpdate({
        ...session,
        messages: [...updatedMessages, errorMessage],
        lastUpdated: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt);
  };

  const clearChat = () => {
    onSessionUpdate({
      messages: [],
      context: { userPreferences: {} },
      lastUpdated: Date.now(),
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('sq-AL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={onToggle}
        className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 md:w-16 md:h-16 brutalist-border bg-white text-black flex items-center justify-center font-bold text-xl ${
          hasUnread ? 'animate-pulse' : ''
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? '✕' : '💬'}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-40 w-[calc(100vw-2rem)] md:w-96 h-[70vh] md:h-[500px] brutalist-border bg-black flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 brutalist-border border-t-0 border-l-0 border-r-0 bg-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-white rotate-45 flex items-center justify-center bg-white text-black font-bold">
                    <span className="text-xs -rotate-45">B</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">{TRANSLATIONS.chat.title}</p>
                    <p className="text-[10px] text-gray-400">
                      {TRANSLATIONS.chat.subtitle}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clearChat}
                    className="text-xs px-2 py-1 border border-white/20 hover:bg-white/10 transition-all"
                    title="Bisedë e re"
                  >
                    ↺
                  </button>
                  <button
                    onClick={onToggle}
                    className="text-xs px-2 py-1 border border-white/20 hover:bg-white/10 transition-all"
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              {session.messages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 mb-4">
                    {TRANSLATIONS.chat.welcome}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action)}
                        className="p-3 text-left text-xs border border-white/20 hover:bg-white/10 transition-all"
                      >
                        <span className="text-lg">{action.icon}</span>
                        <p className="mt-1 font-medium">{action.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {session.messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 ${
                      msg.role === 'user'
                        ? 'bg-white text-black'
                        : 'bg-white/10 border border-white/20'
                    }`}
                    style={{
                      borderRadius:
                        msg.role === 'user'
                          ? '4px 4px 0 4px'
                          : '4px 4px 4px 0',
                    }}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                    <p
                      className={`text-[10px] mt-2 ${
                        msg.role === 'user' ? 'text-black/50' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 border border-white/20 p-3 rounded-lg rounded-bl-none">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                      <span
                        className="w-2 h-2 bg-white/50 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <span
                        className="w-2 h-2 bg-white/50 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions (when messages exist) */}
            {session.messages.length > 0 && session.messages.length < 4 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                {QUICK_ACTIONS.slice(0, 3).map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className="px-3 py-1 text-xs border border-white/20 hover:bg-white/10 transition-all whitespace-nowrap"
                  >
                    {action.icon} {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={TRANSLATIONS.chat.placeholder}
                  className="flex-1 bg-transparent border border-white/20 p-3 text-sm focus:border-white outline-none"
                  disabled={isLoading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="px-4 bg-white text-black font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-all"
                >
                  {TRANSLATIONS.chat.send}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CareerAssistant;
