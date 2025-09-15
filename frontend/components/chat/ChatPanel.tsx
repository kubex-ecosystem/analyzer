import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Loader2, Send, User } from 'lucide-react';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from '../../hooks/useTranslation';
import { ChatMessage } from '../../types';

interface ChatPanelProps {
  history: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  projectName: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ history, isLoading, onSendMessage, projectName }) => {
  const { t } = useTranslation(['chat', 'common']);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

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
        {history.map((msg, index) => (
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
          {isLoading && (!history.length || history[history.length - 1]?.role === 'user') && (
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
            disabled={isLoading}
            rows={1}
            className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-60"
          />
          <button title={t('chat:send')} type="submit" disabled={isLoading || !input.trim()} className="p-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ChatPanel;
