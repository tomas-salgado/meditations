import { useState, KeyboardEvent } from 'react';
import React from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0">
      <div className="glass-effect border-t border-gray-800/50">
        <div className="container mx-auto max-w-4xl p-6">
          <div className="flex gap-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Ask a question..."
              className="flex-1 bg-gray-800/50 text-gray-100 rounded-xl p-4 resize-none h-[60px] backdrop-blur-sm border border-gray-700/50 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={disabled || !message.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 rounded-xl font-medium disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors"
            >
              {disabled ? (
                <span className="animate-pulse">Thinking...</span>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
