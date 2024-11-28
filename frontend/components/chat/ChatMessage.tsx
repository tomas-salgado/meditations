import React, { useState } from 'react';
import { SourceModal } from './SourceModal';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    title: string;
    details: string;
    text: string;
    score: number;
  }>;
  isLoading?: boolean;
}

export const ChatMessage = ({ role, content, sources, isLoading }: ChatMessageProps) => {
  const [selectedSource, setSelectedSource] = useState<{ title: string; details: string; text: string; score: number } | null>(null);
  const isUser = role === 'user';
  
  if (isUser) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-serif text-emerald-400 mb-4">{content}</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sources && sources.length > 0 && (
        <div className="glass-effect rounded-xl p-6">
          <h3 className="text-lg font-medium text-emerald-400 mb-3">Sources</h3>
          <div className="flex hover:overflow-x-auto overflow-x-hidden gap-4 scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent">
            {sources.map((source, index) => (
              <div 
                key={index} 
                className="bg-emerald-500/10 px-6 py-4 rounded-lg border border-emerald-500/20 flex-shrink-0 min-w-[180px] cursor-pointer hover:bg-emerald-500/20 transition-colors"
                onClick={() => setSelectedSource(source)}
              >
                <div className="font-medium text-emerald-400/80 text-base mb-2">{source.title}</div>
                <div className="text-gray-400 text-sm">{source.details}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="glass-effect rounded-xl p-6">
        <h3 className="text-lg font-medium text-emerald-400 mb-3">Response</h3>
        <div className="prose prose-invert max-w-none">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-pulse h-2 w-2 rounded-full bg-emerald-400"></div>
              <div className="animate-pulse h-2 w-2 rounded-full bg-emerald-400 delay-75"></div>
              <div className="animate-pulse h-2 w-2 rounded-full bg-emerald-400 delay-150"></div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap leading-relaxed text-gray-300">{content}</p>
          )}
        </div>
      </div>

      {selectedSource && (
        <SourceModal
          title={selectedSource.title}
          content={selectedSource.details}
          text={selectedSource.text}
          onClose={() => setSelectedSource(null)}
        />
      )}
    </div>
  );
};
