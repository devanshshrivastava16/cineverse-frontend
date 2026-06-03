import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Film } from 'lucide-react';
import { chatAPI } from '../services/api';

// Define message types
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

// Helper to format chatbot responses (handles bold text and line breaks)
const formatMessage = (text: string) => {
  return text.split('\n').map((line, i, arr) => (
    <React.Fragment key={i}>
      {line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
      {i !== arr.length - 1 && <br />}
    </React.Fragment>
  ));
};

export default function CineBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I am CineBot. What kind of movie or show are you in the mood for today?',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Recommend sci-fi movies",
    "Movies like Interstellar",
    "Best thriller shows",
    "Hidden gems"
  ];

  // Auto-scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // 1. Add User Message
    const newUserMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // 2. Call actual API
      const response = await chatAPI.sendMessage(text);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data?.reply || response.data?.message || 'Sorry, I did not understand that.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error('Chat API Error:', error);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I am having trouble connecting to the server right now. Please try again later.',
        sender: 'bot',
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div className="min-h-[80vh] flex flex-col bg-[#0a0a0a] text-white font-sans max-w-4xl mx-auto border border-white/10 rounded-2xl overflow-hidden shadow-2xl mt-8">
      
      {/* --- HEADER --- */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10 p-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-lg shadow-red-600/20">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight flex items-center gap-2">
              CineBot <Sparkles size={16} className="text-yellow-500" />
            </h2>
            <p className="text-xs text-green-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
      </div>

      {/* --- CHAT WINDOW --- */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex max-w-[85%] sm:max-w-[75%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className="flex-shrink-0 mt-1">
                {msg.sender === 'bot' ? (
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <Film size={14} className="text-gray-300" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                    <User size={14} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Message Bubble */}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-red-600 text-white rounded-tr-sm shadow-md' 
                  : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm backdrop-blur-sm shadow-md'
              }`}>
                {msg.sender === 'bot' ? formatMessage(msg.text) : msg.text}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={14} className="text-gray-300" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 flex items-center gap-1.5 backdrop-blur-sm">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        
        {/* Invisible div to snap scroll to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* --- INPUT AREA --- */}
      <div className="p-4 sm:p-6 bg-[#0a0a0a] border-t border-white/10 z-10 relative">
        
        {/* Suggested Questions */}
        {messages.length <= 2 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(question)}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300 transition-colors whitespace-nowrap"
              >
                {question}
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={onSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask for a recommendation..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-4 pr-14 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all backdrop-blur-sm"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
          >
            <Send size={18} className={inputValue.trim() ? "ml-0.5" : ""} />
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-500 mt-3">
          CineBot uses your watch history and ratings to provide personalized recommendations.
        </p>
      </div>
    </div>
  );
}