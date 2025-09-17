
import React, { useState, useCallback, useEffect } from 'react';
import { DocumentInput } from './components/DocumentInput';
import { ChatInterface } from './components/ChatInterface';
import type { ChatMessage } from './types';
import { MessageRole } from './types';
import { getAnswerFromContext } from './services/geminiService';
import { IconBook, IconSparkles } from './components/icons/Icons';

const App: React.FC = () => {
  const [documentText, setDocumentText] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Initialize theme from localStorage or system preference
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme class to root
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isDark) {
      root.classList.add('dark');
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleDocumentSubmit = (text: string) => {
    setDocumentText(text);
    setChatMessages([
      {
        role: MessageRole.ASSISTANT,
        content: "I have processed the document. What would you like to know?",
      },
    ]);
    setError(null);
  };

  const handleSendMessage = useCallback(async (message: string) => {
    if (!documentText) {
      setError("Please provide some document text first.");
      return;
    }

    const userMessage: ChatMessage = { role: MessageRole.USER, content: message };
    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAnswerFromContext(documentText, message);
      const assistantMessage: ChatMessage = {
        role: MessageRole.ASSISTANT,
        content: result.answer,
        sources: result.sources,
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Sorry, I couldn't get an answer. ${errorMessage}`);
      const errorAssistantMessage: ChatMessage = {
        role: MessageRole.ASSISTANT,
        content: `Sorry, I ran into an error. Please try again. Details: ${errorMessage}`,
      };
      setChatMessages(prev => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [documentText]);

  return (
    <div className="min-h-screen font-sans bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col md:flex-row">
      {/* Left: Document panel (stacks on mobile) */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3 bg-white dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <IconBook className="h-6 w-6 text-indigo-500"/>
              <h1 className="text-lg md:text-xl font-bold">Document Context</h1>
            </div>
            <button
              onClick={() => setIsDark(prev => !prev)}
              className="ml-auto text-xs md:text-sm px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? 'Light' : 'Dark'}
            </button>
        </div>
        <DocumentInput onSubmit={handleDocumentSubmit} />
      </div>

      {/* Right: Chat panel */}
      <div className="w-full md:w-2/3 flex flex-col">
         <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 bg-white dark:bg-gray-800/50 shadow-sm sticky top-0">
            <IconSparkles className="h-6 w-6 text-indigo-500"/>
            <h1 className="text-lg md:text-xl font-bold">AI Learning Assistant</h1>
        </div>
        <ChatInterface
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isDocumentLoaded={!!documentText}
        />
        {error && <div className="p-4 text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border-t border-gray-200 dark:border-gray-700">{error}</div>}
      </div>
    </div>
  );
};

export default App;
