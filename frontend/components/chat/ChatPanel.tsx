import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Loader2, Send, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useTranslation } from '../../hooks/useTranslation';

const ChatPanel: React.FC = () => {
  const {
    chatHistory,
    isChatLoading,
    handleSendChatMessage,
    currentAnalysis,
    suggestedQuestions,
    isSuggestionsLoading,
  } = useProjectContext();
  const { t } = useTranslation(['chat', 'common']);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isChatLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isChatLoading) {
      handleSendChatMessage(input.trim());
      setInput('');
    }
  };

  const handleSuggestionClick = (question: string) => {
    // We send the question directly because setState is async
    handleSendChatMessage(question);
    setInput('');
  };

  const projectName = currentAnalysis?.projectName || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl flex flex-col h-[70vh]"
    >
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">{t('chat:title')}</h2>
        <p className="text-sm text-gray-400">{t('chat:subtitle', { projectName })}</p>
      </div>
      <div className="flex-grow p-4 overflow-y-auto space-y-6">
        {chatHistory.length === 0 && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 flex flex-col justify-center h-full"
            >
              <div className="w-16 h-16 rounded-full bg-purple-900/50 flex items-center justify-center shrink-0 mx-auto">
                <Bot className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">{t('chat:welcomeTitle')}</h3>
              <p className="mt-1 text-gray-400">{t('chat:welcomeSubtitle', { projectName })}</p>

              <div className="mt-6 space-y-2 max-w-md mx-auto">
                {isSuggestionsLoading ? (
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('chat:generatingSuggestions')}</span>
                  </div>
                ) : (
                  suggestedQuestions.map((q, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => handleSuggestionClick(q)}
                      className="w-full text-left p-3 bg-gray-700/50 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      {q}
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
            )}
            <div className={`max-w-xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
              <div className="prose prose-invert prose-sm max-w-none text-gray-300 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-headings:text-white">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.parts[0].text}
                </ReactMarkdown>
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-gray-300" />
              </div>
            )}
          </div>
        ))}
        <AnimatePresence>
          {isChatLoading && (!chatHistory.length || chatHistory[chatHistory.length - 1]?.role === 'user') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
              <div className="max-w-xl p-3 rounded-lg bg-gray-700 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="text-sm text-gray-400 italic">{t('chat:thinking')}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={t('chat:placeholder')}
            disabled={isChatLoading}
            rows={1}
            className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-60"
          />
          <button title={t('chat:send')} type="submit" disabled={isChatLoading || !input.trim()} className="p-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ChatPanel;
