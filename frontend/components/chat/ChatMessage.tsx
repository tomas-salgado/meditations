import React from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`
        relative max-w-[85%] rounded-2xl p-6 shadow-lg
        ${isUser ? 'bg-emerald-600 text-white' : 'bg-gray-800/50 text-gray-100 backdrop-blur-sm'}
        ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}
      `}>
        <div className="text-sm text-gray-400 mb-2">
          {isUser ? 'You' : 'Marcus Aurelius AI'}
        </div>
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
      </div>
    </div>
  );
};
