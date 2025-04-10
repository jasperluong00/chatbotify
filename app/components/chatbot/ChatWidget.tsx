'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPipelineInitialized, setIsPipelineInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check pipeline initialization status when chat is opened
  useEffect(() => {
    if (isOpen) {
      checkInitializationStatus();
    }
  }, [isOpen]);

  const checkInitializationStatus = async () => {
    try {
      const response = await fetch('/api/chatbot/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: '__check_init__' }), // Special query to check initialization
      });

      const data = await response.json();
      
      if (response.status === 503) {
        // Still initializing
        setIsPipelineInitialized(false);
        // Check again in 1 second
        setTimeout(checkInitializationStatus, 1000);
      } else if (response.status === 200) {
        // Initialized successfully
        setIsPipelineInitialized(true);
        setInitializationError(null);
      } else {
        // Other error
        setInitializationError(data.error || 'Failed to initialize');
      }
    } catch (error) {
      console.error('Error checking initialization:', error);
      setInitializationError('Failed to connect to the server');
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isPipelineInitialized) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      });

      if (response.status === 503) {
        // Pipeline not initialized
        setIsPipelineInitialized(false);
        throw new Error('System is still initializing');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading UI Component
  const LoadingUI = () => (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="mb-6 text-4xl animate-bounce">🚀</div>
      <div className="mb-4 text-center text-lg font-medium text-gray-700 dark:text-gray-300">
        Preparing for takeoff...
      </div>
      <div className="w-full max-w-xs">
        <div className="mb-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div className="h-full w-full animate-pulse bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400" />
        </div>
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          {initializationError || 'Initializing AI systems...'}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-600 dark:from-blue-500 dark:to-blue-400"
      >
        <MessageSquare className="h-6 w-6" />
      </motion.button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 flex h-[600px] w-[400px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl transition-colors dark:bg-gray-900"
          >
            {/* Fixed Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-500 p-4 shadow-md dark:border-gray-700 dark:from-blue-500 dark:to-blue-400">
              <div className="flex items-center space-x-2">
                <Bot className="h-6 w-6 text-white" />
                <h2 className="text-lg font-semibold text-white">Chatbotify Assistant</h2>
              </div>
              <button
                onClick={toggleChat}
                className="rounded-full p-1.5 text-white transition-colors hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Container with Padding for Header */}
            <div className="mt-16 flex flex-1 flex-col overflow-hidden bg-gray-50 dark:bg-gray-800">
              {!isPipelineInitialized ? (
                <LoadingUI />
              ) : (
                <div className="flex flex-1 flex-col space-y-4 overflow-y-auto p-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white dark:from-blue-500 dark:to-blue-400'
                            : 'bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <span className="mt-1 block text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-700">
                        <div className="flex space-x-2">
                          <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 dark:bg-blue-400" />
                          <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 dark:bg-blue-400" style={{ animationDelay: '0.2s' }} />
                          <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 dark:bg-blue-400" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Fixed Input and Footer Section */}
            <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isPipelineInitialized 
                      ? "Type your message..." 
                      : "Please wait while the system initializes..."}
                    disabled={!isPipelineInitialized}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 transition-colors focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={!isPipelineInitialized || isLoading}
                    className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 p-2 text-white transition-all hover:from-blue-700 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:from-blue-500 dark:to-blue-400"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
              
              {/* Footer */}
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-500 opacity-70 dark:text-gray-400">
                  powered by chatbotify
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 