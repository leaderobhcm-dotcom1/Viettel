import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from '../types';
import { createChatSession } from '../services/geminiService';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { Chat, GenerateContentResponse } from "@google/genai";

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: 'Xin chào! Tôi là trợ lý ảo Viettel. Bạn đang tìm gói cước Internet hay Di động? Hãy chia sẻ nhu cầu của bạn nhé!' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Initialize Chat Session once
  useEffect(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = createChatSession();
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !chatSessionRef.current) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const resultStream = await chatSessionRef.current.sendMessageStream({ message: userMsg.text });
      
      let fullResponseText = '';
      const botMsgId = (Date.now() + 1).toString();
      
      // Add placeholder message
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '' }]);

      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        const text = c.text || '';
        fullResponseText += text;
        
        setMessages(prev => 
          prev.map(msg => msg.id === botMsgId ? { ...msg, text: fullResponseText } : msg)
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Xin lỗi, hiện tại tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <div 
        className={`pointer-events-auto bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 sm:w-96 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden ${
          isOpen ? 'opacity-100 scale-100 mb-4' : 'opacity-0 scale-0 mb-0 h-0'
        }`}
        style={{ maxHeight: '600px', height: '500px' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-viettel-red to-viettel-light p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-full">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Trợ Lý Viettel AI</h3>
              <p className="text-xs opacity-90 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-1 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-viettel-red text-white rounded-br-none' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start">
               <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                 <Loader2 size={16} className="animate-spin text-viettel-red" />
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-gray-100">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi về gói cước..."
              className="bg-transparent flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={`p-2 rounded-full transition-colors ${
                inputValue.trim() && !isLoading 
                  ? 'bg-viettel-red text-white hover:bg-viettel-dark' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send size={16} />
            </button>
          </div>
          <div className="text-[10px] text-center text-gray-400 mt-2">
            Được hỗ trợ bởi Google Gemini AI
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-gray-600 rotate-90' : 'bg-viettel-red animate-bounce'
        }`}
      >
        {isOpen ? (
          <X size={28} className="text-white" />
        ) : (
          <MessageCircle size={28} className="text-white" />
        )}
      </button>
    </div>
  );
};

export default ChatBot;
