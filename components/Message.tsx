
import React, { useState } from 'react';
import type { ChatMessage } from '../types';
import { MessageRole } from '../types';
import { IconUser, IconSparkles, IconSource, IconCopy, IconCheck } from './icons/Icons';

interface MessageProps {
  message: ChatMessage;
  isLoading?: boolean;
}

export const Message: React.FC<MessageProps> = ({ message, isLoading = false }) => {
  const isAssistant = message.role === MessageRole.ASSISTANT;
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (isLoading || !message.content) return;
    navigator.clipboard.writeText(message.content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset icon after 2 seconds
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className={`flex items-start gap-2 md:gap-3 group ${isAssistant ? '' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center ${isAssistant ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
        {isAssistant ? <IconSparkles className="w-5 h-5" /> : <IconUser className="w-5 h-5" />}
      </div>
      <div className={`relative max-w-[85%] md:max-w-2xl p-3 md:p-4 rounded-xl ${isAssistant ? 'bg-white dark:bg-gray-800 shadow-sm' : 'bg-indigo-500 text-white'}`}>
        {isAssistant && !isLoading && message.content && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1 rounded-md text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            aria-label={isCopied ? "Copied to clipboard" : "Copy to clipboard"}
          >
            {isCopied ? <IconCheck className="w-4 h-4 text-green-500" /> : <IconCopy className="w-4 h-4" />}
          </button>
        )}
        {isLoading ? (
            <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="italic">Thinking</span>
                <div className="flex items-center ml-2 space-x-1" aria-label="Processing request...">
                    <span className="dot-pulse dot-pulse-1"></span>
                    <span className="dot-pulse dot-pulse-2"></span>
                    <span className="dot-pulse dot-pulse-3"></span>
                </div>
            </div>
        ) : (
            <p className="text-sm md:text-base whitespace-pre-wrap pr-6 md:pr-8 leading-relaxed">{message.content}</p>
        )}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 md:mt-4 pt-3 border-t border-indigo-200 dark:border-indigo-400/20">
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5 text-indigo-900 dark:text-indigo-300">
              <IconSource className="w-4 h-4" />
              Sources
            </h4>
            <ul className="space-y-2 max-h-40 overflow-auto pr-1">
              {message.sources.map((source, index) => (
                <li key={index} className="text-xs md:text-sm text-indigo-800 dark:text-indigo-300/80 bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-md">
                  "{source}"
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
