import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
// Fix: Import MessageRole to use its enum members instead of string literals for type safety.
import { MessageRole } from '../types';
import { Message } from './Message';
import { IconSend } from './icons/Icons';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isDocumentLoaded: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, isDocumentLoaded }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading && isDocumentLoaded) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900/50">
      <div className="flex-grow p-4 md:p-6 overflow-y-auto">
        <div className="flex flex-col gap-3 md:gap-4">
          {messages.map((msg, index) => (
            <Message key={index} message={msg} />
          ))}
          {/* Use MessageRole.ASSISTANT and pass empty content for the loading indicator */}
          {isLoading && <Message message={{ role: MessageRole.ASSISTANT, content: '' }} isLoading={true} />}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-3 md:p-4 bg-white dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isDocumentLoaded ? "Ask a question about the document..." : "Please process a document first"}
            disabled={isLoading || !isDocumentLoaded}
            className="w-full px-4 py-2.5 md:py-3 pr-12 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim() || !isDocumentLoaded}
            className="absolute inset-y-0 right-0 flex items-center justify-center w-10 md:w-12 h-full text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            <IconSend className="w-6 h-6"/>
          </button>
        </div>
      </div>
    </div>
  );
};