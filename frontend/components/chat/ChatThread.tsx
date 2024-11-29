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
  const [inputMessage, setInputMessage] = useState('');

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

  const handleExampleClick = (text: string) => {
    setInputMessage(text);
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-5rem)]">
      <div className="flex-1 overflow-y-auto pb-32">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="glass-effect p-8 rounded-2xl max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-serif text-emerald-400 mb-4">Welcome to Aurelius</h2>
              <p className="text-lg text-gray-300 mb-6">
                Seek guidance through the lens of Stoic philosophy for life's challenges, decisions, and questions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-gray-800/50 p-6 rounded-xl">
                  <h3 className="text-emerald-400 font-medium mb-3">Personal Situations</h3>
                  <div className="space-y-3 text-left text-gray-300">
                    <p 
                      className="text-sm hover:text-emerald-400 cursor-pointer transition-colors"
                      onClick={() => handleExampleClick("I constantly feel stressed from work. How can I find better balance in my life?")}
                    >
                      "I constantly feel stressed from work. How can I find better balance in my life?"
                    </p>
                    <p 
                      className="text-sm hover:text-emerald-400 cursor-pointer transition-colors"
                      onClick={() => handleExampleClick("I'm overwhelmed by the news and global events. How do I find peace?")}
                    >
                      "I'm overwhelmed by the news and global events. How do I find peace?"
                    </p>
                  </div>
                </div>

                <div className="bg-gray-800/50 p-6 rounded-xl">
                  <h3 className="text-emerald-400 font-medium mb-3">Philosophical Inquiries</h3>
                  <div className="space-y-3 text-left text-gray-300">
                    <p 
                      className="text-sm hover:text-emerald-400 cursor-pointer transition-colors"
                      onClick={() => handleExampleClick("How do the Stoics define virtue, and why is it considered the highest good?")}
                    >
                      "How do the Stoics define virtue, and why is it considered the highest good?"
                    </p>
                    <p 
                      className="text-sm hover:text-emerald-400 cursor-pointer transition-colors"
                      onClick={() => handleExampleClick("What is the relationship between happiness and external success in life?")}
                    >
                      "What is the relationship between happiness and external success in life?"
                    </p>
                  </div>
                </div>
              </div>
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
      <ChatInput 
        onSend={handleSendMessage} 
        disabled={isLoading} 
        inputMessage={inputMessage} 
        setInputMessage={setInputMessage}
      />
    </div>
  );
};
