import React, { useState, useRef, useEffect } from 'react';
import { Message, Plan } from '../types';
import { MessageSquare, Send, X, Bot, User, Loader2, ChevronRight, Search } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

type ChatStep = 'initial' | 'mobile_price' | 'internet_price' | 'results';

const ChatBot: React.FC = () => {
  const { plans } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ChatStep>('initial');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Xin chào! Tôi là trợ lý ảo Viettel. Bạn đang quan tâm đến dịch vụ nào?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOptionSelect = (option: string, value: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: option };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    setTimeout(() => {
      let nextStep: ChatStep = 'initial';
      let responseText = '';
      let filteredPlans: Plan[] = [];

      if (value === 'mobile') {
        nextStep = 'mobile_price';
        responseText = 'Bạn muốn tìm gói di động trong khoảng giá nào?';
      } else if (value === 'internet') {
        nextStep = 'internet_price';
        responseText = 'Bạn muốn tìm gói Internet trong khoảng giá nào?';
      } else if (value.startsWith('price_')) {
        nextStep = 'results';
        const [_, type, range] = value.split('_');
        
        filteredPlans = plans.filter(p => {
          const priceNum = parseInt(p.price.replace(/\./g, ''));
          if (type === 'mobile' && p.type !== 'MOBILE') return false;
          if (type === 'internet' && p.type !== 'INTERNET') return false;

          if (range === 'under100') return priceNum < 100000;
          if (range === '100to200') return priceNum >= 100000 && priceNum <= 200000;
          if (range === 'over200') return priceNum > 200000;
          return true;
        });

        if (filteredPlans.length > 0) {
          responseText = 'Đây là các gói cước phù hợp với nhu cầu của bạn:';
        } else {
          responseText = 'Rất tiếc, hiện chưa có gói cước nào trong tầm giá này. Bạn có thể liên hệ Zalo: 098x.xxx.xxx để được tư vấn gói riêng biệt.';
        }
      }

      setStep(nextStep);
      const modelMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText,
        customData: filteredPlans.length > 0 ? filteredPlans : undefined
      };
      setMessages(prev => [...prev, modelMsg]);
      setIsLoading(false);
    }, 600);
  };

  const renderTable = (plans: Plan[]) => (
    <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden text-[11px]">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 border-b border-gray-200 font-bold">Gói cước</th>
            <th className="p-2 border-b border-gray-200 font-bold">Giá</th>
            <th className="p-2 border-b border-gray-200 font-bold">Ưu đãi</th>
          </tr>
        </thead>
        <tbody>
          {plans.map(p => (
            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
              <td className="p-2 border-b border-gray-100 font-bold text-viettel-red">{p.name}</td>
              <td className="p-2 border-b border-gray-100">{p.price}</td>
              <td className="p-2 border-b border-gray-100">
                {p.type === 'MOBILE' ? `${p.data} + ${p.calls}` : p.speed || 'Tốc độ cao'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderOptions = () => {
    if (step === 'initial') {
      return (
        <div className="flex flex-col gap-2">
          <button onClick={() => handleOptionSelect('Di động', 'mobile')} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-viettel-red hover:text-viettel-red transition-all group">
            <span className="font-medium">Nhu cầu Di động</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={() => handleOptionSelect('Internet - Wifi', 'internet')} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-viettel-red hover:text-viettel-red transition-all group">
            <span className="font-medium">Internet - Wifi</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      );
    }

    if (step === 'mobile_price' || step === 'internet_price') {
      const type = step === 'mobile_price' ? 'mobile' : 'internet';
      return (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleOptionSelect('Dưới 100k', `price_${type}_under100`)} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold hover:border-viettel-red hover:text-viettel-red transition-all">Dưới 100k</button>
          <button onClick={() => handleOptionSelect('100k - 200k', `price_${type}_100to200`)} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold hover:border-viettel-red hover:text-viettel-red transition-all">100k - 200k</button>
          <button onClick={() => handleOptionSelect('Trên 200k', `price_${type}_over200`)} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold hover:border-viettel-red hover:text-viettel-red transition-all">Trên 200k</button>
          <button onClick={() => handleOptionSelect('Tất cả gói', `price_${type}_all`)} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold hover:border-viettel-red hover:text-viettel-red transition-all">Tất cả gói</button>
          <button onClick={() => { setStep('initial'); setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Bạn muốn quay lại chọn dịch vụ nào?' }]); }} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-xs font-bold hover:bg-gray-200 transition-all">Quay lại</button>
        </div>
      );
    }

    if (step === 'results') {
      return (
        <button onClick={() => setStep('initial')} className="w-full py-2 bg-viettel-red text-white rounded-xl text-sm font-bold hover:bg-viettel-dark transition-all">
          Tìm kiếm gói cước khác
        </button>
      );
    }

    return null;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-80 md:w-96 h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-viettel-red p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Trợ lý ảo Viettel</h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-[10px] opacity-80">Đang trực tuyến</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-hide bg-gray-50/30">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-viettel-red'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-viettel-red text-white rounded-tr-none shadow-md shadow-red-100' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'}`}>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    {msg.customData && renderTable(msg.customData as Plan[])}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-red-50 text-viettel-red flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none">
                    <Loader2 size={16} className="animate-spin text-viettel-red" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Interaction Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            {renderOptions()}
            <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400 justify-center">
              <Search size={10} /> Nhập "Zalo" để được hỗ trợ trực tiếp
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-viettel-red text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-95"
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
};

export default ChatBot;
