import { useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import React from 'react';

interface Message {
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

export const ChatThread = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (question: string) => {
    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { role: 'user', content: question }]);

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Thinking...',
        sources: [],
        isLoading: true 
      }]);

      const sourcesResponse = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const { sources, passages } = await sourcesResponse.json();

      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.sources = sources;
        }
        return newMessages;
      });

      const answerResponse = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, passages }),
      });
      const { response } = await answerResponse.json();

      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = response;
          lastMessage.isLoading = false;
        }
        return newMessages;
      });
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = 'Sorry, there was an error processing your request.';
          lastMessage.isLoading = false;
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-5rem)]">
      <div className="flex-1 overflow-y-auto pb-32">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="glass-effect p-8 rounded-2xl max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-serif text-emerald-400 mb-4">Welcome to Meditations AI</h2>
              <p className="text-lg text-gray-300">
                Ask any question about Marcus Aurelius' Meditations and receive wisdom from the ancient Stoic philosophy.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 p-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} {...message} />
            ))}
          </div>
        )}
      </div>
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
};
